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
export const title = 'every entry of KAAL\'s flags file holds a value the library recognizes, and the file validates for each control at each place it names; a later flip to on or preventing is accepted and its effective state is told apart from the value, while an unknown value is refused';
// An enduring Case: it follows the library's own values (`flagState`), never a list of its own, so a valid flip passes and a mistake does not.
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags, flagSource, validateFlags } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const { flagState } = await import(pathToFileURL(join(scripts, 'stamp.mjs')).href);
  const judge = (entries) => {
    const places = new Map();
    for (const e of entries) places.set(e.control, [...(places.get(e.control) ?? []), e.place]);
    const controls = [...places].map(([id, p]) => ({ id, type: 'preventive', places: p }));
    return validateFlags({ controls, source: flagSource(entries) });
  };
  const entries = parseFlags(readFileSync(FILE, 'utf8'));
  for (const e of entries) assert.notEqual(flagState(e.value), 'UNKNOWN', `${e.control}@${e.place}: ${e.value} is not a value the library recognizes`);
  assert.deepEqual(judge(entries), { ok: true, errors: [] });
  // Future flips, over made-up entries: the value and the effective state are two facts.
  const flip = (value) => [{ control: 'release/CTL40', place: 'Promoting', name: 'KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN', value }];
  for (const [value, effective] of [['advisory', 'ADVISORY'], ['off', 'ADVISORY'], ['preventing', 'PREVENTING'], ['on', 'PREVENTING'], ['stopped', 'STOPPED']]) {
    assert.deepEqual(judge(flip(value)), { ok: true, errors: [] }, `${value} is a valid flip`);
    assert.equal(flagState(value), effective, `${value} is effectively ${effective}`);
  }
  const bad = judge(flip('bogus'));
  assert.equal(bad.ok, false, 'an unknown value is refused');
  assert.deepEqual(bad.errors.map((x) => x.split(':')[1]), ['release/CTL40@Promoting'], 'and the refusal names the control and place');
  assert.equal(flagState('on'), flagState('preventing'), 'on and preventing are one effective state with two values');
}
