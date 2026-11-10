// Packages the TanStack Start build for Cloudflare Pages (advanced mode):
// static files from dist/client plus the SSR worker as _worker.js.
import { cpSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const out = "dist/pages";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync("dist/client", out, { recursive: true });
copyFileSync("dist/server/server.js", `${out}/_worker.js`);
console.log(`Cloudflare Pages output ready in app/${out}`);
