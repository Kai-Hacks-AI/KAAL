// verify Change Isolation, `.github` alone (release/CTL42, release/C160): a change that touches `.github/` contains nothing outside it.
//   node judge-github-alone.mjs --head <sha> --base <sha> --base-ref <name>
// The rule is the one of engineering/change-isolation/check.mjs, run through the controls adapter in detective mode: it reports and gates nothing.
// The transition ledger is not carried into this control: no ledger input is supplied, so a ledger entry admits nothing here.
// The verdict is PASS, REPORT (a path outside `.github/` next to a `.github` path) or UNKNOWN (the changed paths cannot be read); UNKNOWN is never a pass.
import { fileURLToPath } from 'node:url';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { check as isolation } from '../../../change-isolation/check.mjs';
import { cli, report } from './lib/report.mjs';
import { DETECTIVE } from '../lib/entry-flag.mjs';

const ID = 'release/CTL42';

// Findings are the lines of the checker for the `.github` rule. A list of paths that is not a list of strings cannot be judged, and the adapter says UNKNOWN.
const githubAlone = ({ paths }) => {
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string')) throw new Error('the changed paths are not a list of paths');
  return isolation([...new Set(paths)]);
};

export async function check({ paths, mode = DETECTIVE, boundary } = {}) {
  return report(await runControl({ id: ID, mode, check: githubAlone, input: { paths }, boundary }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await cli({ check, id: ID, label: 'Change Isolation: .github alone' }));
