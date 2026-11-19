// Shared scaffolding of the C95 Cases. The files under test are the ones the DO adds or changes; until then the Case is RED.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { RM } from '../A65-raise-from-the-event/fixtures.mjs';
export { RM, WIRE, ev } from '../A65-raise-from-the-event/fixtures.mjs';
export const text = (rel) => { const p = join(RM, rel); if (!existsSync(p)) throw new Error(rel.split('/').pop() + ' is absent'); return readFileSync(p, 'utf8'); };
export async function loadSrc(rel) {
  const p = join(RM, '05-src', rel);
  if (!existsSync(p)) throw new Error(rel + ' is absent');
  return import(pathToFileURL(p).href);
}
// A WIRE pull request body with one target.
export const wire = (target) => '**Change envelope.** The evidence is in release/C73.\n\n## Source\n\n`engineering/x/y.yml` on main.\n\n## Target\n\n`' + target + '`, an exact copy.\n\n## Verification\n\ncmp.\n';
// The inputs of the install judge for a one-file copy.
export const install = (target) => ({
  changed: [{ path: target, text: 'same' }],
  pairs: [{ target, kind: 'copy', source: 'engineering/x/y.yml', text: 'same' }],
  onMain: () => true, baseText: () => undefined, hash: () => '',
});
