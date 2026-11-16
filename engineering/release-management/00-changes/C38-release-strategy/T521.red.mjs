// Case release/T521 tests: C38 (the release strategy document)
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T521';
export const tests = ['release/C38'];
export const title = 'the chain block of strategy.md agrees with stages.json: same stages, same order, same parts, challenges between declared stages';

export function parseChain(text) {
  const m = text.match(/^```chain\n([\s\S]*?)\n```$/m);
  assert.ok(m, 'the chain block is absent');
  const stages = [];
  let challenges = [];
  for (const line of m[1].split('\n')) {
    const c = line.match(/^challenges:\s*(.+)$/);
    if (c) { challenges = c[1].split(',').map((x) => x.trim().split('>').map((y) => y.trim())); continue; }
    const s = line.match(/^(\d+) ([A-Za-z]+)(?:: (.+))?$/);
    assert.ok(s, `the chain line "${line}" is not understood`);
    stages.push({ order: Number(s[1]), name: s[2], parts: s[3] ? s[3].split(',').map((x) => x.trim()) : [] });
  }
  return { stages, challenges };
}

export function run() {
  const strategy = join(repo, 'engineering/release-management/strategy.md');
  assert.ok(existsSync(strategy), 'strategy.md is absent from the root of release-management');
  const { stages, challenges } = parseChain(readFileSync(strategy, 'utf8'));
  const json = JSON.parse(readFileSync(join(repo, 'engineering/release-management/05-src/stages/stages.json'), 'utf8'));
  assert.deepEqual(stages.map((s) => s.name), json.stages.map((s) => s.name), 'the stages or their order differ from stages.json');
  assert.deepEqual(stages.map((s) => s.order), stages.map((_, i) => i + 1), 'the chain is not numbered 1 to n');
  for (const s of stages) assert.deepEqual(s.parts, (json.stages.find((j) => j.name === s.name).parts ?? []).map((p) => p.name), `the parts of ${s.name} differ from stages.json`);
  assert.ok(challenges.length > 0, 'the chain names no challenge');
  const pos = (n) => stages.findIndex((s) => s.name === n);
  const seen = new Set();
  for (const [who, whom] of challenges) {
    assert.ok(pos(who) >= 0 && pos(whom) >= 0, `the challenge ${who} > ${whom} names an undeclared stage`);
    assert.notEqual(who, whom, `${who} challenges itself in the chain; a self-check is implied`);
    assert.ok(Math.abs(pos(who) - pos(whom)) === 1, `the challenge ${who} > ${whom} is not between neighbours`);
    assert.ok(!seen.has(whom), `${whom} is challenged twice`);
    seen.add(whom);
  }
}
