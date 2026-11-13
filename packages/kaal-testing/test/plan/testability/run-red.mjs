// Runs the planned Cases of testing/C59: node packages/kaal-testing/test/plan/testability/run-red.mjs [dir]
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
for (const f of readdirSync(here).filter((n) => /^T\d+\.red\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(here, f)).href);
  try { await m.run(); console.log('GREEN       ', m.id); }
  catch (x) { console.log(x?.code === 'ERR_ASSERTION' ? 'RED-observed' : 'ERROR       ', m.id, String(x.message).split('\n')[0]); }
}
