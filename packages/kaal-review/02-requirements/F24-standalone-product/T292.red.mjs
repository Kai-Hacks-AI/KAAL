// Case review/T292 tests: review/F24 (RED until review/C2 DO adds test/standalone.mjs)
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
export const id = 'review/T292';
export const tests = ['review/F24', 'review/G3'];
export const title = 'the delivered kaal-review package, packed and extracted in isolation, needs only its permitted shared dependencies and still works';
const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));
const PERMITTED = new Set(['kaal-hosting', '@kaihacksai/kaal-hosting', 'kaal-foundation', 'kaal-review']);
const KAAL = /(?:@kaihacksai\/)?kaal-[a-z][a-z-]*/g;
export async function run() {
  const { inspectDelivered } = await import('../../test/standalone.mjs');
  const d = await inspectDelivered(PACKAGE);
  assert.ok(d.extractedOutsideWorkspace, 'the package was not extracted outside the workspace into an empty directory');
  for (const f of ['package.json', 'README.md', 'skills/kaal-review/SKILL.md', 'payload/Review.md']) assert.ok(d.files.includes(f), `the delivered package lacks ${f}`);
  for (const f of d.files) assert.ok(!/(^|\/)(test|00-changes|01-intent|02-requirements|03-architecture|plan)\//.test(f), `Engineering-time content is delivered: ${f}`);
  const runtime = Object.keys({ ...d.dependencies, ...d.peerDependencies, ...d.optionalDependencies });
  assert.deepEqual(runtime.filter((n) => !PERMITTED.has(n)), [], 'the delivered package requires a package that is not permitted');
  for (const [file, names] of Object.entries(d.kaalReferences)) assert.deepEqual([...new Set(names)].filter((n) => !PERMITTED.has(n)), [], `${file} references a KAAL package that is not permitted`);
  assert.ok(d.skill.rules.length >= 5, 'the extracted Skill does not state its rules without the Engine');
  assert.equal(d.nodes.length, 4, 'the extracted package does not deliver its four Nodes');
  assert.equal(String(d.skill.text.match(KAAL)?.filter((n) => !PERMITTED.has(n)).length ?? 0), '0');
}
