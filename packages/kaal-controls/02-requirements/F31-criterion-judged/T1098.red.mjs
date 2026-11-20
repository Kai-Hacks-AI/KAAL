// Case controls/T1098 tests: controls/F31
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const S = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
const item = (o = {}) => { const f = { id: 'demo/CTL1', title: 'approve Sync', description: 'A SYNC is approved when it is pure.', type: 'preventive', status: 'running', has: '[demo/I1]', evidence: '[fixture:1, provoked:1:fail]', ...o }; return '---\n' + Object.entries(f).map(([k, v]) => `${k}: ${v}`).join('\n') + '\n---\n# ' + f.id + '\n'; };
const ctl = async () => { const { findControls } = await import(pathToFileURL(join(S, 'find-controls.mjs')).href); return findControls([{ path: 'x/CTL1.md', text: item() }, { path: 'x/T1.test.mjs', text: '// Case demo/T1 tests: demo/CTL1\n' }]).controls[0]; };
const rec = (x, run, base) => ({ case: 'demo/T1', x, run, outcome: 'GREEN', ...(base ? { base } : {}) });

export const id = 'controls/T1098';
export const tests = ['controls/F31'];
export const title = 'a provoked failure counts only when its base was not a fixture or a Case, and an unnamed mechanism is shown';
export async function run() {
  const { judgeEvidence } = await import(pathToFileURL(join(S, 'evidence.mjs')).href);
  const c = await ctl();
  const j = (base) => judgeEvidence(c, [rec('fixture', 1), rec('provoked', 'p', { run: 'b', outcome: 'RED', ...base })]);
  assert.equal(j({ without: 'packages/x/skills/x/scripts/approve.mjs' }).verdict, 'PASS', 'a base without the mechanism did not count');
  assert.equal(j({ without: 'packages/x/test/T9.test.mjs' }).verdict, 'UNKNOWN', 'a base without a Case counted');
  assert.equal(j({ without: 'packages/x/test/fixtures/pr.json' }).verdict, 'UNKNOWN', 'a base without a fixture counted');
  const named = j({ without: 'packages/x/scripts/approve.mjs' });
  assert.equal(named.unnamed, 0, 'a named mechanism was shown as unnamed');
  const unnamed = j({});
  assert.equal(unnamed.verdict, 'PASS', 'a base that names no mechanism stopped counting');
  assert.equal(unnamed.unnamed, 1, 'a base that names no mechanism was not shown as unnamed');
}
