// verify Branching: synchronization validity (release/CTL38, release/C158): what is proposed to a lineage is a valid synchronization with the default branch, or an ordinary Change that carries none of its history.
//   node judge-synchronization.mjs --head <sha> --base-ref <name>      (KAAL_DEFAULT: the default branch)
// The rule is `synchronization` of engineering/github/lineage.ts, run through the controls adapter in detective mode: it reports and gates nothing.
// The verdict is PASS, REPORT (anything else proposed to a lineage that carries the default branch's history), UNKNOWN (a fact cannot be read; never a pass) or not applicable (an ordinary Change). It does not apply to a pull request into the default branch.
import { fileURLToPath } from 'node:url';
import { readSync, synchronization } from '../../../github/lineage.ts';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { checking, cli, rev, report } from './lib/answer.mjs';
import { DETECTIVE } from '../lib/entry-flag.mjs';

const ID = 'release/CTL38';

export async function check(facts, { mode = DETECTIVE, boundary } = {}) {
  const seen = {};
  return report(await runControl({ id: ID, mode, check: checking(synchronization, seen), input: facts, boundary }), seen);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await cli({
    label: 'Branching: synchronization', id: ID, check,
    applies: (c) => c.baseRef !== c.defaultBranch ? true : `the base ${c.baseRef} is the default branch`,
    read: (c) => readSync(c.cwd, c.defaultBranch, c.baseRef, rev(c.cwd, `refs/remotes/origin/${c.defaultBranch}`), rev(c.cwd, `refs/remotes/origin/${c.baseRef}`), rev(c.cwd, c.head)),
  }));
}
