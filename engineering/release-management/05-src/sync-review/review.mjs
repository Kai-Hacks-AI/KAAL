// release/C58 review Sync (release/CTL9, corrective): decides what puts a SYNC in front of a person. A verdict that fails, is
// UNKNOWN, is missing or belongs to another head gets a label, a request for review and one comment per head. A passing verdict of
// the current head gets nothing, or the label removed. The only actions are label, unlabel, comment and request-review: it never
// approves, merges or edits a branch.
export const LABEL = 'sync: needs review';

export function decideReview({ verdict, currentHead, existing }) {
  const seen = existing ?? { labelled: false, commentedHead: null, reviewRequested: false };
  const passes = verdict && typeof verdict === 'object' && verdict.outcome === 'PASS' && verdict.passes === true && verdict.analyzed?.head === currentHead;
  if (passes) return seen.labelled ? [{ action: 'unlabel', label: LABEL }] : [];
  const lines = verdict?.reasons?.length
    ? verdict.reasons.map((r) => `- ${r.code}: ${r.detail}`)
    : [`- ${verdict?.outcome ?? 'no verdict'}: verify Sync did not pass at this head`];
  const actions = [];
  if (!seen.labelled) actions.push({ action: 'label', label: LABEL });
  if (seen.commentedHead !== currentHead) {
    actions.push({ action: 'comment', body: `<!-- review-sync:${currentHead} -->\nThis SYNC needs a person's review. verify Sync did not pass at \`${String(currentHead).slice(0, 7)}\`:\n${lines.join('\n')}` });
  }
  if (!seen.reviewRequested) actions.push({ action: 'request-review' });
  return actions;
}
