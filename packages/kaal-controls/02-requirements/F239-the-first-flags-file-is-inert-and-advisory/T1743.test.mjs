// Case controls/T1743 tests: controls/F239
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'engineering/14-operations/controls/flags.json');
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1743';
export const tests = ['controls/F239'];
export const title = 'the first flags file validates for its controls at its stations and nothing engages it: no workflow or hook names it or supplies KAAL_FLAGS, and no entry is anything but advisory';
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (['node_modules', '.git'].includes(e.name) ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags, flagSource, validateFlags } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const entries = parseFlags(readFileSync(FILE, 'utf8'));
  const places = ['Collecting', 'Hotfixing', 'Promoting', 'Wiring'];
  const controls = ['release/CTL40', 'release/CTL41'].map((id) => ({ id, type: 'preventive', places }));
  assert.deepEqual(validateFlags({ controls, source: flagSource(entries) }), { ok: true, errors: [] });
  assert.deepEqual([...new Set(entries.map((e) => e.value))], ['advisory'], 'only advisory: nothing blocks and nothing is flipped');
  // What can make a job read the file: a workflow or hook that names it or supplies KAAL_FLAGS, which release's entry reads to engage the flag (a job that supplies none has not adopted it).
  const readers = [];
  for (const dir of ['.github', '.githooks']) {
    const base = join(repo, dir);
    if (!existsSync(base)) continue;
    for (const f of walk(base)) {
      const code = readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(#|\/\/)/.test(l)).join('\n');
      if (/14-operations\/controls\/flags\.json|KAAL_FLAGS/.test(code)) readers.push(relative(repo, f));
    }
  }
  assert.deepEqual(readers, [], 'something reads the first flags file, so it is wired and not inert');
}
