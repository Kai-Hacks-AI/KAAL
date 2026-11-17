// Case controls/T782 tests: controls/CTL1
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const FINDER = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs');
const CHECK = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/check-controls.mjs');
const EC = join(repo, 'engineering/controls');
const found = () => JSON.parse(execFileSync(process.execPath, [FINDER, EC], { encoding: 'utf8' }));
export const id = 'controls/T782';
export const tests = ['controls/CTL1'];
export const title = 'the check passes the declaration of controls/CTL1 and reveals it when its status or its Intent is taken away';
export async function run() {
  const real = join(EC, '04-controls/CTL1-check-controls/CTL1.md');
  assert.ok(existsSync(real), 'CTL1.md is absent');
  const text = readFileSync(real, 'utf8');
  const run = (body) => { const d = mkdtempSync(join(tmpdir(), 'ctl1-')); writeFileSync(join(d, 'CTL1.md'), body); try { execFileSync(process.execPath, [CHECK, d], { stdio: ['ignore', 'pipe', 'pipe'] }); return { code: 0, err: '' }; } catch (e) { return { code: e.status, err: String(e.stderr) }; } };
  assert.equal(run(text).code, 0, 'the declaration of controls/CTL1 fails its own check');
  for (const field of ['status', 'has']) {
    const r = run(text.replace(new RegExp(`^${field}: .*\\n`, 'm'), ''));
    assert.equal(r.code, 1, `a declaration without ${field} passed the check`);
    assert.ok(r.err.includes('controls/CTL1') && r.err.includes(field), `the failure does not name controls/CTL1 and ${field}`);
  }
  const real2 = execFileSync(process.execPath, [CHECK, join(repo, 'engineering')], { encoding: 'utf8' });
  assert.ok(real2.includes('controls/CTL1'), 'the check of engineering does not list controls/CTL1');
}
