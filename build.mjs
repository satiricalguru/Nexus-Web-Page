import { cp, mkdir, rm } from "node:fs/promises";

import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));

const output = new URL("./dist/", import.meta.url);

if (fileURLToPath(output) !== root + "dist/") {
    if (fileURLToPath(output).replaceAll("\\", "/") !== (root + "dist/").replaceAll("\\", "/")) throw new Error("Invalid build output");
}

await rm(output, {
    recursive: true,
    force: true
});

await mkdir(new URL("./dist/", import.meta.url), {
    recursive: true
});

for (const name of [ "index.html", "css", "js", "assets" ]) {
    await cp(root + name, root + "dist/" + name, {
        recursive: true
    });
}

console.log("Nexus website ready in dist/");