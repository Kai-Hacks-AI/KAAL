// Case release/T931 tests: release/C99. Feature: Show WIP reaches GitHub only through Hosting.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DIR } from './helper.mjs';
export const id = 'release/T931';
export const tests = ['release/C99'];
export const title = 'the Show WIP command starts no process itself and reads GitHub through @kaihacksai/kaal-hosting';
export async function run() {
  const own = readdirSync(DIR).filter((f) => f.endsWith('.mjs') && !f.startsWith('build-') && f !== 'page.mjs');
  assert.ok(own.includes('run.mjs') && own.includes('read.mjs'), 'run.mjs or read.mjs is missing');
  for (const f of own) {
    const text = readFileSync(join(DIR, f), 'utf8');
    assert.ok(!/node:child_process|\bexecFileSync\b|\bspawn(Sync)?\(/.test(text), `${f} starts a process itself`);
  }
  assert.match(readFileSync(join(DIR, 'run.mjs'), 'utf8'), /@kaihacksai\/kaal-hosting/, 'run.mjs does not use Hosting');
}
