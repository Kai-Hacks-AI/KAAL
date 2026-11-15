// Case release/T139 tests: F15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T139';
export const tests = ['release/F15'];
export const title = 'F15 states the title form PROMOTION: <meaningful description> without a Change id, and the observed old titles do not have it';
const titleOk = (t) => /^PROMOTION: \S/.test(t) && !/release\/C\d+|kaal\/|#\d+/.test(t);
export function run() {
  assert.equal(titleOk('PROMOTION: Make DO template available'), true, 'a title of the convention is rejected');
  assert.equal(titleOk('Promote kaal/release/do-template into main: the DO template Change (release/C7) PLAN and Cases'), false, 'an observed old title is accepted');
  assert.equal(titleOk('PROMOTION: release/C7 do template'), false, 'a title with a Change id is accepted');
  const text = read(join(repo, 'engineering/release-management/02-requirements/F15-promotion-interface/F15.md'), 'F15');
  assert.ok(text.includes('PROMOTION: <meaningful description>') && /no Change id/.test(text), 'F15 does not state the title form');
  assert.ok(/stable id stays in the Change chapter/.test(text), 'F15 does not keep the id in the body');
}
