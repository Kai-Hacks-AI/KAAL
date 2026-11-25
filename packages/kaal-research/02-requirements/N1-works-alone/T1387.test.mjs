// Case research/T1387 tests: research/N1
import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { GOOD, FILES, scriptsDir } from '../fixture.mjs';
export const id = 'research/T1387';
export const tests = ['research/N1'];
export const title = 'the finder and the judgement run from a bare copy of the Skill folder, outside any repository, and import nothing but Node built-ins and their own folder';
export async function run() {
  assert.ok(existsSync(scriptsDir), 'the Skill scripts folder is absent');
  const scripts = readdirSync(scriptsDir).filter((f) => f.endsWith('.mjs'));
  assert.ok(scripts.includes('find-rehearsals.mjs') && scripts.includes('judge-rehearsal.mjs'), 'the finder or the judgement is absent');
  for (const f of scripts) {
    const text = readFileSync(join(scriptsDir, f), 'utf8');
    for (const m of text.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) assert.ok(m[1].startsWith('node:') || m[1].startsWith('./'), `${f} imports ${m[1]}`);
  }
  const bare = mkdtempSync(join(tmpdir(), 'research-bare-'));
  cpSync(scriptsDir, join(bare, 'scripts'), { recursive: true });
  writeFileSync(join(bare, 'RH1.md'), GOOD);
  writeFileSync(join(bare, 'files.json'), JSON.stringify(FILES));
  const find = spawnSync(process.execPath, [join(bare, 'scripts/find-rehearsals.mjs'), join(bare, 'RH1.md')], { encoding: 'utf8', cwd: bare });
  assert.equal(find.status, 0, find.stderr);
  assert.equal(JSON.parse(find.stdout).rehearsals[0].id, 'demo/RH1');
  const judge = spawnSync(process.execPath, [join(bare, 'scripts/judge-rehearsal.mjs'), join(bare, 'RH1.md'), join(bare, 'files.json')], { encoding: 'utf8', cwd: bare });
  assert.equal(judge.status, 0, judge.stderr);
  assert.equal(JSON.parse(judge.stdout).result, 'well-formed');
  writeFileSync(join(bare, 'bad.md'), GOOD.replace('verdict: favourable', 'verdict: works'));
  assert.equal(spawnSync(process.execPath, [join(bare, 'scripts/find-rehearsals.mjs'), join(bare, 'bad.md')], { encoding: 'utf8' }).status, 2, 'a refused file does not exit 2');
  assert.equal(spawnSync(process.execPath, [join(bare, 'scripts/judge-rehearsal.mjs'), join(bare, 'RH1.md')], { encoding: 'utf8' }).status, 2, 'evidence the caller does not hold does not exit 2');
}
