// Case release/T1157 tests: release/F70
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RM, draft, load, text, ACT, HOTFIX, PLAN, DO, WIRE, SYNC, ev } from '../../03-architecture/A65-raise-from-the-event/fixtures.mjs';
export const id = 'release/T1157';
export const tests = ['release/F70'];
export const title = "a WIRE copy is recognised positively: an unknown, empty or malformed pull request into a wire branch is refused";
export async function run() {
  const { decideFinal } = await load('final-step.mjs');
  const base = 'wire/the-copy';
  const w = (target, over = {}) => '**Change envelope.** The evidence is in release/C73.\n\n## Source\n\n`engineering/x/y.yml` on main.\n\n## Target\n\n`' + target + '`, an exact copy.\n\n## Verification\n\ncmp.\n';
  const ok = decideFinal(ev({ base, body: w('.github/workflows/dispatcher.yml') }));
  assert.equal(ok.action, 'raise');
  assert.equal(ok.title, 'PROMOTION: WIRE .github/workflows/dispatcher.yml');
  assert.ok(ok.body.startsWith('## Change\n\nrelease/C73: WIRE .github/workflows/dispatcher.yml\n'));
  assert.equal(decideFinal(ev({ base, body: w('.githooks/pre-push') })).action, 'raise');
  const bad = [
    ['empty body', ''], ['no body', undefined], ['free text', 'please merge'],
    ['a Change only', '## Change\n\nrelease/C73 x\n'],
    ['no Verification', '## Source\n\n`a`\n\n## Target\n\n`.github/x.yml`\n'],
    ['no Source', '## Target\n\n`.github/x.yml`\n\n## Verification\n\nx\n'],
    ['target outside', w('engineering/x.yml')], ['target traversal', w('.github/../engineering/x.yml')],
    ['target root only', w('.github')], ['target with a space', w('.github/a b.yml')], ['absolute target', w('/.github/x.yml')],
    ['no Change id', w('.github/x.yml').replace('release/C73', 'nothing')],
  ];
  for (const [name, body] of bad) {
    const x = decideFinal(ev({ base, body }));
    assert.equal(x.action, 'skip', name + ' is refused');
    assert.ok(x.reason, name + ' says why');
  }
}
