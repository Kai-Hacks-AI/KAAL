// Runs every planned Case of skills/C1 and prints RED or GREEN. Exit 1 while any is RED (it is a PLAN: all are RED).
// Usage, from the repository root: node packages/kaal-skills/test/plan/integration-readiness/run-red.mjs
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
let red = 0;
for (const f of readdirSync(dir).filter((n) => /^T\d+\.(red|test)\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(dir, f)).href);
  try { await m.run(); console.log(`GREEN ${m.id}`); }
  catch (e) { red++; console.log(`RED   ${m.id}  ${String(e.message).split('\n')[0].slice(0, 150)}`); }
}
process.exit(red ? 1 : 0);
