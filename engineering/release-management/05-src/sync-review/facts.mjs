// release/C58 facts of verify Sync: reads a SYNC's head, its base, main and its Reason through an injected `git` and returns the
// facts verifySync judges. It runs nothing of the candidate: it only reads Git objects. A fact it cannot read is left out, which
// verifySync reports as UNKNOWN, never as a pass.
//
// git(args) -> { status, stdout }
// refs: baseTipRef (the base branch's current tip), mainRef (main), headSha (the pull request head, fetched as Git data)

export function reasonOf(body) {
  if (typeof body !== 'string') return null;
  const text = body.replace(/\r\n/g, '\n');
  const m = /^## Reason[^\S\n]*\n([\s\S]*?)(?=\n## |\n---[^\S\n]*(?:\n|(?![\s\S]))|(?![\s\S]))/m.exec(text);
  if (!m) return null;
  return m[1].replace(/<!--[\s\S]*?-->/g, '').trim();
}

export function gatherFacts({ git, baseRef, baseTipRef, mainRef, headSha, currentHead, body }) {
  const out = (args) => { const r = git(args); return r.status === 0 ? r.stdout.trim() : null; };
  const facts = { base: { ref: baseRef }, currentHead, reason: reasonOf(body) };
  const tip = out(['rev-parse', '--verify', `${baseTipRef}^{commit}`]);
  if (tip) facts.base.tip = tip;
  const line = out(['rev-list', '--parents', '-n', '1', headSha]);
  const tree = out(['rev-parse', '--verify', `${headSha}^{tree}`]);
  if (line && tree) {
    const [sha, ...parents] = line.split(/\s+/);
    facts.head = { sha, parents, tree };
  }
  if (!facts.head || !tip) return facts;
  const [first, second] = facts.head.parents;
  if (facts.head.parents.length === 2) {
    const merged = git(['merge-tree', '--write-tree', first, second]);
    if (merged.status === 0) facts.merge = { clean: true, tree: merged.stdout.split('\n')[0].trim() };
    else if (merged.status === 1) facts.merge = { clean: false, tree: null };
    const firstParentsOfMain = out(['rev-list', '--first-parent', mainRef]);
    if (firstParentsOfMain !== null) facts.secondParentOnMain = firstParentsOfMain.split('\n').includes(second);
    const incorporated = git(['merge-base', '--is-ancestor', second, tip]);
    if (incorporated.status === 0 || incorporated.status === 1) facts.advances = incorporated.status === 1;
  } else {
    // not a merge commit: the conditions that need two parents are false by construction, so give them known values
    facts.merge = { clean: false, tree: null };
    facts.secondParentOnMain = false;
    facts.advances = false;
  }
  const added = out(['rev-list', headSha, `^${tip}`, `^${mainRef}`]);
  if (added !== null) facts.added = added === '' ? [] : added.split('\n');
  return facts;
}
