// retro/C3 Case. Unwired: RED until the DO fixes pretest. Not in the package test script.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));

describe('retro/C3 the package test script', () => {
  it('retro/T16 npm test in the package exits 0 and reports 15 Cases passing', () => {
    const run = spawnSync('npm', ['test'], { cwd: PACKAGE, encoding: 'utf8', shell: process.platform === 'win32' });
    const out = `${run.stdout}\n${run.stderr}`;
    assert.equal(run.status, 0, out);
    assert.match(out, /# tests 15\b/);
    assert.match(out, /# pass 15\b/);
    assert.match(out, /# fail 0\b/);
  });
});
