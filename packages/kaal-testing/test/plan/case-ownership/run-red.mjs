// Runs the testing/C61 planned Cases and reports each as GREEN, RED or ERROR. Exits 0 only when no Case errors.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
let errors = 0;
for (const f of readdirSync(dir).filter((n) => /^T\d+\.(red|test)\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(dir, f)).href);
  try { await m.run(); console.log(`GREEN ${m.id}`); }
  catch (e) {
    if (e?.name === 'AssertionError') console.log(`RED   ${m.id}: ${e.message.split('\n')[0]}`);
    else { errors += 1; console.log(`ERROR ${m.id}: ${e?.message}`); }
  }
}
process.exit(errors ? 1 : 0);
