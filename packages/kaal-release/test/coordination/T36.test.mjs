// Case coordination/T36 tests: F1, F7, F10 (deterministic, rendered, standalone, host-neutral)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { config, piece, render, scriptPath, showWip } from './fixtures.mjs';
export const id = 'coordination/T36';
export const tests = ['coordination/F1', 'coordination/F7', 'coordination/F10'];
export const title = 'the same files give the same report and text, a line reads #ref TYPE from → into DISPOSITION reason, the Script runs from a command line with an empty environment, imports only built-ins, calls no network, process or write API, and holds no KAAL identity or host term';
const FORBIDDEN = [/kaal\//i, /\bverify (?:Plan|Envelope)\b/, /\bapprove (?:Change|Publishing|Promotion)\b/, /\bguard \(Integration\)/i];
const HOST = [/\bpull requests?\b/i, /\bmerg(?:e|es|ed|ing)\b/i, /\bPRs?\b/, /\bgit(?:hub)?\b/i, /\bbranch(?:es)?\b/i, /\bcommits?\b/i];
export async function run() {
  const facts = { pieces: [piece(2, { review: 'none' }), piece(1, { checks: 'failure', title: 'PLAN: plan it' })], gaps: ['a gap'] };
  const report = await showWip(facts, config());
  assert.deepEqual(await showWip(JSON.parse(JSON.stringify(facts)), config()), report, 'the report is not deterministic');
  const text = await render(report);
  assert.equal(text, await render(report), 'the rendering is not deterministic');
  assert.match(text, /^#1 +PLAN +work-1 → col\/a +WORK +.*checks?.*fail/mi, 'the line is not #ref TYPE from → into DISPOSITION reason');
  assert.match(text, /^#2 +DO +work-2 → col\/a +REVIEW +/m);
  assert.match(text, /Integration/);
  assert.match(text, /a gap/, 'the not-observed list is not printed');

  const source = readFileSync(scriptPath, 'utf8');
  for (const m of source.matchAll(/(?:import\s[^'"]*from|import\()\s*['"]([^'"]+)['"]/g)) assert.match(m[1], /^node:/, `${m[1]} is not a built-in`);
  assert.ok(!/\b(fetch|XMLHttpRequest|child_process|spawn|exec|writeFile|appendFile|mkdir|rmSync|unlink|process\.env)\b/.test(source.replace(/\/\/.*$/gm, '')), 'the Script touches the network, a process, a write or the environment');
  for (const pattern of [...FORBIDDEN, ...HOST]) assert.ok(!pattern.test(source), `the Script holds ${pattern}`);

  const work = mkdtempSync(join(tmpdir(), 'show-wip-'));
  writeFileSync(join(work, 'facts.json'), JSON.stringify(facts));
  writeFileSync(join(work, 'config.json'), JSON.stringify(config()));
  const out = spawnSync(process.execPath, [scriptPath, join(work, 'facts.json'), join(work, 'config.json')], { cwd: work, env: {}, encoding: 'utf8' });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stdout.trimEnd(), text.trimEnd(), 'the command line prints something else than the rendering');
  const bad = spawnSync(process.execPath, [scriptPath, join(work, 'nope.json'), join(work, 'config.json')], { cwd: dirname(work), env: {}, encoding: 'utf8' });
  assert.notEqual(bad.status, 0, 'an unreadable input did not fail');
}
