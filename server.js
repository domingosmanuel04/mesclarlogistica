const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Do not let a stray async error (e.g. DB timeout) kill the whole site
process.on("unhandledRejection", (reason) => {
  console.error(`[${new Date().toISOString()}] Unhandled rejection:`, reason);
});
process.on("uncaughtException", (err) => {
  console.error(`[${new Date().toISOString()}] Uncaught exception:`, err);
});

const dev = false;
const app = next({ dev });
const handle = app.getRequestHandler();

const initialPort = parseInt(process.env.PORT || "3000", 10);
const portsToTry = [
  isNaN(initialPort) ? 3000 : initialPort,
  3000,
  3020,
  3001,
  8080,
  3002,
  3003
].filter((p, i, self) => !isNaN(p) && self.indexOf(p) === i);

app
  .prepare()
  .then(() => {
    const rawPort = process.env.PORT;
    // Check if process.env.PORT is a UNIX domain socket (cPanel Passenger)
    if (rawPort && isNaN(Number(rawPort))) {
      const server = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error("Error handling request", req.url, err);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
      server.listen(rawPort, (err) => {
        if (err) throw err;
        console.log(`> Mesclar Logística listening on UNIX socket ${rawPort}`);
      });
      return;
    }

    let currentPortIndex = 0;

    function startServerOnPort(index) {
      if (index >= portsToTry.length) {
        console.error("Error: Could not bind to any fallback port.");
        process.exit(1);
      }

      const targetPort = portsToTry[index];
      const server = createServer(async (req, res) => {
        try {
          const parsedUrl = parse(req.url, true);
          await handle(req, res, parsedUrl);
        } catch (err) {
          console.error("Error handling request", req.url, err);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.warn(`Port ${targetPort} is already in use. Trying next port...`);
          currentPortIndex++;
          startServerOnPort(currentPortIndex);
        } else {
          console.error("Server error:", err);
          process.exit(1);
        }
      });

      server.listen(targetPort, "0.0.0.0", () => {
        console.log(`> Mesclar Logística active on http://0.0.0.0:${targetPort}`);
      });
    }

    startServerOnPort(0);
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
