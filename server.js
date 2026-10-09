const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const TITLE = process.env.APP_TITLE || "Hello, World!";

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const html = fs
  .readFileSync(path.join(__dirname, "index.html"), "utf8")
  .replaceAll("{{TITLE}}", escapeHtml(TITLE));

http
  .createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      return res.end("ok");
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  })
  .listen(PORT, () => console.log(`Listening on port ${PORT}`));
