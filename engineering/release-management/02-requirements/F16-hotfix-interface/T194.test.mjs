// Case release/T194 tests: F16
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const doc = join(repo, 'engineering/release-management/00-changes/C11-hotfix/interface.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const chapter = (text, name) => (text.split(new RegExp(`^## ${name}$`, 'm'))[1] ?? '').split(/^## /m)[0];
export const id = 'release/T194';
export const tests = ['release/F16'];
export const title = 'the Defect hint of the template draft asks for the KAAL Defect identity, and the Urgency and Approach hints do not';
export function run() {
  const draft = read(doc, 'the Hotfix interface').split(/^## Draft of the template$/m)[1] ?? '';
  assert.ok(draft, 'the draft section is absent');
  const hint = chapter(draft, 'Defect');
  assert.ok(/KAAL Defect/.test(hint), 'the Defect hint does not ask for a KAAL Defect');
  assert.ok(/<capability>\/D<n>/.test(hint), 'the Defect hint does not give the identity form');
  assert.ok(/GitHub issue or (a )?URL is not/i.test(hint), 'the Defect hint does not say that a GitHub issue or URL is not the identity');
  for (const name of ['Urgency', 'Approach']) assert.ok(!/KAAL Defect/.test(chapter(draft, name)), `the ${name} hint must not carry the Defect reference`);
}
