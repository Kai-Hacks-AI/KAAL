// Case release/T1153 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1153';
export const tests = ['release/F70'];
export const title = "the decision is a draft-ready PROMOTION taken from the event alone, with the two chapters of the template";
export async function run() {
  const { decideFinal } = await load('final-step.mjs');
  assert.notEqual(decideFinal.constructor.name, 'AsyncFunction', 'it makes no call');
  const sha = 'c'.repeat(40);
  const x = decideFinal(ev({ base: 'hotfix/the-fix', body: HOTFIX, mergeSha: sha }));
  assert.equal(x.head, 'hotfix/the-fix');
  assert.equal(x.base, 'main');
  assert.equal(x.revision, sha);
  assert.equal(x.title, 'PROMOTION: release/C98 the fix');
  assert.deepEqual([...x.body.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ['Change', 'Why now']);
  assert.ok(x.body.startsWith('## Change\n\nrelease/C98 the fix: HOTFIX\n'));
  assert.equal(decideFinal(ev({ base: 'hotfix/the-fix', body: '## Change\n\n## Defect\n\nx\n' })).reason, 'no-change-line');
}
