import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const publicDir = join(root, "src");
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function resolvePath(url) {
  const pathname = new URL(url, `http://localhost:${port}`).pathname;
  const filePath = pathname === "/" ? "/index.html" : pathname;
  const resolved = normalize(join(publicDir, filePath));

  if (!resolved.startsWith(publicDir)) {
    return null;
  }

  return resolved;
}

const server = createServer(async (req, res) => {
  const path = resolvePath(req.url || "/");

  if (!path) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": contentTypes[extname(path)] || "application/octet-stream"
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`AI app running at http://localhost:${port}`);
});
