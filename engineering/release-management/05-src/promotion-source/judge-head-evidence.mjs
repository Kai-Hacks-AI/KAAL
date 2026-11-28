// verify Promotion Source: head evidence (release/CTL41, release/C159): a promotion head is admitted only when every check its rulesets require is green on that exact head commit.
//   node judge-head-evidence.mjs --base-ref <name>      (KAAL_REPO, KAAL_DEFAULT, KAAL_HEAD_REPO, KAAL_HEAD_REF, KAAL_HEAD_SHA, GH_TOKEN: the facts of the job)
// The rule is `promotionSource` of engineering/github/lineage.ts for a head its `promotionOrigin` admits, run through the controls adapter in detective mode: it reports and gates nothing.
// The verdict is PASS, REPORT (a required check is not green on the head: red, pending, absent or on another commit), UNKNOWN (the rules or the check runs cannot be read, or the facts hold none; never a pass and never a silent fail) or not applicable (not a promotion, or a head the origin entry refuses). The old script waited for a required check still running; so does this one.
import { fileURLToPath } from 'node:url';
import { promotionOrigin, promotionSource, readRequired, readRuns } from '../../../github/lineage.ts';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { checking, report } from '../lineage/lib/answer.mjs';
import { gh, run } from './lib/run.mjs';
import { DETECTIVE } from '../lib/entry-flag.mjs';

const ID = 'release/CTL41';

// A promotion head is judged on its checks. A pull request that is not one, or whose head the origin refuses, is not this verdict's to judge. Absent check evidence cannot be judged: it is not a pass and not a fail.
const headEvidence = (f) => {
  const origin = promotionOrigin(f);
  if (origin.kind !== 'pass') return { kind: 'not-applicable', message: origin.message };
  if (f.checks === undefined) throw new Error('the checks its rulesets require could not be established at its head');
  return promotionSource(f);
};

export async function check(facts, { mode = DETECTIVE, boundary } = {}) {
  const seen = {};
  return report(await runControl({ id: ID, mode, check: checking(headEvidence, seen), input: facts, boundary }), seen);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (f) => {
    if (promotionOrigin(f).kind !== 'pass') return f;
    if (!f.head) throw new Error('the job supplied no head commit to read the checks at');
    const rules = gh([`repos/${f.repo}/rules/branches/${f.headRef}`, '--jq', '.[]']);
    const runs = gh([`repos/${f.repo}/commits/${f.head}/check-runs`, '--jq', '.check_runs[] | {id, name, status, conclusion, appId: .app.id, headSha: .head_sha}']);
    return { ...f, checks: { required: readRequired(rules), runs: readRuns(runs) } };
  };
  process.exit(await run({ label: 'Promotion Source: head evidence', id: ID, check, read, again: (a) => a.kind === 'fail' && a.findings.some((x) => x.includes('(pending)')) }));
}
