// Case A8/T1 tests: A8
import assert from 'node:assert/strict';
import test from 'node:test';
import { cycleMembers, index, kindOf } from '../../../../../../05-src/plan/resolve.mjs';
export const id = 'A8/T1';
export const tests = ['A8'];
export const title = 'the resolver indexes every artefact and gap with its kind and detects parent cycles';
test(`${id} ${title}`, async () => {
  const byId = index({
    intents: [{ id: 'I1' }],
    requirements: [{ id: 'F1', kind: 'F', serves: ['I1'] }],
    architecture: [{ id: 'A1', parent: 'A2' }, { id: 'A2', parent: 'A1' }, { id: 'A3', parent: 'A1' }],
    defects: [{ id: 'D1' }],
    changes: [{ id: 'C1', gaps: ['C1/G1'] }],
  });
  const kinds = { I1: 'intent', F1: 'requirement', A1: 'architecture', D1: 'defect', C1: 'change', 'C1/G1': 'gap' };
  for (const [id, kind] of Object.entries(kinds)) assert.equal(kindOf(byId, id), kind, id);
  assert.equal(kindOf(byId, 'X99'), undefined);
  assert.deepEqual([...cycleMembers(byId)].sort(), ['A1', 'A2']);
});
