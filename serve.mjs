import http from "node:http";

import { readFile, stat } from "node:fs/promises";

import path from "node:path";

import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const port = Number(process.env.PORT || 8e3);

const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".png": "image/png",
    ".ttf": "font/ttf"
};

http.createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
        if (pathname === "/team" || pathname === "/team.html") {
            response.writeHead(302, {
                Location: "/#team"
            });
            response.end();
            return;
        }
        const relative = pathname.replace(/^\/+/, "") || "index.html";
        const target = path.resolve(root, relative);
        const publicPath = path.relative(root, target).replaceAll("\\", "/");
        const allowed = publicPath === "index.html" || /^(css|js|assets)\//.test(publicPath);
        if (!allowed || !target.startsWith(root) || !(await stat(target)).isFile()) throw new Error("Not found");
        response.writeHead(200, {
            "Content-Type": types[path.extname(target)] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        response.end(await readFile(target));
    } catch {
        response.writeHead(404, {
            "Content-Type": "text/plain"
        });
        response.end("Not found");
    }
}).listen(port, "127.0.0.1", () => console.log(`Nexus preview: http://127.0.0.1:${port}/`));