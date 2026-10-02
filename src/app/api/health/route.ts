import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const started = Date.now();
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  const status = db === "ok" ? 200 : 503;
  return NextResponse.json(
    {
      status: db === "ok" ? "healthy" : "degraded",
      db,
      uptimeMs: process.uptime() * 1000,
      latencyMs: Date.now() - started,
      version: process.env.npm_package_version ?? "0.1.0",
      time: new Date().toISOString(),
    },
    { status }
  );
}
