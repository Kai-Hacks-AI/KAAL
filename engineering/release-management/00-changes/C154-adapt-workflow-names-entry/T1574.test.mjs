// Case release/T1574 tests: release/C154. The entry of CTL36 behaves as before it integrates the adapter: the same findings file and exit codes, and nothing written when it cannot tell.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/workflow-names/judge-workflow-names.mjs');
export const id = 'release/T1574';
export const tests = ['release/C154'];
export const title = 'the entry of CTL36 writes the same findings and exits with the same codes: a list for duplicate and missing names, an empty list for a clean folder, exit 2 and no file for a folder it cannot read';
export async function run() {
  const dir = mkdtempSync(join(tmpdir(), 'names-'));
  try {
    const wf = (folder, file, text) => { mkdirSync(join(dir, folder, '.github/workflows'), { recursive: true }); writeFileSync(join(dir, folder, '.github/workflows', file), text); };
    const go = (folder) => { const out = join(dir, `${folder}.json`); const r = spawnSync(process.execPath, [ENTRY, '--head', join(dir, folder), '--out', out], { encoding: 'utf8' }); return { r, out }; };
    wf('dup', 'a.yml', 'name: Same\n'); wf('dup', 'b.yml', 'name: Same\n'); wf('dup', 'c.yml', 'on: push\n');
    let { r, out } = go('dup');
    assert.equal(r.status, 0, 'a non-empty list still exits 0');
    assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), ['.github/workflows/a.yml:duplicate-name', '.github/workflows/b.yml:duplicate-name', '.github/workflows/c.yml:missing-name']);
    wf('clean', 'a.yml', 'name: One\n'); wf('clean', 'b.yml', 'name: Two\n');
    ({ r, out } = go('clean'));
    assert.equal(r.status, 0); assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')), []);
    mkdirSync(join(dir, 'none'), { recursive: true });
    ({ r, out } = go('none'));
    assert.equal(r.status, 2); assert.equal(existsSync(out), false, 'nothing is written when it cannot tell'); assert.match(r.stderr, /^UNKNOWN: /m);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
