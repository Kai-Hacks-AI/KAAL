// Case release/T153 tests: F16
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const dir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
const hotfix = join(dir, 'hotfix.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
const chapter = (text, name) => (text.split(new RegExp(`^## ${name}$`, 'm'))[1] ?? '').split(/^## /m)[0];
export const id = 'release/T153';
export const tests = ['release/F16'];
export const title = 'the Urgency chapter asks why the correction cannot follow the ordinary path and the consequence of waiting, and rejects a ticket number or a priority label as the answer';
export function run() {
  const hint = chapter(read(hotfix, 'the Hotfix template'), 'Urgency');
  assert.ok(/ordinary/i.test(hint), 'the Urgency hint does not mention the ordinary Change path');
  assert.ok(/consequence/i.test(hint) && /waiting/i.test(hint), 'the Urgency hint does not ask for the consequence of waiting');
  assert.ok(/ticket/i.test(hint) && /priority label/i.test(hint), 'the Urgency hint does not reject a ticket number or a priority label');
}
