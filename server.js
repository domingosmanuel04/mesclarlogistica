const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const rawPort = process.env.PORT || "3000";
const port = isNaN(Number(rawPort)) ? rawPort : parseInt(rawPort, 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
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

    if (typeof port === "number") {
      server.listen(port, "0.0.0.0", (err) => {
        if (err) throw err;
        console.log(`> Mesclar Logística listening on http://0.0.0.0:${port}`);
      });
    } else {
      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Mesclar Logística listening on socket ${port}`);
      });
    }
  })
  .catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
  });
