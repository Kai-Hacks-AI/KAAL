// Case release/T198 tests: G55
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
export const id = 'release/T198';
export const tests = ['release/G55'];
export const title = 'gap release/G55 is closed: every pull request template opens its body with the one Change envelope cue';
function templates() {
  const dir = join(repo, '.github/PULL_REQUEST_TEMPLATE');
  const files = existsSync(dir) ? readdirSync(dir).filter((name) => name.endsWith('.md')).map((name) => join(dir, name)) : [];
  for (const path of [join(repo, '.github/pull_request_template.md'), join(repo, 'engineering/release-management/03-architecture/A41-fallback-template/fallback-template.md')]) if (existsSync(path)) files.push(path);
  return files;
}
// The body text of a template is what is left once HTML comments are removed.
function withoutComments(text) {
  let out = '';
  let at = 0;
  for (;;) {
    const open = text.indexOf('<!--', at);
    if (open === -1) return out + text.slice(at);
    const close = text.indexOf('-->', open + 4);
    if (close === -1) return out + text.slice(at, open);
    out += text.slice(at, open);
    at = close + 3;
  }
}
const body = (text) => withoutComments(text).split('\n').map((line) => line.trimEnd()).filter((line, index, all) => line !== '' || all.slice(0, index).some((l) => l !== '')).join('\n');
export function run() {
  const found = templates();
  assert.ok(found.length >= 6, `expected every template to be found, found ${found.length}`);
  for (const path of found) {
    const visible = body(readFileSync(path, 'utf8'));
    assert.equal(visible.split('\n')[0], CUE, `${path.slice(repo.length + 1)} does not open its body with the Change envelope cue`);
    assert.equal(visible.split(CUE).length - 1, 1, `${path.slice(repo.length + 1)} holds the cue more than once`);
  }
}
