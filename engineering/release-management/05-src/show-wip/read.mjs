// Reads every open piece of work from the host and maps it to the facts Show WIP reads. Read-only: it only asks the host's API.
// `gh(args)` takes the arguments of one API call and returns its parsed answer; the command supplies it (see run.mjs).
// A list the host cut at one page is complete only for what it shows: nothing is read as zero or none from a cut list.
const QUERY = 'query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){pullRequests(states:OPEN,first:20,after:$after){pageInfo{hasNextPage endCursor} nodes{number title isDraft headRefName headRefOid baseRefName mergeStateStatus autoMergeRequest{enabledAt} reviewThreads(first:100){pageInfo{hasNextPage} nodes{isResolved}} latestReviews(first:20){pageInfo{hasNextPage} nodes{state submittedAt author{login} commit{oid}}} commits(last:1){nodes{commit{oid statusCheckRollup{state contexts(first:100){pageInfo{hasNextPage} nodes{__typename ... on CheckRun{name conclusion status startedAt} ... on StatusContext{context state}}}}}}}}}}}';
const MAX_PAGES = 20;
const BAD = new Set(['FAILURE', 'ERROR', 'TIMED_OUT', 'CANCELLED', 'ACTION_REQUIRED', 'STARTUP_FAILURE']);
const OK = new Set(['SUCCESS', 'NEUTRAL', 'SKIPPED']);

// CI is read per check, the newest run of each name: an older failure that a later run of the same check superseded is not red.
// With no contexts, or a cut list of them, the host's own roll-up state is used. No roll-up at all means there are no checks.
function checksOf(rollup) {
  if (!rollup) return 'none';
  const nodes = rollup.contexts?.nodes;
  const fallback = () => (OK.has(rollup.state) ? 'success' : BAD.has(rollup.state) ? 'failure' : 'pending');
  if (!nodes?.length || rollup.contexts.pageInfo?.hasNextPage) return fallback();
  const newest = new Map();
  for (const c of nodes) {
    const key = c.name ?? c.context;
    const seen = newest.get(key);
    if (!seen || (c.startedAt ?? '') >= (seen.startedAt ?? '')) newest.set(key, c);
  }
  const verdicts = [...newest.values()].map((c) => (c.name ? (c.status && c.status !== 'COMPLETED' ? 'PENDING' : c.conclusion ?? 'PENDING') : c.state));
  if (verdicts.some((v) => BAD.has(v))) return 'failure';
  return verdicts.every((v) => OK.has(v)) ? 'success' : 'pending';
}

// Changes requested count at any version; an approval counts only for the current one; no approval on a cut list is not observed.
function reviewOf(reviews, head) {
  if (!reviews) return undefined;
  // Only a reviewer's newest verdict counts: an old request for changes does not outlive that reviewer's later approval.
  const newest = new Map();
  reviews.nodes.forEach((r, i) => {
    const key = r.author?.login ?? `#${i}`;
    const held = newest.get(key);
    if (!held || (r.submittedAt ?? '') >= (held.submittedAt ?? '')) newest.set(key, r);
  });
  const verdicts = [...newest.values()];
  if (verdicts.some((r) => r.state === 'CHANGES_REQUESTED')) return 'changes';
  if (verdicts.some((r) => r.state === 'APPROVED' && r.commit?.oid === head)) return 'approved';
  return reviews.pageInfo?.hasNextPage ? undefined : 'none';
}

function threadsOf(threads) {
  if (!threads) return undefined;
  const open = threads.nodes.filter((t) => !t.isResolved).length;
  return open === 0 && threads.pageInfo?.hasNextPage ? undefined : open;
}

const fitOf = (state) => (state === 'DIRTY' ? 'conflicts' : state === 'BEHIND' ? 'behind' : state === undefined || state === 'UNKNOWN' ? undefined : 'fits');

export function toFacts(node) {
  const rollup = node.commits?.nodes?.at(-1)?.commit?.statusCheckRollup;
  const facts = {
    ref: `#${node.number}`, title: node.title, from: node.headRefName, into: node.baseRefName, head: node.headRefOid, draft: Boolean(node.isDraft),
    review: reviewOf(node.latestReviews, node.headRefOid), threads: threadsOf(node.reviewThreads), checks: node.commits ? checksOf(rollup) : undefined,
    fit: fitOf(node.mergeStateStatus), landing: Boolean(node.autoMergeRequest),
  };
  return Object.fromEntries(Object.entries(facts).filter(([, v]) => v !== undefined));
}

export async function readOpenPulls(repoName, gh) {
  const [owner, name] = repoName.split('/');
  const nodes = [], gaps = [];
  let after = null;
  for (let page = 1; ; page++) {
    const args = ['graphql', '-f', `query=${QUERY}`, '-F', `owner=${owner}`, '-F', `name=${name}`];
    if (after) args.push('-F', `after=${after}`);
    const connection = (await gh(args)).data.repository.pullRequests;
    nodes.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) break;
    if (!connection.pageInfo.endCursor || page >= MAX_PAGES) {
      gaps.push(`more pieces than were read (${nodes.length}): the rest are not read`);
      break;
    }
    after = connection.pageInfo.endCursor;
  }
  return { pieces: nodes.map(toFacts), gaps };
}
