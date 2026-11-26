// Case release/T1575 tests: release/C155. The plain pull_request source of Change Isolation has a workflow name of its own, so verify Workflow names reports no new finding for it.
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/workflow-names/judge-workflow-names.mjs');
const SOURCE = join(repo, 'engineering/release-management/05-src/wiring/workflows/change-isolation-plain.yml');
export const id = 'release/T1575';
export const tests = ['release/C155'];
export const title = 'the source of the plain pull_request Change Isolation workflow is named, not KAAL and not another workflow\'s name, and its job name is unchanged';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'plain-name-'));
  try {
    const wf = join(dir, '.github/workflows');
    mkdirSync(wf, { recursive: true });
    cpSync(join(repo, '.github/workflows'), wf, { recursive: true });
    writeFileSync(join(wf, 'change-isolation-plain.yml'), readFileSync(SOURCE));
    const out = join(dir, 'findings.json');
    const r = spawnSync(process.execPath, [ENTRY, '--head', dir, '--out', out], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const mine = JSON.parse(readFileSync(out, 'utf8')).filter((f) => f.startsWith('.github/workflows/change-isolation-plain.yml:'));
    assert.deepEqual(mine, [], `findings for the plain workflow: ${mine.join(', ')}`);
    assert.match(readFileSync(SOURCE, 'utf8'), /^    name: Change Isolation \(plain pull_request\)$/m, 'the job name must stay');
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
