// Case release/T1203 tests: release/C99 (D11). The Dispatcher's open-pull-request reads come from the list it is given, not from a route.
import assert from 'node:assert/strict';
import { openPromotions, gatherFacts } from '../../05-src/promotion-raise/gather.mjs';
export const id = 'release/T1203';
export const tests = ['release/C99'];
export const title = 'the Dispatcher reads open pull requests from the supplied list and calls no open-pulls route';
const pulls = [
  { number: 7, title: 'A', head: 'kaal/x/y', base: 'main' },
  { number: 8, title: 'B', head: 'kaal/x/z', base: 'kaal/x/y' },
];
export async function run() {
  const api = async (m, path) => {
    assert.ok(!/state=open/.test(path), `open route called: ${path}`);
    if (/compare/.test(path)) return { ahead_by: 1 };
    if (/git\/ref/.test(path)) return { object: { sha: 'abc' } };
    return [];
  };
  const proms = await openPromotions(api, 'o/r', pulls);
  assert.deepEqual(proms, [{ number: 7, title: 'A', head: 'kaal/x/y' }]);
  const f = await gatherFacts(api, 'o/r', 'kaal/x/y', pulls);
  assert.deepEqual(f.open.map((p) => p.number), [7]);
}
