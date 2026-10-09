/* eslint-disable @typescript-eslint/no-require-imports */
// Waits for PostgreSQL with exponential backoff before the app starts.
// Usage: node scripts/wait-for-db.js   (CLI, exit 1 on failure)
//        await require('./scripts/wait-for-db')()   (from server.js)

async function waitForDb({
  maxWaitMs = Number(process.env.DB_WAIT_MAX_MS || 180000),
  initialDelayMs = 1000,
  maxDelayMs = 30000,
} = {}) {
  if (!process.env.DATABASE_URL) {
    console.warn("[wait-for-db] DATABASE_URL not set - skipping");
    return true;
  }
  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient({ log: [] });
  const started = Date.now();
  let delay = initialDelayMs;
  let attempt = 0;
  try {
    for (;;) {
      attempt++;
      try {
        await prisma.$queryRawUnsafe("SELECT 1");
        console.log(`[wait-for-db] database ready (attempt ${attempt})`);
        return true;
      } catch (err) {
        const elapsed = Date.now() - started;
        if (elapsed + delay > maxWaitMs) {
          console.error(`[wait-for-db] database unavailable after ${attempt} attempts:`, err.message);
          return false;
        }
        console.warn(`[wait-for-db] attempt ${attempt} failed (${err.message.split("\n")[0]}), retrying in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        delay = Math.min(delay * 2, maxDelayMs);
      }
    }
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

module.exports = waitForDb;

if (require.main === module) {
  waitForDb().then((ok) => process.exit(ok ? 0 : 1));
}
