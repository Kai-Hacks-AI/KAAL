// Case change/T286 tests: change/G4
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
export const id = 'change/T286';
export const tests = ['change/G4'];
export const title = "gap change/G4 is closed: a Defect records the stage of introduction and of discovery";
const REF = new URL('../../skills/kaal-change/references/measurement.md', import.meta.url);
export function run() {
  assert.ok(existsSync(REF), 'the measurement reference is absent');
  const t = readFileSync(REF, 'utf8');
  for (const w of ['introduced-stage:','found-stage:','closed-by:','red-case:']) assert.ok(t.includes(w), 'missing: ' + w);
}
test(id, () => run());
