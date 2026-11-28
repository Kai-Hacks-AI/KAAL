// Case release/T1780 tests: release/C196. Both Dispatcher workflow sources read the App from the KAAL_APP_DISPATCHER pair (variable for the id, secret for the key), mint the token only in the job that raises, and pin every action.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const DIR = join(repo, 'engineering/release-management/05-src/wiring/workflows');
export const id = 'release/T1780';
export const tests = ['release/C196'];
export const title = 'both Dispatcher workflow sources use vars.KAAL_APP_DISPATCHER_ID and secrets.KAAL_APP_DISPATCHER_KEY and none of the old pair, and mint the token only in the job that raises';
export async function run() {
  for (const name of ['dispatcher.yml', 'dispatcher-raise.yml']) {
    const y = readFileSync(join(DIR, name), 'utf8').split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');
    assert.match(y, /app-id: \$\{\{ vars\.KAAL_APP_DISPATCHER_ID \}\}/, `${name}: the id is not the variable of the pair`);
    assert.match(y, /private-key: \$\{\{ secrets\.KAAL_APP_DISPATCHER_KEY \}\}/, `${name}: the key is not the secret of the pair`);
    assert.doesNotMatch(y, /KAAL_DISPATCHER_(?:APP_ID|KEY)/, `${name}: a name of the old pair remains`);
    assert.doesNotMatch(y, /secrets\.KAAL_APP_DISPATCHER_ID|vars\.KAAL_APP_DISPATCHER_KEY/, `${name}: the id is a secret or the key a variable`);
    // the App is minted in one job only, the one that raises
    const jobs = y.split(/^  (?=[a-z]+:\n    name: )/m).slice(1);
    const holders = jobs.filter((j) => /KAAL_APP_DISPATCHER_/.test(j));
    assert.equal(holders.length, 1, `${name}: the App is read in ${holders.length} jobs`);
    assert.match(holders[0], /name: raise/i, `${name}: the job that holds the App is not the one that raises`);
    for (const m of y.matchAll(/^\s*(?:-\s*)?uses: (\S+)/gm)) assert.match(m[1], /@[0-9a-f]{40}$/, `${name}: ${m[1]} is not pinned to a commit`);
  }
}
