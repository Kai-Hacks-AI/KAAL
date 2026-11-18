// Runs the Cases of engineering/C17 and prints each verdict. Exits 1 while any is RED.
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
let red = 0;
for (const f of readdirSync(here).filter((n) => /^T\d+\.(red|test)\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(here, f)).href);
  try { await m.run(); console.log(`GREEN ${m.id}`); } catch (e) { red++; console.log(`RED   ${m.id}: ${String(e.message).split("\n")[0]}`); }
}
process.exit(red ? 1 : 0);
