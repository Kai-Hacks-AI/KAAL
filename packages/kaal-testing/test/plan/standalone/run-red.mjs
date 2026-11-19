// Runs the planned Cases of testing/C65 (T370 to T373) and prints RED-observed, GREEN or ERROR for each. Used for the PLAN's evidence and by the DO.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
for (const f of readdirSync(dir).filter((n) => /^T\d+\.(red|test)\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(dir, f)).href);
  try { await m.run(); console.log('GREEN', m.id); } catch (x) { console.log(x.code === 'ERR_ASSERTION' ? 'RED-observed' : 'ERROR', m.id, String(x.message).split('\n')[0]); }
}
