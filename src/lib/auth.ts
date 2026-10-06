import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
    registrationNumber?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      registrationNumber?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    registrationNumber?: string | null;
  }
}

const loginSchema = z.object({
  email: z.string().min(1, "Insira o seu ID de registo"),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/entrar",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        impersonateToken: { label: "Impersonate Token", type: "text" },
      },
      async authorize(credentials) {
        // Admin Impersonation Support
        if (typeof credentials?.impersonateToken === "string" && credentials.impersonateToken) {
          try {
            const target = await prisma.user.findFirst({
              where: {
                resetToken: credentials.impersonateToken,
                resetTokenExpiry: { gt: new Date() },
              },
            });
            if (target) {
              await prisma.user.update({
                where: { id: target.id },
                data: { resetToken: null, resetTokenExpiry: null },
              });
              return {
                id: target.id,
                email: target.email,
                name: target.name,
                role: target.role,
              };
            }
          } catch {
            return null;
          }
          return null;
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.email.trim();

        const { rateLimit } = await import("@/lib/rate-limit");
        const rl = rateLimit(`login:${identifier.toLowerCase()}`, 10, 15 * 60 * 1000);
        if (!rl.ok) return null;

        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { registrationNumber: { equals: identifier, mode: "insensitive" } },
                { email: { equals: identifier.toLowerCase(), mode: "insensitive" } },
              ],
            },
          });
          if (!user) return null;
          if (user.isActive === false) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            registrationNumber: user.registrationNumber,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.registrationNumber = user.registrationNumber;
      }
      if (trigger === "update" && token.id) {
        try {
          const fresh = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, name: true, registrationNumber: true },
          });
          if (fresh) {
            token.role = fresh.role;
            token.name = fresh.name;
            token.registrationNumber = fresh.registrationNumber;
          }
        } catch {
          /* keep token */
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.registrationNumber = token.registrationNumber as string | null | undefined;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
});

export function requireRole(role: Role | Role[], userRole: Role): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(userRole);
}
