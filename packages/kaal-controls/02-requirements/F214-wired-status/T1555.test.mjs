// Case controls/T1555 tests: controls/F214
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const lib = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/judge-wired.mjs');
export const id = 'controls/T1555';
export const tests = ['controls/F214'];
export const title = 'the wired status of a control is told from the declarations, the installed inventory and the proof of running, and nothing unusable is judged';
const deep = (o) => { for (const v of Object.values(o)) if (v && typeof v === 'object') deep(v); return Object.freeze(o); };
const inv = (entries, extra = {}) => ({ revision: 'r1', scope: 'delivery', complete: true, entries, ...extra });
const decl = [{ id: 'CTL2', path: 'a/ctl2.mjs' }, { id: 'CTL1', path: 'a/ctl1.mjs' }, { id: 'CTL3', path: 'a/ctl3.mjs' }];
export async function run() {
  assert.ok(existsSync(lib), 'scripts/judge-wired.mjs is absent');
  const { judgeWired } = await import(pathToFileURL(lib).href);
  assert.equal(typeof judgeWired, 'function', 'judgeWired is not exported');
  const w = (o = {}) => judgeWired({ declared: inv(decl), installed: inv(['CTL1', 'a/ctl2.mjs']), running: ['CTL1'], revision: 'r1', scope: 'delivery', ...o });
  // the three statuses, by id or by path, sorted by control; the inputs are not changed
  const input = deep({ declared: inv(decl), installed: inv(['CTL1', 'a/ctl2.mjs']), running: ['CTL1'], revision: 'r1', scope: 'delivery' });
  assert.deepEqual(judgeWired(input), [{ control: 'CTL1', status: 'wired' }, { control: 'CTL2', status: 'wired-unproven' }, { control: 'CTL3', status: 'code-only' }]);
  // an installed entry no control declares is not this judge's (verify Delivery names it)
  assert.deepEqual(w({ installed: inv(['CTL1', 'stray.yml']) }), [{ control: 'CTL1', status: 'wired' }, { control: 'CTL2', status: 'code-only' }, { control: 'CTL3', status: 'code-only' }]);
  // nothing installed: all code-only; nothing declared: nothing to say
  assert.deepEqual(w({ installed: inv([]), running: [] }).map((x) => x.status), ['code-only', 'code-only', 'code-only']);
  assert.deepEqual(w({ declared: inv([]), installed: inv([]), running: [] }), []);
  // an unusable input is unknown (the check throws, so the adapter fails closed), never a status
  const bad = (o, why) => assert.throws(() => w(o), undefined, why);
  bad({ declared: undefined }, 'missing declared');
  bad({ installed: undefined }, 'missing installed');
  bad({ declared: inv(decl, { complete: false }) }, 'declared not complete');
  bad({ installed: inv(['CTL1'], { complete: false }) }, 'installed not complete');
  bad({ installed: inv(['CTL1'], { complete: 'yes' }) }, 'complete is not true');
  bad({ installed: inv(['CTL1'], { revision: 'r0' }) }, 'installed stale');
  bad({ declared: inv(decl, { scope: 'other' }) }, 'declared of another scope');
  bad({ installed: { ...inv(['CTL1']), entries: 'CTL1' } }, 'entries not a list');
  bad({ installed: inv([5]) }, 'installed entry malformed');
  bad({ declared: inv([{ id: 'CTL1' }, { id: 'CTL1' }]) }, 'declared twice');
  bad({ declared: inv([{ id: '' }]) }, 'declared id empty');
  bad({ revision: undefined }, 'no revision');
  bad({ scope: '' }, 'no scope');
  bad({ running: 'CTL1' }, 'running not a list');
  bad({ running: [1] }, 'running entry malformed');
  bad({ running: undefined }, 'running missing');
  bad({ running: ['CTL9'] }, 'running names a control nobody declared');
  bad({ running: ['CTL3'] }, 'running without installed contradicts the inventory');
  assert.throws(() => judgeWired(), undefined, 'no input');
}
