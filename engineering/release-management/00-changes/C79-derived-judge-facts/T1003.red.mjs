// Case release/T1003 tests: release/C79
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const CHANGE = join(RM, '00-changes/C79-derived-judge-facts');
export const id = 'release/T1003';
export const tests = ['release/C79'];
export const title = 'the shared helper and fixtures of the judge Cases hold no hand-kept list of controls';
export async function run() {
  for (const f of ['00-changes/C35-stages/helper.mjs', '00-changes/C70-stages-declared-rules/fixtures.mjs']) {
    const text = readFileSync(join(RM, f), 'utf8');
    assert.ok(!/\bCONTROLS\s*=/.test(text), f + ' still holds a CONTROLS list');
  }
}
