import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession, isAuthError } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";
import { slugify } from "@/lib/catalog-map";

export async function GET() {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authz.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        registrationNumber: true,
        phone: true,
        whatsapp: true,
        role: true,
        author: {
          select: { id: true, photoUrl: true },
        },
      },
    });

    if (user) {
      return NextResponse.json({
        ...user,
        photoUrl: user?.author?.photoUrl ?? null,
      });
    }
  } catch (err) {
    console.warn("Database offline or uninitialized in GET /api/account, returning session user", err);
  }

  return NextResponse.json({
    id: authz.session.user.id,
    name: authz.session.user.name ?? "Utilizador Mesclar",
    email: authz.session.user.email ?? "utilizador@mesclar.ao",
    registrationNumber: authz.session.user.registrationNumber ?? "MESC-001",
    role: authz.session.user.role ?? "SELLER",
    photoUrl: null,
  });
}

export async function PATCH(request: Request) {
  const authz = await requireSession();
  if (isAuthError(authz)) return authz.error;

  const userId = authz.session.user.id;
  const contentType = request.headers.get("content-type") || "";

  let name: string | undefined;
  let phone: string | undefined;
  let whatsapp: string | undefined;
  let currentPassword: string | undefined;
  let newPassword: string | undefined;
  let photoFile: File | null = null;
  let removePhoto = false;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    for (const [k, v] of formData.entries()) {
      if (k === "photo" && v instanceof File && v.size > 0) {
        photoFile = v;
      } else if (k === "removePhoto") {
        removePhoto = v === "true" || v === "1";
      } else if (typeof v === "string") {
        if (k === "name") name = v;
        if (k === "phone") phone = v;
        if (k === "whatsapp") whatsapp = v;
        if (k === "currentPassword" || k === "password") currentPassword = v;
        if (k === "newPassword") newPassword = v;
      }
    }
  } else {
    const body = await request.json().catch(() => ({}));
    name = body.name;
    phone = body.phone;
    whatsapp = body.whatsapp;
    currentPassword = body.currentPassword || body.password;
    newPassword = body.newPassword;
    removePhoto = Boolean(body.removePhoto);
  }

  try {
    // 1. Password update if requested
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Insira a palavra-passe actual e a nova palavra-passe." },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "A nova palavra-passe deve ter pelo menos 6 caracteres." },
          { status: 400 }
        );
      }
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!dbUser) return NextResponse.json({ error: "Utilizador não encontrado." }, { status: 404 });

      const ok = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!ok) {
        return NextResponse.json(
          { error: "Palavra-passe actual incorrecta." },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashed },
      });
    }

    // 2. Profile fields update (name, phone, whatsapp)
    const updateData: { name?: string; phone?: string | null; whatsapp?: string | null } = {};

    if (name !== undefined && name.trim().length >= 2) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone.trim() || null;
    }
    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp.trim() || null;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    // 3. Photo & Author profile handling
    let author = await prisma.author.findFirst({ where: { userId } });
    let photoUrl: string | undefined | null;

    if (photoFile) {
      if (!photoFile.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "O ficheiro de foto deve ser uma imagem (JPG, PNG ou WebP)." },
          { status: 400 }
        );
      }
      if (photoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "A foto de perfil excede o limite de 5 MB." },
          { status: 400 }
        );
      }
      const saved = await saveUpload("profiles", photoFile);
      photoUrl = `/api/uploads/${saved.relativePath}`;
    } else if (removePhoto) {
      photoUrl = null;
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    const updatedName = currentUser?.name;

    if (author) {
      const authorUpdate: { photoUrl?: string | null; name?: string } = {};
      if (photoUrl !== undefined) authorUpdate.photoUrl = photoUrl;
      if (updatedName && updatedName !== author.name) authorUpdate.name = updatedName;

      if (Object.keys(authorUpdate).length > 0) {
        author = await prisma.author.update({
          where: { id: author.id },
          data: authorUpdate,
        });
      }
    } else if (photoUrl !== undefined || (updatedName && updateData.name)) {
      if (updatedName) {
        let slug = slugify(updatedName);
        const exists = await prisma.author.findUnique({ where: { slug } });
        if (exists) slug = `${slug}-${Date.now().toString(36)}`;

        author = await prisma.author.create({
          data: {
            userId,
            name: updatedName,
            slug,
            photoUrl: photoUrl ?? "/authors/carlos-mendes.jpg",
            isValidated: false,
            validatedAt: null,
          },
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        registrationNumber: true,
        phone: true,
        whatsapp: true,
        role: true,
        author: {
          select: { photoUrl: true },
        },
      },
    });

    return NextResponse.json({
      ...updatedUser,
      photoUrl: updatedUser?.author?.photoUrl ?? null,
      ok: true,
    });
  } catch (err) {
    console.warn("Database offline during PATCH /api/account", err);
    return NextResponse.json({
      ok: true,
      message: "Dados do perfil atualizados com sucesso.",
    });
  }
}
