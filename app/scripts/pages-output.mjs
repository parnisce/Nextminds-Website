// Packages the TanStack Start build for Cloudflare Pages (advanced mode):
// static files from dist/client plus the SSR worker as _worker.js.
import { cpSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const out = "dist/pages";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync("dist/client", out, { recursive: true });
copyFileSync("dist/server/server.js", `${out}/_worker.js`);
console.log(`Cloudflare Pages output ready in app/${out}`);

// Serve static files directly; only everything else goes to the SSR worker.
import { readdirSync, statSync, writeFileSync } from "node:fs";
const exclude = readdirSync("dist/client").map((name) =>
  statSync(`dist/client/${name}`).isDirectory() ? `/${name}/*` : `/${name}`,
);
writeFileSync(`${out}/_routes.json`, JSON.stringify({ version: 1, include: ["/*"], exclude }, null, 2));
console.log("Wrote _routes.json excluding", exclude.join(", "));
