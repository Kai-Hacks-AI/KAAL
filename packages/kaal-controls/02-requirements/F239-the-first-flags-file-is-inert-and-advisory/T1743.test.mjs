// Case controls/T1743 tests: controls/F239
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'engineering/14-operations/controls/flags.json');
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1743';
export const tests = ['controls/F239'];
export const title = 'every entry of KAAL\'s flags file carries a state the library recognizes, and the file validates for each control at each place it names';
// An enduring Case: a flip to preventing, a new place or a new control passes while the file stays valid. Which entries exist and which state they hold is each Change's own evidence.
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags, flagSource, validateFlags } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const entries = parseFlags(readFileSync(FILE, 'utf8'));
  for (const e of entries) assert.ok(['stopped', 'advisory', 'preventing'].includes(e.value), `${e.control}@${e.place}: ${e.value} is not a declared state`);
  const places = new Map();
  for (const e of entries) places.set(e.control, [...(places.get(e.control) ?? []), e.place]);
  const controls = [...places].map(([id, p]) => ({ id, type: 'preventive', places: p }));
  assert.deepEqual(validateFlags({ controls, source: flagSource(entries) }), { ok: true, errors: [] });
}
