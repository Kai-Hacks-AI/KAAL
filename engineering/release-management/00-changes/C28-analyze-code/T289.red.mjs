// Case release/T289 tests: G63
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const here = join(repo, 'engineering/release-management/00-changes/C28-analyze-code');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T289';
export const tests = ['release/G63'];
export const title = 'gap release/G63 is closed: the recorded ruleset needs are exactly the contexts the CodeQL job reports';
export function run() {
  const proposal = JSON.parse(read(join(here, 'ruleset-needs.json'), 'the proposed ruleset needs'));
  const needs = JSON.parse(read(join(repo, 'engineering/release-management/05-src/wiring/rulesets/analyze-code.needs.json'), 'the recorded ruleset needs (Engineering source)'));
  assert.deepEqual(needs.per_target, proposal.per_target, 'the recorded needs equal the proposal');
  const wf = read(join(repo, '.github/workflows/codeql.yml'), 'the CodeQL workflow');
  const name = /^\s+name:\s*(.+)$/m.exec(wf.slice(wf.indexOf('analyze:')))?.[1].trim();
  const langs = /language:\s*\[([^\]]+)\]/.exec(wf)?.[1].split(',').map((s) => s.trim());
  assert.ok(name && langs?.length, 'the job name and its languages are readable');
  const reported = langs.map((l) => name.replace('${{ matrix.language }}', l)).sort();
  assert.deepEqual([...needs.contexts].sort(), reported, 'the needs list the reported contexts');
  assert.ok(needs.per_target.length >= 1, 'at least one target is named');
  for (const t of needs.per_target) assert.deepEqual([...t.contexts].sort(), reported, `${t.ruleset} requires every context`);
}
