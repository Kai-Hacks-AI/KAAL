// Case review/T292 tests: review/F24 (RED until review/C2 DO adds test/standalone.mjs)
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
export const id = 'review/T292';
export const tests = ['review/F24', 'review/G3'];
export const title = 'a consumer holding only the packed kaal-review product and its permitted dependencies can load its Skill, register its Nodes and resolve everything it needs';
const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));
const PERMITTED = ['@kaihacksai/kaal-hosting', 'kaal-foundation'];
export async function run() {
  const { consume } = await import('../../test/standalone.mjs');
  const r = await consume(PACKAGE, { permitted: PERMITTED });
  assert.equal(r.outsideWorkspace, true, 'the product was not extracted and used outside the workspace');
  assert.deepEqual(r.otherKaalPackagesPresent, [], 'the consumer environment held a KAAL package that is not permitted');
  assert.ok(r.skills.length > 0, 'the extracted product declares no Skill to load');
  for (const s of r.skills) assert.equal(s.loads, true, `${s.name}: the Skill does not load as an Agent Skill: ${s.problem}`);
  assert.ok(r.nodes.declared.length > 0, 'the extracted product declares no Node to register');
  assert.deepEqual([...r.nodes.listed].sort(), [...r.nodes.declared].sort(), 'the Engine does not list exactly the Nodes the product declares');
  assert.deepEqual(r.closure.unresolved, [], 'something the product needs at run time does not resolve in the consumer environment');
  assert.deepEqual(r.closure.notPermitted, [], 'the product needs a KAAL package that is not permitted');
}
