// The package judges its own controls: the four facts of each control of the package are derived from the package's own files and handed to the check of records (CTL3).
// Pure: it reads no file and runs no command; the caller hands the files over.
import { findControls } from './find-controls.mjs';
import { assessRecord } from '../verify-record.mjs';

const LADDER = ['designed', 'implemented', 'running', 'tested'];
const OWN = '14-operations/controls/CTL';

export function judgeSelf({ files, revision } = {}) {
  if (typeof revision !== 'string' || revision === '') throw new Error('judgeSelf: the revision must be a non-empty string');
  if (!Array.isArray(files)) throw new Error('judgeSelf: files must be a list of { path, text }');
  const own = findControls(files).controls.filter((c) => c.path.startsWith(OWN));
  if (own.length === 0) throw new Error('judgeSelf: no controls of the package were found in the files');
  const present = new Set(files.map((f) => f.path));
  const controls = [];
  const facts = {};
  for (const c of own) {
    const rank = LADDER.indexOf(c.status);
    const name = /\/CTL\d+-([a-z-]+)\//.exec(c.path)?.[1];
    if (!c.valid || rank < 0 || !name) throw new Error(`judgeSelf: ${c.id} cannot be judged (${!c.valid ? 'not a valid declaration' : rank < 0 ? 'status outside the ladder' : 'not in a folder CTL<n>-<name>'})`);
    controls.push({ id: c.id, claimed: { defined: true, implemented: rank >= 1, running: rank >= 2, tested: rank >= 3 } });
    // `running` is false: no station registers a control of the package and no run of the adapter is observed. `tested` needs a Case that names the control itself.
    facts[c.id] = { revision, defined: true, implemented: present.has(`skills/kaal-controls/scripts/${name}.mjs`), running: false, tested: c.tests.length > 0 };
  }
  const { findings, unknown } = assessRecord({ controls, facts, revision });
  return { findings, unknown };
}
