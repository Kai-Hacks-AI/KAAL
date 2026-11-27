// Case release/T1634 tests: release/C167. No entry names a mode literal, maps a flag value to a mode or sets an exit code of its own: the record, the controls instance and the library are the only sources.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const src = join(repo, 'engineering/release-management/05-src');
export const id = 'release/T1634';
export const tests = ['release/C167'];
export const title = 'no entry names a mode literal, maps a flag value to a mode or sets its own exit code';
const code = (t) => t.split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.replace(/\s\/\/.*$/, '')).join('\n');
export async function run() {
  const files = [];
  for (const d of ['lineage', 'promotion-source', 'change-isolation']) for (const f of readdirSync(join(src, d))) if (f.startsWith('judge-')) files.push(join(d, f));
  for (const f of ['lineage/lib/answer.mjs', 'promotion-source/lib/run.mjs', 'change-isolation/lib/report.mjs']) files.push(f);
  for (const f of files) {
    const t = code(readFileSync(join(src, f), 'utf8'));
    assert.doesNotMatch(t, /['"`](detective|preventive|ratchet)['"`]/, `${f} names a mode literal`);
    assert.doesNotMatch(t, /\b(advisory|preventing|stopped)\b/, `${f} maps a flag value`);
  }
  // the exit of an adopted entry is the library's, never a literal of the entry's own
  for (const f of ['lineage/lib/answer.mjs', 'promotion-source/lib/run.mjs', 'change-isolation/lib/report.mjs']) assert.match(code(readFileSync(join(src, f), 'utf8')), /exitOf\(/, `${f} returns the library's exit when adopted`);
  const helper = code(readFileSync(join(src, 'lib/entry-flag.mjs'), 'utf8'));
  assert.doesNotMatch(helper, /['"`](advisory|preventing|stopped|on|off)['"`]/, 'the helper maps no flag value');
}
