// Case controls/T1730 tests: controls/F228
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const scripts = join(dir, 'skills/kaal-controls/scripts');
export const id = 'controls/T1730';
export const tests = ['controls/F228'];
export const title = 'the package applies its own check of records (CTL3) to its own controls, from its own files, and no record lags or overclaims its proof';
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const LADDER = ['designed', 'implemented', 'running', 'tested'];
export async function run() {
  const files = walk(dir).filter((f) => /\.(md|mjs|json)$/.test(f) && !/package-lock\.json$/.test(f)).map((f) => ({ path: relative(dir, f), text: readFileSync(f, 'utf8').replace(/\r\n/g, '\n') }));
  const { findControls } = await import(pathToFileURL(join(scripts, 'lib/find-controls.mjs')).href);
  const { assessRecord } = await import(pathToFileURL(join(scripts, 'verify-record.mjs')).href);
  const own = findControls(files).controls.filter((c) => c.path.startsWith('14-operations/controls/CTL'));
  assert.ok(own.length >= 5, 'the package has no controls of its own to judge');
  const controls = [];
  const facts = {};
  for (const c of own) {
    assert.ok(c.valid, `${c.id} is not a valid declaration: ${c.problems.map((p) => p.reason).join(', ')}`);
    const rank = LADDER.indexOf(c.status);
    assert.ok(rank >= 0, `${c.id} has a status outside the ladder`);
    const name = /\/CTL\d+-([a-z-]+)\//.exec(c.path)?.[1];
    assert.ok(name, `${c.path} is not in a folder CTL<n>-<name>`);
    controls.push({ id: c.id, claimed: { defined: rank >= 0, implemented: rank >= 1, running: rank >= 2, tested: rank >= 3 } });
    facts[c.id] = { revision: 'tree', defined: true, implemented: existsSync(join(scripts, `${name}.mjs`)), running: false, tested: c.tests.length > 0 };
  }
  const { findings, unknown } = assessRecord({ controls, facts, revision: 'tree' });
  assert.deepEqual(unknown, [], 'a fact of the package cannot be derived from its own files');
  assert.deepEqual(findings, [], 'a record of the package lags or overclaims its proof');
}
