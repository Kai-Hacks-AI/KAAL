// Case controls/T1742 tests: controls/F239
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const FILE = join(repo, 'engineering/14-operations/controls/flags.json');
const scripts = join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts');
export const id = 'controls/T1742';
export const tests = ['controls/F239'];
export const title = 'KAAL\'s first flags file holds exactly release/CTL40 and release/CTL41 at four stations, each named in the convention and advisory, for controls that exist and are declared preventive';
const STATIONS = ['Collecting', 'Hotfixing', 'Promoting', 'Wiring'];
const NAMES = { 'release/CTL40': 'KAAL_RELEASE_VERIFY_PROMOTION_ORIGIN', 'release/CTL41': 'KAAL_RELEASE_VERIFY_PROMOTION_HEAD_EVIDENCE' };
export async function run() {
  assert.ok(existsSync(FILE), 'engineering/14-operations/controls/flags.json is absent');
  const { parseFlags, flagSource } = await import(pathToFileURL(join(scripts, 'flags.mjs')).href);
  const entries = parseFlags(readFileSync(FILE, 'utf8'));
  assert.equal(entries.length, 8, 'eight entries, no more and no fewer');
  assert.deepEqual([...new Set(entries.map((e) => e.control))].sort(), ['release/CTL40', 'release/CTL41']);
  const source = flagSource(entries);
  for (const control of Object.keys(NAMES)) for (const place of STATIONS) {
    const flag = source.of(control, place);
    assert.ok(flag, `${control}@${place} has no entry`);
    assert.equal(flag.name, NAMES[control], `${control}@${place} is not named in the convention`);
    assert.equal(flag.value, 'advisory', `${control}@${place} is not advisory`);
  }
  for (const [control, dir] of [['CTL40', 'CTL40-verify-promotion-origin'], ['CTL41', 'CTL41-verify-promotion-head-evidence']]) {
    const record = join(repo, 'engineering/release-management/04-controls', dir, `${control}.md`);
    assert.ok(existsSync(record), `release/${control} has no record, so the file would name a control that is not there`);
    assert.match(readFileSync(record, 'utf8'), /^type: preventive$/m, `release/${control} is not declared preventive`);
  }
}
