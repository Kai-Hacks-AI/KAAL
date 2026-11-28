// Case release/T1795 tests: release/C201. No target the replaced checks protect is left at no station.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load, SRC } from './fixture.mjs';
export const id = 'release/T1795';
export const tests = ['release/C201'];
export const title = 'every ref pattern of the rulesets that carry the replaced checks has a station, so no protected target can be left at none';
export async function run() {
  const { stationOf, STATIONS } = await load('lib/stations.mjs');
  const dir = join(SRC, 'wiring/rulesets');
  // a branch of each pattern the ruleset sources use; a pattern that is none of these is one the mapping has not been told about
  const sample = (p) => (p === '~DEFAULT_BRANCH' ? 'main' : /^refs\/heads\/([a-z]+)\/\*\*$/.exec(p) ? `${/^refs\/heads\/([a-z]+)\//.exec(p)[1]}/example/x` : undefined);
  let seen = 0;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
    const rs = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    for (const p of rs.conditions.ref_name.include) {
      if (p.startsWith('refs/tags/')) continue; // a tag is no target of a pull request
      const branch = sample(p);
      assert.ok(branch, `${f}: the pattern ${p} is one the Case does not know; the mapping must be told first`);
      const s = stationOf({ baseRef: branch, defaultBranch: 'main' });
      assert.ok(s && STATIONS.includes(s), `${f}: the pattern ${p} (${branch}) has a station`);
      seen += 1;
    }
  }
  assert.ok(seen >= 5, 'the rulesets were read');
  // the legacy rulesets protect the default branch and kaal/**; both have stations
  for (const b of ['main', 'kaal/release/x']) assert.ok(stationOf({ baseRef: b, defaultBranch: 'main' }));
}
