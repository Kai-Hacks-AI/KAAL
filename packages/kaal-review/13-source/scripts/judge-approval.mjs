// review/C8: the judgement of the Approver, over data. It answers `approve` or `abstain`, never a third, and fails closed. It reads nothing, fetches nothing,
// posts nothing and never throws: Hosting reads the facts with the Approver's own grant and acts on the answer, and the workflow that runs this is not in
// this file. What decides is produced by Hosting and recognised by its registry, or is fixed here in the code of main, and is never chosen by the caller.
import { factOrigin as hostingFactOrigin } from '@kaihacksai/kaal-hosting';

const f = (kind) => ({ kind, detail: '' });
const HEX = /^[0-9a-f]{40}$/;
const APPROVER = 'approver';
const INSPECTOR = 'inspector';
const CHECK = 'verify Sync';
/** The triggers under which the Approver's workflow may run. A constant of the code of main, changed only by a reviewed change; never read from facts, evidence or a parameter. */
const TRUSTED_TRIGGERS = ['workflow_run'];
const abstain = (...kinds) => ({ decision: 'abstain', findings: kinds.map(f) });
const record = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

/**
 * Builds the judgement over a lookup of the origin of a fact. The delivered `judgeApproval` is built with Hosting's own lookup; a Case builds it with a registry of its own.
 * A judgement without a lookup is refused when it is built, never believed.
 */
export function makeJudgeApproval({ factOrigin } = {}) {
  if (typeof factOrigin !== 'function') throw new TypeError('a lookup of the origin of a fact is required');
  return function judgeApproval(evidence, facts) {
    try {
      if (!record(facts) || !record(facts.head) || !HEX.test(facts.head.sha ?? '') || !Array.isArray(facts.head.parents) || !record(facts.base) || !HEX.test(facts.base.sha ?? '')) return abstain('malformed-evidence');
      if (!record(evidence) || !record(evidence.pr)) return abstain('malformed-evidence');
      const out = [];
      const origin = factOrigin(facts);
      if (!origin) out.push('facts-unattributed');
      else if (origin.app !== APPROVER) out.push('facts-other-reader');
      if (evidence.pr.head !== facts.head.sha) out.push('head-moved');
      if (evidence.pr.base !== facts.base.sha) out.push('base-moved');

      // Ancestry shows the shape of a SYNC (the parents of the head are the tip of the base and main), not that the merge changed nothing else.
      const parents = facts.head.parents;
      if (!(parents.length === 2 && parents.includes(facts.base.sha) && parents.includes(facts.main))) out.push('not-sync-ancestry');

      // Content purity is shown only by the check signed by the Inspector at the exact head, over every run of it.
      const runs = Array.isArray(facts.checks) ? facts.checks.filter((r) => record(r) && r.name === CHECK) : [];
      if (!runs.length) out.push('check-missing');
      else {
        if (runs.some((r) => r.status !== 'completed' || r.conclusion !== 'success')) out.push('check-not-pass');
        if (runs.some((r) => r.revision !== facts.head.sha)) out.push('check-other-revision');
        if (runs.some((r) => r.signer !== INSPECTOR)) out.push('check-other-signer');
      }
      if (facts.author === APPROVER) out.push('own-pull-request');

      // Trusted execution is evidence: the code of main, on a trigger from the constant list, with the head not checked out.
      const run = evidence.execution;
      if (!record(run) || !HEX.test(facts.main ?? '') || typeof run.trigger !== 'string' || typeof run.codeRevision !== 'string' || typeof run.checkedOutHead !== 'boolean') out.push('execution-unproven');
      else {
        if (!TRUSTED_TRIGGERS.includes(run.trigger)) out.push('trigger-not-trusted');
        if (run.codeRevision !== facts.main) out.push('code-not-main');
        if (run.checkedOutHead !== false) out.push('head-checked-out');
      }
      return out.length ? abstain(...out) : { decision: 'approve', findings: [] };
    } catch {
      return abstain('malformed-evidence');
    }
  };
}

/** The judgement of the Approver, built with Hosting's own lookup of origin, which no caller of this function can replace. */
export const judgeApproval = makeJudgeApproval({ factOrigin: hostingFactOrigin });
