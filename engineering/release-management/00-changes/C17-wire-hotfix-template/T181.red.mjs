// Case release/T181 tests: G49
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const interfaceDoc = join(cap, '00-changes/C11-hotfix/interface.md');
const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/hotfix.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const draft = (text) => {
  const after = text.split(/^## Draft of the template$/m)[1];
  assert.ok(after, 'the draft section is absent');
  const m = after.match(/^```\n([\s\S]*?)\n```$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export const id = 'release/T181';
export const tests = ['release/G49'];
export const title = 'gap release/G49 is closed: A39 is present and the installed template is the Hotfix draft';
export function run() {
  read(join(cap, '03-architecture/A36-create-hotfix/A39-github/A39.md'), 'A39');
  assert.equal(read(installed, 'the installed HOTFIX template'), draft(read(interfaceDoc, 'the Hotfix interface')));
}
