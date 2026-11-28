// The workflow facts the Cases of release/C168 share, read from the workflow files as text (no YAML parser).
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const REQUIRED = ['Change Isolation', 'Branching', 'Promotion Source', 'Change Isolation (review)'];
const SRC = join(repo, 'engineering/release-management/05-src/wiring/workflows');
const GH = join(repo, '.github/workflows');
const unq = (v) => v.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
// One workflow as the repository will have it: the wiring source when there is one, else the file of .github.
export function workflows() {
  const files = new Map();
  for (const f of readdirSync(GH).filter((x) => x.endsWith('.yml'))) files.set(f, join(GH, f));
  for (const f of readdirSync(SRC).filter((x) => x.endsWith('.yml'))) files.set(f, join(SRC, f));
  return [...files].map(([file, path]) => parse(file, readFileSync(path, 'utf8')));
}
export function parse(file, text) {
  const lines = text.split('\n');
  const on = []; let inOn = false;
  for (const l of lines) { if (/^on:/.test(l)) { inOn = true; on.push(l); continue; } if (inOn && /^\S/.test(l)) inOn = false; if (inOn) on.push(l); }
  const onText = on.join('\n');
  const jobs = []; let cur = null; let inJobs = false;
  for (const l of lines) {
    if (/^jobs:/.test(l)) { inJobs = true; continue; }
    if (!inJobs) continue;
    const m = /^  ([A-Za-z0-9_-]+):\s*$/.exec(l);
    if (m) { cur = { id: m[1], name: null, needs: null, ifs: null, permissions: null, lines: [] }; jobs.push(cur); continue; }
    if (!cur) continue;
    cur.lines.push(l);
    let k;
    if ((k = /^    name:\s*(.*)$/.exec(l))) cur.name = unq(k[1]);
    if ((k = /^    needs:\s*\[(.*)\]\s*$/.exec(l))) cur.needs = k[1].split(',').map((x) => x.trim()).filter(Boolean);
    if ((k = /^    if:\s*(.*)$/.exec(l))) cur.ifs = k[1].trim();
    if ((k = /^    permissions:\s*(.*)$/.exec(l))) cur.permissions = k[1].trim() || 'block';
  }
  return { file, text, onText, pullRequest: /pull_request(?!_target)/.test(onText), target: /pull_request_target/.test(onText), mergeGroup: /merge_group/.test(onText), jobs };
}
export const reporters = (ws, name, pick) => ws.filter(pick).flatMap((w) => w.jobs.filter((j) => j.name === name).map((j) => ({ file: w.file, job: j.id })));

// Runs the script of an aggregator job as the runner would, with the results of the jobs it needs as `{ id: result }` (a result of null or undefined is a job that reported nothing).
import { spawnSync } from 'node:child_process';
export function runAggregator(job, results) {
  const body = job.lines.join('\n');
  const script = /run: \|\n((?:\s{10}.*\n?)+)/.exec(body)[1];
  const expected = /EXPECTED: "([^"]*)"/.exec(body)?.[1] ?? '';
  const needs = {};
  for (const [k, v] of Object.entries(results)) if (v !== undefined) needs[k] = { result: v, outputs: {} };
  const r = spawnSync('bash', ['-c', script], { env: { PATH: process.env.PATH, NEEDS: JSON.stringify(needs), EXPECTED: expected }, encoding: 'utf8' });
  return { status: r.status, stderr: r.stderr };
}
export const AGGREGATORS = [['change-isolation-plain.yml', 'Change Isolation', ['github-alone', 'delivery']], ['branching-plain.yml', 'Branching', ['freshness', 'synchronization', 'auto-merge']], ['promotion-source-plain.yml', 'Promotion Source', ['origin', 'head-evidence']]];
