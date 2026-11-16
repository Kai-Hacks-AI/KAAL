// Case release/T503 tests: F54
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T503';
export const tests = ['release/F54'];
export const title = 'the Skill vocabulary reference equals its draft, states every term of the concept and names no platform';

const draft = (text) => {
  const after = text.split(/^## Draft of the Skill vocabulary reference$/m)[1];
  assert.ok(after, 'the draft section is absent');
  const m = after.match(/^```\n([\s\S]*?)\n```$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export function run() {
  const iface = join(repo, 'engineering/release-management/00-changes/C36-release-stages/interface.md');
  assert.ok(existsSync(iface), 'the interface is absent');
  const text = draft(readFileSync(iface, 'utf8'));
  const src = join(repo, 'engineering/release-management/05-src/stages/stages-reference.md');
  assert.ok(existsSync(src), 'the vocabulary reference is absent from the Engineering sources');
  const ref = readFileSync(src, 'utf8');
  assert.equal(ref, text, 'the reference differs from the draft');
  for (const term of ['Stage', 'Subject', 'gate', 'Evidence', 'UNKNOWN never passes', 'authority', 'transition', 'route', 'binding']) {
    assert.ok(ref.includes(term), `the reference does not state "${term}"`);
  }
  assert.ok(!/github|githooks|\bnpm\b|ruleset/i.test(ref), 'the reference names a platform');
}
