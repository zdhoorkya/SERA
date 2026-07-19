const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// Enforce production mode to prevent dev memory overhead
const dev = false;
const port = process.env.PORT || 3000;
const app = next({ dev, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Short timeouts to release socket memory immediately on Hostinger
  server.keepAliveTimeout = 5000;
  server.headersTimeout = 6000;

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> SERA Next.js server listening on port ${port}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
