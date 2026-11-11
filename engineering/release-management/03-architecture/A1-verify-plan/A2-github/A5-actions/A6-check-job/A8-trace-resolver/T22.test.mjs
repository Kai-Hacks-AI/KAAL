// Case release/T22 tests: release/A8
import assert from 'node:assert/strict';
import test from 'node:test';
import { cycleMembers, index, kindOf } from '../../../../../../05-src/plan/resolve.mjs';
export const id = 'release/T22';
export const tests = ['release/A8'];
export const title = 'the resolver indexes every artefact and gap with its kind and detects parent cycles';
test(`${id} ${title}`, async () => {
  const byId = index({
    intents: [{ id: 'release/I1' }],
    requirements: [{ id: 'release/F1', kind: 'F', serves: ['release/I1'] }],
    architecture: [{ id: 'release/A1', parent: 'release/A2' }, { id: 'release/A2', parent: 'release/A1' }, { id: 'release/A3', parent: 'release/A1' }],
    defects: [{ id: 'release/D1' }],
    changes: [{ id: 'release/C1', closes: ['release/G1'] }],
  gaps: [{ id: 'release/G1' }],
  });
  const kinds = { 'release/I1': 'intent', 'release/F1': 'requirement', 'release/A1': 'architecture', 'release/D1': 'defect', 'release/C1': 'change', 'release/G1': 'gap' };
  for (const [id, kind] of Object.entries(kinds)) assert.equal(kindOf(byId, id), kind, id);
  assert.equal(kindOf(byId, 'X99'), undefined);
  assert.deepEqual([...cycleMembers(byId)].sort(), ['release/A1', 'release/A2']);
});
