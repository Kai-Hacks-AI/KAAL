// Case release/T1684 tests: release/C173
import assert from 'node:assert/strict';
import { source, sourceExists, WF } from './fixture.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
export const id = 'release/T1684';
export const tests = ['release/C173'];
export const title = 'the old sync-review.yml source is gone, the plain job is named judge Sync, the acting jobs are sign Sync, approve Sync and review Sync, and no job of any workflow source is named verify Sync (only the Inspector\'s check run carries it)';
export async function run() {
  assert.ok(!sourceExists('sync-review.yml'), 'the old source is still there');
  const code = source('sync-verify-plain.yml') + source('sync-act.yml');
  for (const n of ['judge Sync', 'sign Sync', 'approve Sync', 'review Sync']) assert.equal([...code.matchAll(new RegExp(`^    name: ${n}$`, 'gm'))].length, 1, `${n} is not exactly one job`);
  for (const f of readdirSync(WF).filter((x) => x.endsWith('.yml'))) {
    const text = readFileSync(join(WF, f), 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
    assert.ok(!/^ {4}name: ['"]?verify Sync['"]?$/m.test(text), `${f} has a job named verify Sync`);
  }
}
