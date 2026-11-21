// Case architecture/T10 tests: architecture/F12
import assert from 'node:assert/strict';
import { arm, read, requests, TOPICS } from './lib.mjs';
export const id = 'architecture/T10';
export const tests = ['architecture/F12'];
export const title = "the five realistic requests cover the five topics, at least two mix in a move between states, at least two also speak of the architecture description itself, they carry no answer, and both recorded arms saw exactly these requests";
export function run() {
  read('00-changes/C2-realistic-trial/F12.md', 'F12');
  const rs = requests();
  assert.equal(rs.length, 5, 'there are not five requests');
  assert.deepEqual(rs.map((r) => r.topic).sort(), [...TOPICS].sort(), 'the topics are not the five named');
  assert.equal(new Set(rs.map((r) => r.id)).size, 5, 'the request ids are not unique');
  assert.ok(rs.filter((r) => r.transition === true).length >= 2, 'fewer than two requests mix in a move between states');
  assert.ok(rs.filter((r) => r.architecture === true).length >= 2, 'fewer than two requests also speak of the architecture description itself');
  for (const r of rs) {
    assert.deepEqual(Object.keys(r).sort(), ['architecture', 'id', 'request', 'topic', 'transition'], `${r.id}: a request carries more than id, topic, transition and request`);
    assert.ok(typeof r.request === 'string' && r.request.length > 80, `${r.id}: the request text is missing or too short`);
  }
  // Frozen before the run: both arms recorded the hash of these exact requests.
  for (const name of ['skill', 'baseline']) {
    const { prompt } = arm(name);
    for (const r of rs) assert.ok(prompt.includes(r.request), `${name}: the prompt lacks ${r.id}`);
    assert.ok(!prompt.includes('"transition"') && !prompt.includes('"architecture"'), `${name}: the prompt shows a declared property`);
  }
}
