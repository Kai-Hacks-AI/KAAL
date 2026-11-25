// Case controls/T1508 tests: controls/F202
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const rehearsals = join(repo, 'packages/kaal-controls/02-learnings/rehearsals');
const judge = join(repo, 'packages/kaal-research/skills/kaal-research/scripts/judge-rehearsal.mjs');
export const id = 'controls/T1508';
export const tests = ['controls/F202'];
export const title = 'each of Claude, Codex and Antigravity has a well-formed Research rehearsal record of the trial, and the Skill passes the pass bar on the scores of each';
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const field = (text, name) => (text.match(new RegExp(`^${name}:\\s*(.*)$`, 'm')) || [])[1] || '';
const applies = { P1: ['R2', 'R3', 'R4', 'R5', 'R6'], P2: ['R3', 'R4', 'R5', 'R6'], P3: ['R2', 'R6'] };
export async function run() {
  assert.ok(existsSync(judge), 'the Research Skill is absent');
  const { judgeRehearsal } = await import(pathToFileURL(judge).href);
  assert.ok(existsSync(rehearsals), '02-learnings/rehearsals is absent: the trial has not been run');
  const records = readdirSync(rehearsals, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(rehearsals, d.name, `${d.name}.md`)).filter(existsSync).map((p) => ({ p, text: readFileSync(p, 'utf8') })).filter((r) => /ratchet/i.test(field(r.text, 'question')));
  for (const agent of ['claude', 'codex', 'antigravity']) {
    const mine = records.filter((r) => field(r.text, 'harness').toLowerCase().includes(agent));
    assert.equal(mine.length, 1, `${agent}: expected one record of the trial, found ${mine.length}`);
    const { p, text } = mine[0];
    const evidence = [...text.matchAll(/- role: (\S+)\n\s+path: (\S+)\n\s+sha256: (\S+)/g)].map((m) => ({ role: m[1], path: m[2], sha256: m[3] }));
    const files = evidence.filter((e) => existsSync(join(dirname(p), e.path))).map((e) => ({ path: e.path, sha256: createHash('sha256').update(readFileSync(join(dirname(p), e.path))).digest('hex') }));
    const verdict = judgeRehearsal(text, files);
    assert.equal(verdict.result, 'well-formed', `${agent}: the record is ${verdict.result}: ${JSON.stringify(verdict.problems)}`);
    const sc = evidence.find((e) => e.role === 'scores');
    assert.ok(sc && sc.path.endsWith('scores.json'), `${agent}: the record has no scores.json as its scores`);
    const runs = JSON.parse(readFileSync(join(dirname(p), sc.path), 'utf8')).runs;
    assert.ok(Array.isArray(runs), `${agent}: scores.json has no runs`);
    for (const x of runs) {
      assert.ok(applies[x.prompt], `${agent}: unknown prompt ${x.prompt}`);
      for (const k of applies[x.prompt]) assert.ok(Number.isInteger(x.scores?.[k]) && x.scores[k] >= 0 && x.scores[k] <= 3, `${agent}: ${x.arm} ${x.prompt} lacks a score 0 to 3 for ${k}`);
    }
    const arm = (a) => runs.filter((x) => x.arm === a);
    const s = arm('skill'), b = arm('blank');
    for (const prompt of Object.keys(applies)) for (const set of [s, b]) assert.ok(set.filter((x) => x.prompt === prompt).length >= 3, `${agent}: fewer than three runs of ${prompt} in an arm`);
    assert.ok(s.every((x) => x.opened === true), `${agent}: a skill run did not open SKILL.md`);
    const per = (set, k) => mean(set.filter((x) => k in x.scores).map((x) => x.scores[k]));
    for (const k of ['R2', 'R3', 'R4', 'R5']) assert.ok(per(s, k) >= 2, `${agent}: mean ${k} is below 2`);
    assert.equal(per(s, 'R6'), 3, `${agent}: mean R6 is not 3`);
    for (const k of ['R2', 'R3', 'R4', 'R5', 'R6']) assert.ok(per(s, k) >= per(b, k), `${agent}: the skill arm is below the blank arm on ${k}`);
  }
}
