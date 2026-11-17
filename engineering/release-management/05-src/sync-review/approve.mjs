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
