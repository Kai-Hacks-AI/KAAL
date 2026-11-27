// verify Branching: auto-merge method (release/CTL39, release/C158): auto-merge is enabled with the method the flow of the pull request names (squash into the default branch, merge into a lineage).
//   node judge-auto-merge.mjs --head <sha> --base-ref <name>      (KAAL_DEFAULT, KAAL_AUTO_MERGE: the method it is enabled with, empty when off, KAAL_RULES: the trusted rules of the base)
// The rule is `autoMerge` of engineering/github/lineage.ts, run through the controls adapter in detective mode: it reports and gates nothing.
// The verdict is PASS, REPORT (disabled, another method, or no method is right), or UNKNOWN (the rules or a fact cannot be read; never a pass). With auto-merge off the old workflow judged nothing until it is enabled, and so does this one.
import { fileURLToPath } from 'node:url';
import { autoMerge, effectiveMethod, readExpected } from '../../../github/lineage.ts';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { checking, cli, readJson, rev, report } from './lib/answer.mjs';

const ID = 'release/CTL39';

export async function check(facts, { mode = 'detective', boundary } = {}) {
  const seen = {};
  return report(await runControl({ id: ID, mode, check: checking(autoMerge, seen), input: facts, boundary }), seen);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await cli({
    label: 'Branching: auto-merge', check,
    applies: (c) => c.enabled ? true : 'auto-merge is off, nothing to judge until it is enabled',
    read: (c) => {
      const head = rev(c.cwd, c.head);
      return {
        baseRef: c.baseRef, head,
        enabled: effectiveMethod(c.enabled, c.rules === undefined ? undefined : readJson(c.rules), c.baseRef, c.defaultBranch),
        expected: readExpected(c.cwd, c.defaultBranch, c.baseRef, rev(c.cwd, `refs/remotes/origin/${c.defaultBranch}`), rev(c.cwd, `refs/remotes/origin/${c.baseRef}`), head),
      };
    },
  }));
}
