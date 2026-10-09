/* eslint-disable @typescript-eslint/no-require-imports */
// Production entrypoint (cPanel / PM2 / Docker).
// - Waits for the database with exponential backoff
// - Listens on a FIXED port (PORT) so the deploy can run blue/green on 3000/3001
// - Graceful shutdown on SIGTERM/SIGINT (finishes in-flight requests)
// - Optional: NEXT_DIST_DIR selects which build (release) this instance serves
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const waitForDb = require("./scripts/wait-for-db");

// Do not let a stray async error (e.g. DB timeout) kill the whole site
process.on("unhandledRejection", (reason) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection:`, reason);
});
process.on("uncaughtException", (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught exception:`, err);
});

const rawPort = process.env.PORT || "3000";
const isUnixSocket = isNaN(Number(rawPort)); // cPanel Passenger passes a socket path
const port = isUnixSocket ? rawPort : parseInt(rawPort, 10);
const host = process.env.HOST || "0.0.0.0";
const SHUTDOWN_TIMEOUT_MS = Number(process.env.SHUTDOWN_TIMEOUT_MS || 15000);

async function main() {
  const dbOk = await waitForDb();
  if (!dbOk) {
    // Start anyway: pages without DB still work and /api/health reports "degraded".
    console.error("[server] starting without database connectivity");
  }

  const app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();
  await app.prepare();

  const server = createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url, true));
    } catch (err) {
      console.error("Error handling request", req.url, err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  });
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  server.on("error", (err) => {
    console.error("[server] fatal listen error:", err);
    process.exit(1); // let the process manager restart us (with its limits)
  });

  const onListen = () => {
    console.log(`> Mesclar Logística ready on ${isUnixSocket ? port : `http://${host}:${port}`} (dist: ${process.env.NEXT_DIST_DIR || ".next"}, pid ${process.pid})`);
    if (typeof process.send === "function") process.send("ready"); // PM2 wait_ready
  };
  if (isUnixSocket) server.listen(port, onListen);
  else server.listen(port, host, onListen);

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[server] ${signal} received - draining connections`);
    server.close(() => {
      console.log("[server] closed cleanly");
      process.exit(0);
    });
    server.closeIdleConnections?.();
    setTimeout(() => {
      console.warn("[server] forced exit after timeout");
      process.exit(0);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
