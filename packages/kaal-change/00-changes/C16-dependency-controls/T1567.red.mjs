// Case change/T1567 tests: change/G19
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T1567';
export const tests = ['change/G19'];
export const closes = ['change/G19'];
export const title = 'both judges are pure over the facts they are given: no file, process, network, Git or host word, and no import of Release';
export function run() {
  for (const name of ['check-predecessor', 'identify-conflict']) {
    const url = new URL(`../../lib/${name}.mjs`, import.meta.url);
    assert.ok(existsSync(url), `lib/${name}.mjs is absent`);
    const src = readFileSync(url, 'utf8');
    for (const m of ['node:fs', 'node:child_process', 'node:http', 'node:https', 'node:net', 'fetch(', 'process.env', 'engineering/release'])
      assert.ok(!src.includes(m), `${name} uses ${m}`);
    for (const w of ['github', 'pull request', 'branch', 'collector'])
      assert.ok(!src.toLowerCase().includes(w), `${name} names ${w}`);
  }
}
test(id, () => run());
