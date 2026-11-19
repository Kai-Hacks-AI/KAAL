// release/C58 verify Sync: judges whether a SYNC is a pure merge of main (release/CTL7, detective). It is a pure function over
// facts a caller reads from GitHub and git, and reads nothing itself. UNKNOWN never passes. It applies no judgment about content:
// a conflict resolution, a changed file and an extra commit each change the tree or the commits, so each one fails a condition.
//
// Input:  { base: { ref, tip }, head: { sha, parents, tree }, currentHead, merge: { clean, tree }, secondParentOnMain, advances, added, reason }
// Output: { control, outcome, passes, reasons: [{ code, detail }], analyzed }
const CONTROL = 'verify Sync';
const LANES = ['kaal/', 'hotfix/', 'wire/'];

const record = (outcome, reasons, analyzed) => ({ control: CONTROL, outcome, passes: outcome === 'PASS', reasons, analyzed });
const known = (f) => f && typeof f === 'object'
  && f.base && typeof f.base.ref === 'string' && f.base.tip
  && f.head && f.head.sha && Array.isArray(f.head.parents) && f.head.tree
  && f.currentHead
  && f.merge && typeof f.merge.clean === 'boolean'
  && typeof f.secondParentOnMain === 'boolean' && typeof f.advances === 'boolean'
  && Array.isArray(f.added);

export function verifySync(facts) {
  if (!known(facts)) return record('UNKNOWN', [{ code: 'unreadable', detail: 'a fact verify Sync needs is missing or unreadable' }], null);
  const reasons = [];
  const no = (code, detail) => reasons.push({ code, detail });
  const { base, head, merge } = facts;
  const [first, second] = head.parents;
  if (!LANES.some((lane) => base.ref.startsWith(lane))) no('not-integration-base', `${base.ref} is not kaal/*, hotfix/* or wire/*`);
  if (head.parents.length !== 2) no('not-a-merge-commit', `the head has ${head.parents.length} parent(s), not two`);
  else {
    if (first !== base.tip) no('first-parent-not-base-tip', 'the first parent is not the tip of the base');
    if (!facts.secondParentOnMain) no('second-parent-not-on-main', 'the second parent is not a state of main');
    if (!facts.advances) no('does-not-advance', 'the second parent is not newer than what the base already holds');
    if (!merge.clean) no('merge-conflicts', 'the merge of the two parents conflicts, so the head resolved something');
    else if (merge.tree !== head.tree) no('tree-differs-from-clean-merge', 'the tree of the head is not git\'s clean merge of its parents');
  }
  if (!(facts.added.length === 1 && facts.added[0] === head.sha)) no('extra-commits', `the pull request adds ${facts.added.length} commit(s) beyond main, not only the merge`);
  if (typeof facts.reason !== 'string' || facts.reason.trim() === '') no('no-reason', 'the Reason chapter is missing or empty');
  if (facts.currentHead !== head.sha) no('head-moved', 'the pull request head moved after the facts were read');
  const analyzed = { base, head: head.sha, parents: head.parents, mergeTree: merge.tree ?? null, added: facts.added };
  return reasons.length ? record('FAIL', reasons, analyzed) : record('PASS', [], analyzed);
}
