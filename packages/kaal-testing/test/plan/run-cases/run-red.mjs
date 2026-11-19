// Runs the testing/C63 planned Cases. Default: every Case must be RED by assertion (an error is not RED).
// With --green: every Case must pass. KAAL_TESTING_IMPL points validation at a reference outside the repository.
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const green = process.argv.includes('--green');
const tally = { RED: 0, GREEN: 0, ERROR: 0 };
for (const f of readdirSync(dir).filter((n) => /^T\d+\.red\.mjs$/.test(n)).sort()) {
  const m = await import(pathToFileURL(join(dir, f)).href);
  let state, why = '';
  try { await m.run(); state = 'GREEN'; } catch (e) { state = e?.code === 'ERR_ASSERTION' ? 'RED' : 'ERROR'; why = String(e?.message ?? e).split('\n')[0]; }
  tally[state] += 1;
  console.log(`${m.id} ${state}${why ? `: ${why}` : ''}`);
}
console.log(`RED-observed ${tally.RED}, error ${tally.ERROR}, green ${tally.GREEN}`);
process.exit(green ? (tally.GREEN === 7 ? 0 : 1) : (tally.RED === 7 ? 0 : 1));
