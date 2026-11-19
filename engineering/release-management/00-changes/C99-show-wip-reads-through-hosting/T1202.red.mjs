// Case release/T1202 tests: release/C99. Regression: when GitHub cannot be read at all, Show WIP says so and prints no report.
import assert from 'node:assert/strict';
import { standIn } from './helper.mjs';
export const id = 'release/T1202';
export const tests = ['release/C99'];
export const title = 'when every GitHub call fails, the command exits 2 naming what it could not read and prints nothing on standard output';
export async function run() {
  const gh = standIn('down');
  try {
    const out = gh.show();
    assert.equal(out.status, 2);
    assert.match(out.stderr, /^show WIP: /);
    assert.equal(out.stdout, '');
  } finally {
    gh.cleanup();
  }
}
