// Runs the Cases of Show WIP (T<n>.red.mjs) by hand: node packages/kaal-release/plan/coordination/red.mjs
// They are not wired into any test list. Each is RED until the Script and the Delivery exist; the DO renames it to .test.mjs.
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
const dir = fileURLToPath(new URL('./', import.meta.url));
let red = 0;
for (const file of readdirSync(dir).filter((f) => /^T\d+\.(red|test)\.mjs$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))) {
  const name = file.replace(/\.(red|test)\.mjs$/, '');
  try { const mod = await import(pathToFileURL(join(dir, file)).href); await mod.run(); console.log(`GREEN ${mod.id}`); } catch (error) { red += 1; console.log(`RED   ${name}: ${String(error.message).split('\n')[0].slice(0, 110)}`); }
}
process.exitCode = red ? 1 : 0;
