// Case release/T1690 tests: release/C175. Every stage of the repository is a station of the entry helper, and the list holds no other name.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const src = join(repo, 'engineering/release-management/05-src');
export const id = 'release/T1690';
export const tests = ['release/C175'];
export const title = 'every stage of the stage declaration and of the ruleset sources is in STATIONS, and STATIONS holds no other name';
export async function run() {
  const { STATIONS } = await import(pathToFileURL(join(src, 'lib/stations.mjs')).href);
  const wanted = new Set(JSON.parse(readFileSync(join(src, 'stages/stages.json'), 'utf8')).stages.map((s) => s.name));
  const dir = join(src, 'wiring/rulesets');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) for (const m of readFileSync(join(dir, f), 'utf8').matchAll(/verify Stages \((\w+)\)/g)) wanted.add(m[1]);
  for (const w of wanted) assert.ok(STATIONS.includes(w), `${w} is a stage and must be a station`);
  for (const s of STATIONS) assert.ok(wanted.has(s), `${s} is neither a stage of the declaration nor of a ruleset source`);
  assert.equal(new Set(STATIONS).size, STATIONS.length, 'no duplicate');
}
