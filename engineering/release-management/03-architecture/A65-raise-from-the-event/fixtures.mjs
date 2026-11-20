// Shared scaffolding of the C93 Cases. The files under test are the ones the DO adds; until then they are absent and the Case is RED.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(repo, 'engineering/release-management');
export const draft = (name) => readFileSync(join(RM, '00-changes/C93-dispatcher-event-raise/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
export const text = (rel) => { const p = join(RM, rel); if (!existsSync(p)) throw new Error(rel.split('/').pop() + ' is absent'); return readFileSync(p, 'utf8'); };
export async function load(name) {
  const p = join(RM, '05-src/promotion-raise', name);
  if (!existsSync(p)) throw new Error(name + ' is absent');
  return import(pathToFileURL(p).href);
}
export const ACT = '## Change\n\nrelease/C99 some thing: it does a small thing\n\n## Records\n\nthe 4L retrospective\n';
export const HOTFIX = '**Change envelope.** x\n\n## Change\n\nrelease/C98 the fix\n\n## Defect\n\nrelease/D1\n\n## Urgency\n\nnow\n\n## Approach\n\nsmall\n';
export const PLAN = '## Change\n\nrelease/C99 some thing: x\n\n## From\n\na\n\n## To\n\nb\n\n## Because\n\nc\n';
export const DO = '## Change\n\nrelease/C99 some thing: x\n\n## Implement\n\na\n\n## Refactor\n\nb\n';
export const WIRE = '**Change envelope.** The evidence is in the repository files of release/C73.\n\n## Source\n\n`engineering/release-management/05-src/wiring/workflows/dispatcher.yml` on `main`.\n\n## Target\n\n`.github/workflows/dispatcher.yml`, an exact copy of its source.\n\n## Verification\n\n`cmp` reports no difference.\n';
export const SYNC = '## Change\n\nrelease/C99 some thing\n\n## Reason\n\nfresh\n';
export const ev = (over = {}) => ({ merged: true, base: 'kaal/release/some-thing', mergeSha: 'a'.repeat(40), body: ACT, ...over });
