// Case testing/T361 tests: testing/F136. It checks that each owner's judgment is recorded by that owner, never what the judgment says.
import assert from 'node:assert/strict';
import { VERDICTS, ownerOf, readSurvey, surveyOnDisk } from './lib.mjs';
export const id = 'testing/T361';
export const tests = ['testing/F136'];
export const title = 'every positively owned node has exactly one judgment of its Cases, recorded by the owning concern with evidence and reasoning';
export function run() {
  const s = surveyOnDisk();
  const owned = new Map();
  for (const c of s.cases.filter((x) => x.status === 'owned'))
    for (const n of c.nodes) owned.set(n.id, [...(owned.get(n.id) ?? []), c.case]);
  const j = readSurvey('judgments.json').judgments;
  assert.ok(Array.isArray(j), 'judgments is a list');
  assert.deepEqual(j.map((x) => x.node).sort(), [...owned.keys()].sort(), 'one judgment for each positively owned node, and none for another');
  for (const x of j) {
    assert.equal(x.judge, ownerOf(x.node), `${x.node}: judged by its owning concern "${ownerOf(x.node)}", not by another`);
    assert.deepEqual([...x.cases].sort(), owned.get(x.node).sort(), `${x.node}: names all and only the Cases the survey links to it`);
    assert.ok(VERDICTS.includes(x.verdict), `${x.node}: verdict "${x.verdict}" is none of ${VERDICTS.join(', ')}`);
    assert.ok(typeof x.reasoning === 'string' && x.reasoning.trim() !== '', `${x.node}: states its reasoning`);
    assert.ok((Array.isArray(x.evidence) ? x.evidence : [x.evidence]).filter((e) => typeof e === 'string' && e.trim()).length > 0, `${x.node}: names its evidence`);
  }
  assert.ok(new Set(j.map((x) => x.judge)).size >= 2, 'at least two owning concerns judged their own Cases');
}
