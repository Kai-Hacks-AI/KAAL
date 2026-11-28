// Case controls/T1742 tests: controls/F239
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'engineering/14-operations/controls/flags.json');
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1742';
export const tests = ['controls/F239'];
export const title = 'KAAL\'s flags file is a flag file the library parses, every entry names a control whose record carries that exact id (capability and control), and each control has one flag name in the convention KAAL_<CAPABILITY>_<CONTROL>; a control of another capability with the same number is refused';
// An enduring Case: it holds for the first file and for every later entry, flip or WIRE. What the first file held is acceptance evidence of C181, not a permanent rule.
// The ids of the control records of the repository: the `id:` of each record, so `release/CTL40` is not `core/CTL40`.
const recordIds = () => {
  const base = join(repo, 'engineering');
  const ids = new Set();
  for (const d of readdirSync(base)) {
    const c = join(base, d, '04-controls');
    if (!existsSync(c)) continue;
    for (const r of readdirSync(c)) {
      const f = join(c, r, `${r.split('-')[0]}.md`);
      const m = existsSync(f) && /^id:\s*(\S+)\s*$/m.exec(readFileSync(f, 'utf8'));
      if (m) ids.add(m[1]);
    }
  }
  return ids;
};
export function problemsOf(entries, ids) {
  const problems = [];
  const names = new Map();
  for (const e of entries) {
    if (!ids.has(e.control)) problems.push(`${e.control} has no record with that id`);
    const [capability] = e.control.split('/');
    if (!new RegExp(`^KAAL_${capability.toUpperCase()}_[A-Z][A-Z0-9_]*$`).test(e.name)) problems.push(`${e.control}@${e.place}: ${e.name} is not in the convention`);
    if ((names.get(e.control) ?? e.name) !== e.name) problems.push(`${e.control} has two flag names`);
    names.set(e.control, e.name);
  }
  return problems;
}
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const ids = recordIds();
  assert.deepEqual(problemsOf(parseFlags(readFileSync(FILE, 'utf8')), ids), [], 'the flags file names no control without a record of that id, and every name follows the convention');
  // The judge itself, over made-up entries, so the rule does not depend on what the file holds today.
  const known = new Set(['release/CTL40', 'release/CTL41']);
  const e = (control, place, name, value) => ({ control, place, name, value });
  assert.deepEqual(problemsOf([e('release/CTL40', 'Promoting', 'KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN', 'advisory')], known), [], 'a known control in the convention is accepted');
  assert.equal(problemsOf([e('core/CTL40', 'Promoting', 'KAAL_CORE_X', 'advisory')], known).length, 1, 'the same number in another capability has no record, so it is refused');
  assert.equal(problemsOf([e('release/CTL99', 'Promoting', 'KAAL_RELEASE_X', 'advisory')], known).length, 1, 'an unknown control number is refused');
  assert.equal(problemsOf([e('release/CTL40', 'Promoting', 'KAAL_CORE_X', 'advisory')], known).length, 1, 'a name of another capability is outside the convention');
  assert.equal(problemsOf([e('release/CTL40', 'Promoting', 'KAAL_RELEASE_A', 'advisory'), e('release/CTL40', 'Wiring', 'KAAL_RELEASE_B', 'advisory')], known).length, 1, 'two names for one control are refused');
}
