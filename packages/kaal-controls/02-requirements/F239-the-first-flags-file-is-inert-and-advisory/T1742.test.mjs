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
export const title = 'KAAL\'s flags file is a flag file the library parses, every entry names a control that has a record, and each control has one flag name in the convention KAAL_<CAPABILITY>_<CONTROL> at every place';
// An enduring Case: it holds for the first file and for every later entry, flip or WIRE. What the first file held is acceptance evidence of C181, not a permanent rule.
const recordOf = (control) => {
  const n = control.split('/')[1];
  const base = join(repo, 'engineering');
  return readdirSync(base).map((d) => join(base, d, '04-controls')).filter(existsSync)
    .flatMap((c) => readdirSync(c).filter((d) => d.startsWith(`${n}-`)).map((d) => join(c, d, `${n}.md`))).find(existsSync);
};
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const entries = parseFlags(readFileSync(FILE, 'utf8'));
  const names = new Map();
  for (const e of entries) {
    assert.ok(recordOf(e.control), `${e.control} has no record, so the file names a control that is not there`);
    const [capability] = e.control.split('/');
    assert.match(e.name, new RegExp(`^KAAL_${capability.toUpperCase()}_[A-Z][A-Z0-9_]*$`), `${e.control}@${e.place}: ${e.name} is not in the convention`);
    assert.equal(names.get(e.control) ?? e.name, e.name, `${e.control} has two flag names`);
    names.set(e.control, e.name);
  }
}
