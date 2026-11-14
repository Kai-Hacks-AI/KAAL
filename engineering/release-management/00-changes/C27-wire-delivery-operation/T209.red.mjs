// Case release/T209 tests: F22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T209';
export const tests = ['release/F22'];
export const title = 'the WIRE template has exactly the chapters Source, Target and Verification, and is installed as drafted';

const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
// A template is right when it opens with the envelope cue once and holds exactly these H2 chapters in this order.
export function judge(text) {
  const heads = [...text.matchAll(/^## (.*)$/gm)].map((m) => m[1]);
  const cues = text.split('\n').filter((l) => l === CUE).length;
  return cues === 1 && heads.join('|') === 'Source|Target|Verification';
}
const draft = (text) => {
  const after = text.split(/^## Draft of the template$/m)[1];
  assert.ok(after, 'the draft section is absent');
  const m = after.match(/^```\n([\s\S]*?)\n```$/m);
  assert.ok(m, 'the fenced draft is absent');
  return `${m[1]}\n`;
};
export function run() {
  const good = `${CUE}\n\n## Source\n\n## Target\n\n## Verification\n`;
  assert.equal(judge(good), true);
  assert.equal(judge(good.replace('## Verification', '## Evidence')), false, 'a renamed chapter is accepted');
  assert.equal(judge(good.replace('## Target\n\n', '')), false, 'a missing chapter is accepted');
  assert.equal(judge(`${good}\n## Notes\n`), false, 'an extra chapter is accepted');
  assert.equal(judge(good.replace(CUE, '')), false, 'a missing cue is accepted');
  assert.equal(judge(`${CUE}\n${good}`), false, 'a repeated cue is accepted');
  const iface = join(repo, 'engineering/release-management/00-changes/C27-wire-delivery-operation/interface.md');
  assert.ok(existsSync(iface), 'the interface is absent');
  const text = draft(readFileSync(iface, 'utf8'));
  assert.ok(judge(text), 'the draft is not a WIRE template');
  const installed = join(repo, '.github/PULL_REQUEST_TEMPLATE/wire.md');
  assert.ok(existsSync(installed), 'the WIRE template is not installed');
  assert.equal(readFileSync(installed, 'utf8'), text, 'the installed template differs from the draft');
}
