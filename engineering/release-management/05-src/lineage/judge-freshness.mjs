// verify Branching: promotion freshness (release/CTL37, release/C158): a promotion into the default branch contains its tip, and merging it yields exactly the tree validated on its head.
//   node judge-freshness.mjs --head <sha> --base-ref <name>      (KAAL_DEFAULT: the default branch, KAAL_HEAD_REF: the source branch)
// The rule is promotionFreshness of engineering/github/lineage.ts, run through the controls adapter in detective mode: it reports and gates nothing.
// The verdict is PASS, REPORT (not fresh) or UNKNOWN (a fact cannot be read); UNKNOWN is never a pass. It does not apply to a pull request whose base is not the default branch.
import { fileURLToPath } from 'node:url';
import { promotionFreshness, readFreshness } from '../../../github/lineage.ts';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { checking, cli, rev, report } from './lib/answer.mjs';

const ID = 'release/CTL37';

export async function check(facts, { mode = 'detective', boundary } = {}) {
  const seen = {};
  return report(await runControl({ id: ID, mode, check: checking(promotionFreshness, seen), input: facts, boundary }), seen);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await cli({
    label: 'Branching: freshness', check,
    applies: (c) => c.baseRef === c.defaultBranch ? true : `the base ${c.baseRef} is not the default branch`,
    read: (c) => readFreshness(c.cwd, c.defaultBranch, rev(c.cwd, `refs/remotes/origin/${c.defaultBranch}`), c.headRef, rev(c.cwd, c.head)),
  }));
}
