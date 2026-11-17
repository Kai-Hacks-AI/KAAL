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

// What the workflow calls. `verdict` is what verify Sync said earlier; `fresh` is what it says now, from facts read again just
// before acting. The approval is decided only when both pass and agree on the head, the base's tip, the parents and the merge tree,
// so a head that did not move while the base or main did is not approved on an old verdict.
export function decideApproveNow({ verdict, fresh, ...rest }) {
  const skip = (because) => ({ action: 'skip', because });
  if (!verdict || typeof verdict !== 'object') return skip('there is no earlier verdict');
  if (!fresh || typeof fresh !== 'object') return skip('the facts were not read again');
  if (fresh.outcome !== 'PASS' || fresh.passes !== true) return skip(`verify Sync no longer passes: ${fresh.outcome}`);
  const was = verdict.analyzed;
  const now = fresh.analyzed;
  const same = was && now && was.head === now.head && was.base?.tip === now.base?.tip && was.mergeTree === now.mergeTree
    && JSON.stringify(was.parents) === JSON.stringify(now.parents);
  if (!same) return skip('the base or main moved since verification');
  return decideApprove({ ...rest, verdict: fresh });
}

// release/C60: the refusal of the approving call that names a setting. Any other text is `other`.
export function classifyRefusal(message) {
  return typeof message === 'string' && /github actions (is|are) not permitted to approve pull requests/i.test(message) ? 'actions-not-permitted' : 'other';
}
