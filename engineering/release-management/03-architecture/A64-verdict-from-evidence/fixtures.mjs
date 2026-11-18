// Shared scaffolding of the C92 Cases: the module under test is the draft of the PLAN until the DO adds it.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const RM = join(repo, 'engineering/release-management');
export const draft = (name) => readFileSync(join(RM, '00-changes/C92-dispatcher-verdict/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
// The Cases test the file the DO adds; until then it is absent and the Case is RED.
export const src = (name) => join(RM, '05-src/promotion-raise', name);
export async function loadDraft(name) {
  const file = src(name === 'gather-evidence.mjs' ? 'gather.mjs' : name);
  if (!existsSync(file)) throw new Error(`${name === 'gather-evidence.mjs' ? 'gather.mjs' : name} is absent`);
  const m = await import(pathToFileURL(file).href);
  if (name === 'gather-evidence.mjs' && !m.gatherEvidence) throw new Error('gatherEvidence is not exported by gather.mjs');
  return m;
}
const CH = 'engineering/release-management/00-changes/C99-small/';
export const green = [`${CH}C99.md`, `${CH}act.md`, 'engineering/release-management/02-requirements/F1-x/T1.test.mjs'];
export const facts = (over = {}) => ({ collector: 'kaal/release/small-thing', aheadOfMain: 3, behindMain: 0, tip: 'a'.repeat(40), tipDate: '2026-11-15T00:00:00Z', files: green, filesComplete: true, closedPromotions: [], open: [], ...over });
export const NOW = Date.parse('2026-11-18T00:00:00Z');
