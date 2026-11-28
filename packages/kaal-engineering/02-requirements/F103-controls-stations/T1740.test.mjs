// Case engineering/T1740 tests: engineering/F103
import assert from 'node:assert/strict';
import { entry } from './fixture.mjs';
export const id = 'engineering/T1740';
export const tests = ['engineering/F103'];
export const title = 'registry-run and evidence-run import STATIONS from the stations module of release and pass it to the finder';
export async function run() {
  const from = /import\s*\{[^}]*\bSTATIONS\b[^}]*\}\s*from\s+['"][./]*engineering\/release-management\/05-src\/lib\/stations\.mjs['"]/;
  for (const name of ['registry-run.mjs', 'evidence-run.mjs']) {
    const text = entry(name);
    assert.ok(text !== null, `${name} is absent`);
    assert.match(text, from, `${name} does not import STATIONS from the stations module of release`);
  }
  assert.match(entry('registry-run.mjs'), /registryAt\([^)]*\bSTATIONS\b[^)]*\)/, 'registry-run does not pass STATIONS to registryAt');
  assert.match(entry('evidence-run.mjs'), /findControls\([^)]*stations:\s*STATIONS[^)]*\)/, 'evidence-run does not pass STATIONS to findControls');
}
