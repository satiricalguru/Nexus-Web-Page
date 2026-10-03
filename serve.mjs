import http from "node:http";
import { execFile } from "node:child_process";

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

const server = http.createServer(async (request, response) => {
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
});

let retrying = false;
server.on("error", error => {
    if (error.code === "EADDRINUSE" && !retrying) {
        retrying = true;
        server.listen(0, "127.0.0.1");
        return;
    }
    console.error(`Could not start the site: ${error.message}`);
    process.exitCode = 1;
});
server.on("listening", () => {
    const url = `http://127.0.0.1:${server.address().port}/`;
    console.log(`Nexus preview: ${url}\nKeep this window open. Press Ctrl+C to stop.`);
    if (!process.argv.includes("--open") || process.argv.includes("--no-open")) return;
    const command = process.platform === "win32" ? "cmd.exe" : process.platform === "darwin" ? "open" : "xdg-open";
    const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
    execFile(command, args, { windowsHide: true }, error => {
        if (error) console.log(`Open this address in your browser: ${url}`);
    });
});
server.listen(port, "127.0.0.1");
