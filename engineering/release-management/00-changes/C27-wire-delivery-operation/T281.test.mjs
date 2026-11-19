// Case release/T281 tests: F22
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T281';
export const tests = ['release/F22'];
export const title = 'the WIRE template source has exactly the chapters Source, Target and Verification, as drafted';

const CUE = '**Change envelope.** The evidence is in the repository files of the Change(s) named below, at the revision under review.';
// A template is right when it opens with the envelope cue once and holds exactly these H2 chapters in this order.
export function judge(text) {
  const heads = [...text.matchAll(/^## (.*)$/gm)].map((m) => m[1]);
  const cues = text.split('\n').filter((l) => l === CUE).length;
  return cues === 1 && heads.join('|') === 'Source|Target|Verification';
}
export function run() {
  const good = `${CUE}\n\n## Source\n\n## Target\n\n## Verification\n`;
  assert.equal(judge(good), true);
  assert.equal(judge(good.replace('## Verification', '## Evidence')), false, 'a renamed chapter is accepted');
  assert.equal(judge(good.replace('## Target\n\n', '')), false, 'a missing chapter is accepted');
  assert.equal(judge(`${good}\n## Notes\n`), false, 'an extra chapter is accepted');
  assert.equal(judge(good.replace(CUE, '')), false, 'a missing cue is accepted');
  assert.equal(judge(`${CUE}\n${good}`), false, 'a repeated cue is accepted');
  const src = join(repo, 'engineering/release-management/05-src/wiring/templates/wire.md');
  assert.ok(existsSync(src), 'the WIRE template source is absent from the Engineering wiring sources');
  assert.ok(judge(readFileSync(src, 'utf8')), 'the template source is not a WIRE template');
}
