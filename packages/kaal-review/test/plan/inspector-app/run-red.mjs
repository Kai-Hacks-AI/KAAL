// The temporary PLAN runner of review/C6: runs T1535 to T1538 and reports each as GREEN or RED. It stays outside `scripts.test` until the DO
// adds `inspector-app.test.mjs` and removes this file. A Case that cannot even load is reported as an error, never as RED.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
let red = 0;
let green = 0;
for (const file of readdirSync(dir).filter((n) => /^T\d+\.test\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(dir, file)).href);
  try { await m.run(); green += 1; console.log(`GREEN ${m.id}`); } catch (e) { red += 1; console.log(`RED   ${m.id}: ${String(e.message).split('\n')[0]}`); }
}
console.log(`${green} GREEN, ${red} RED`);
