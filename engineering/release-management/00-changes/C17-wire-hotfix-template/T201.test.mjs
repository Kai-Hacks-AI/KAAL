// Case release/T201 tests: G57
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const interfaceDoc = join(cap, '00-changes/C11-hotfix/interface.md');
const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const draft = (text) => {
  const after = text.split(/^## Draft of the template$/m)[1];
  assert.ok(after, 'the draft section is absent');
  const m = after.match(/^```\n([\s\S]*?)\n```$/m);
  assert.ok(m, 'the fenced draft is absent');
  return m[1];
};
// Visible text: everything outside <!-- ... --> spans, removed span by span, so no comment opener can survive.
const stripComments = (text) => {
  let out = '';
  let rest = text;
  for (;;) {
    const open = rest.indexOf('<!--');
    if (open === -1) return out + rest;
    out += rest.slice(0, open);
    const close = rest.indexOf('-->', open + 4);
    assert.ok(close !== -1, 'a comment in the draft is not closed');
    rest = rest.slice(close + 3);
  }
};
export const id = 'release/T201';
export const tests = ['release/G57'];
export const title = 'gap release/G57 is closed: the Hotfix template draft opens its visible body with the one Change envelope cue, before the Change chapter';
export function run() {
  const visible = stripComments(draft(read(interfaceDoc, 'the Hotfix interface'))).split('\n').map((line) => line.trimEnd()).filter((line) => line !== '');
  assert.equal(visible[0], CUE, 'the Hotfix draft does not open its visible body with the Change envelope cue');
  assert.equal(visible.filter((line) => line === CUE).length, 1, 'the Hotfix draft holds the cue more than once');
  assert.equal(visible[1], '## Change', 'the cue is not followed directly by the Change chapter');
}
