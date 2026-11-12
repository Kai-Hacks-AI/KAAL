// Case pull/T14 tests: pull/F14, pull/F15
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T14';
export const tests = ['pull/F14', 'pull/F15'];
export const title = 'the command, run on the real repository, prints a result for every declared collector and the qualifiers in the declared order, fails naming what is missing, and its gatherer issues only reads';
export async function run() {
  const live = process.env.KAAL_LIVE;
  assert.ok(live, 'KAAL_LIVE=<owner/repo> is required: this Case runs against the real host and is not simulated');
  const dir = join(repoRoot, 'engineering/release-management/05-src/pull-promotion');
  const declared = join(dir, 'declaration.json');
  const command = (args, options = {}) => spawnSync('node', [join(dir, 'run.mjs'), ...args], { encoding: 'utf8', ...options });

  const declaration = JSON.parse(readFileSync(declared, 'utf8'));
  const names = declaration.collectors.map((c) => c.name ?? c);
  const ok = command([live, declared]);
  assert.equal(ok.status, 0, `the command failed: ${ok.stderr}`);
  const result = JSON.parse(ok.stdout);
  assert.deepEqual(result.collectors.map((c) => c.name), names, 'the result does not hold one entry per declared collector, in the declared order');
  for (const c of result.collectors) {
    assert.ok(['qualifies', 'does not qualify', 'not judged'].includes(c.status), `${c.name}: no status`);
    if (c.status !== 'qualifies') assert.ok(c.missing.length > 0, `${c.name}: ${c.status} without saying what is missing`);
  }
  const order = result.collectors.filter((c) => c.status === 'qualifies').map((c) => c.name);
  assert.deepEqual(result.qualifiers, order, 'the qualifiers are not those that qualify, in the declared order');
  assert.ok(!/\bREADY\b|may promote/i.test(ok.stdout), 'the output claims readiness or an authorization');

  // no usable credential and an unreadable host fail naming what is missing
  const bare = command([live, declared], { env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), 'pull-nohome-')) } });
  assert.notEqual(bare.status, 0, 'the command ran without a supported credential');
  assert.match(String(bare.stderr), /GH_TOKEN|GITHUB_TOKEN|gh auth|credential/i, 'the missing credential is not named');
  const unreadable = command(['no-such-owner-xyz/none', declared]);
  assert.notEqual(unreadable.status, 0);
  assert.match(String(unreadable.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');

  // read-only by construction: the sources of the command hold no request that is not a GET
  const sources = readdirSync(dir).filter((f) => /\.mjs$/.test(f)).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  assert.ok(!/(-X|--method)\s*['"]?(POST|PUT|PATCH|DELETE)\b/i.test(sources), 'a source holds a request that is not a GET');
  assert.ok(!/\bmutation\b/.test(sources), 'a source holds a GraphQL mutation');
}
