// release/C58 approve Sync (release/CTL8, preventive): decides whether to give a SYNC the approval it needs. It approves only a
// verdict that passes, of the current head, whose base is not main, with no approval of this head yet, and only when the mode is
// exactly `on`. Anything else is a dry run or a skip. It never merges and never edits.
export function decideApprove({ verdict, currentHead, mode, approvedAtHead }) {
  const skip = (because) => ({ action: 'skip', because });
  if (!verdict || typeof verdict !== 'object') return skip('there is no verdict');
  if (verdict.outcome !== 'PASS' || verdict.passes !== true) return skip(`verify Sync is ${verdict.outcome}`);
  if (!currentHead || verdict.analyzed?.head !== currentHead) return skip('the verdict is of another head than the current one');
  const base = verdict.analyzed?.base?.ref;
  if (!base || base === 'main') return skip('the base is main or unknown');
  if (approvedAtHead) return skip('this head already has an approval');
  return mode === 'on'
    ? { action: 'approve', because: 'verify Sync passes at the current head' }
    : { action: 'would-approve', because: 'dry run: verify Sync passes at the current head' };
}

// release/C65: what the workflow calls. `verdict` is what verify Sync said, in a job that holds no token; it is data, so it is read
// strictly: a verdict whose head or base tip is not a full commit name is refused. `live` is what GitHub says now, read through the
// API: the head of the pull request and the tip of its base. The approval is decided only when both pass and still name the head
// and the base tip the verdict judged. Everything else the verdict depends on (the head's parents and tree, main's history) is fixed
// by those two commits, so no Git object of the candidate is read here.
const FULL = /^[0-9a-f]{40}$/;
export function readVerdict(verdict) {
  const a = verdict?.analyzed;
  if (!verdict || typeof verdict !== 'object' || verdict.control !== 'verify Sync') return null;
  if (!a || typeof a !== 'object' || !FULL.test(a.head ?? '') || !FULL.test(a.base?.tip ?? '') || typeof a.base?.ref !== 'string') return null;
  return { outcome: verdict.outcome, passes: verdict.passes, analyzed: { head: a.head, base: { ref: a.base.ref, tip: a.base.tip } } };
}

export function decideApproveNow({ verdict, live, ...rest }) {
  const skip = (because) => ({ action: 'skip', because });
  if (!verdict || typeof verdict !== 'object') return skip('there is no earlier verdict');
  const v = readVerdict(verdict);
  if (!v) return skip('the verdict is not one verify Sync wrote');
  if (!live || !FULL.test(live.head ?? '') || !FULL.test(live.baseTip ?? '')) return skip('the head and the base tip could not be read now');
  if (live.head !== v.analyzed.head) return skip('the head moved since verification');
  if (live.baseTip !== v.analyzed.base.tip) return skip('the base moved since verification');
  return decideApprove({ ...rest, verdict: v });
}

// release/C60: the refusal of the approving call that names a setting. Any other text is `other`.
export function classifyRefusal(message) {
  return typeof message === 'string' && /github actions (is|are) not permitted to approve pull requests/i.test(message) ? 'actions-not-permitted' : 'other';
}
