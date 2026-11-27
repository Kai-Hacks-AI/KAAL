// Case release/T1588 tests: release/C160. The delivery entry of the Change Isolation (check 1) replacement gives the verdicts of its acceptance expectations, and never passes an unreadable declaration. Behaviour, not structure.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const ENTRY = join(repo, 'engineering/release-management/05-src/change-isolation/judge-delivery.mjs');
export const id = 'release/T1588';
export const tests = ['release/C160'];
export const title = 'the delivery entry of the Change Isolation replacement reports mixed delivery and never passes an unreadable declaration';
export async function run() {
  assert.ok(existsSync(ENTRY), 'the entry judge-delivery.mjs is absent');
  const { check } = await import(pathToFileURL(ENTRY).href);
  assert.equal(typeof check, 'function', 'the entry exports no check');
  const mixed = await check({ paths: ['.github/workflows/a.yml', 'engineering/a.md'] });
  assert.notEqual(mixed.kind, 'pass', 'a delivery path next to a solution path is reported');
  const clean = await check({ paths: ['engineering/a.md'] });
  assert.equal(clean.kind, 'pass', 'a change with no delivery path reports nothing');
  const unreadable = await check({ paths: ['.github/workflows/a.yml'], declaration: '/nonexistent/declaration.json' });
  assert.notEqual(unreadable.kind, 'pass', 'an unreadable declaration is not a pass');
}
