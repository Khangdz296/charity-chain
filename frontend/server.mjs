import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("frontend");
const port = Number(process.env.PORT || 5500);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function resolveRequest(url) {
  const path = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const normalized = normalize(path).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  const target = resolve(join(root, normalized === "" ? "index.html" : normalized));

  if (!target.startsWith(root)) {
    return null;
  }
  if (existsSync(target) && statSync(target).isFile()) {
    return target;
  }
  return null;
}

const server = createServer((req, res) => {
  const target = resolveRequest(req.url || "/");
  if (!target) {
    send(res, 404, "Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentTypes[extname(target)] || "application/octet-stream"
  });
  createReadStream(target).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Frontend running at http://127.0.0.1:${port}`);
});
