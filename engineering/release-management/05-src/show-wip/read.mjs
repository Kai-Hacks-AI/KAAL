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

// The newest closed or merged piece of a branch from the host's list of the pieces whose head is the branch (REST pull requests, any state):
// false when it lists none that closed, absent (not observed) when the list is missing or cut at one page. A merged piece is delivered; a piece closed unmerged is only closed: a transport's outcome, not a decision to discard the work, so it never settles the branch as discarded.
const PAGE = 100;
export function settledOf(pulls) {
  if (!Array.isArray(pulls) || pulls.length >= PAGE) return undefined;
  const done = pulls.filter((p) => p.state === 'closed');
  if (!done.length) return false;
  const when = (p) => p.merged_at ?? p.closed_at ?? '';
  const newest = done.reduce((a, b) => (when(b) >= when(a) ? b : a));
  return { outcome: newest.merged_at ? 'delivered' : 'closed', head: newest.head?.sha };
}

// The facts of each branch the host answers: its tip (from the branch list), the commits it holds beyond the default branch (the comparison runs
// default...branch, so `ahead_by` counts the commits of the branch that the default branch lacks) and its settled piece. What one call could not
// read stays absent for that branch and is a gap; nothing is filled in. Returns the `page` readBranches takes.
const refPath = (name) => name.replace(/[%#?]/g, (c) => encodeURIComponent(c));
export function branchPager(defaultBranch, gh) {
  return async ([, repoName, after]) => {
    const [owner] = repoName.split('/');
    const n = after === 'after=' ? 1 : Number(after.slice('after='.length));
    const list = await gh([`repos/${repoName}/branches?per_page=${PAGE}&page=${n}`]);
    const gaps = [];
    const nodes = [];
    for (const { name, commit } of list) {
      const node = { name, ...(commit?.sha !== undefined && { head: commit.sha }) };
      if (name !== defaultBranch) {
        try {
          const compared = await gh([`repos/${repoName}/compare/${refPath(defaultBranch)}...${refPath(name)}`]);
          if (Number.isInteger(compared.ahead_by)) node.ahead = compared.ahead_by;
        } catch (error) { gaps.push(`${name}: commits beyond ${defaultBranch} could not be read (${error.message})`); }
        try {
          const pulls = await gh([`repos/${repoName}/pulls?head=${encodeURIComponent(`${owner}:${name}`)}&state=all&per_page=${PAGE}`]);
          const own = Array.isArray(pulls) ? pulls.filter((p) => p.head?.ref === name && p.head?.repo?.full_name === repoName) : pulls;
          const settled = settledOf(Array.isArray(pulls) && pulls.length >= PAGE ? pulls : own);
          if (settled !== undefined) node.settled = settled;
        } catch (error) { gaps.push(`${name}: its closed pieces could not be read (${error.message})`); }
      }
      nodes.push(node);
    }
    return { nodes, next: list.length >= PAGE ? String(n + 1) : null, gaps };
  };
}

// The branches of a repository. `page(args)` returns one page as { nodes: [{ name, head?, ahead?, settled? }], next, gaps? } (next is null on the last page); run.mjs builds it from the host's answer.
// head, ahead and settled are passed through as the host answered and stay absent when it did not (release/C61).
export async function readBranches(repoName, page) {
  const branches = [], gaps = [];
  let after = '';
  for (let n = 1; ; n++) {
    const { nodes, next, gaps: pageGaps = [] } = await page(['branches', repoName, `after=${after}`]);
    gaps.push(...pageGaps);
    branches.push(...nodes.map(({ name, head, ahead, settled }) => ({ name, ...(head !== undefined && { head }), ...(ahead !== undefined && { ahead }), ...(settled !== undefined && { settled }) })));
    if (!next) break;
    if (n >= MAX_PAGES) { gaps.push(`more branches than were read (${branches.length}): the rest are not read`); break; }
    after = next;
  }
  return { branches, gaps };
}

// A release tag is `<package>@<version>`; the version is after the last `@`, so a scoped name stays whole. Anything else is no package tag.
export function parseTag(tag) {
  const at = String(tag).lastIndexOf('@');
  const name = String(tag).slice(0, at), version = String(tag).slice(at + 1);
  return at > 0 && /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version) ? { name, version } : null;
}

// The facts of each package: what npmjs publishes (`npm(name)` returns null for never published, else { versions, distTags }), its tags,
// and whether the package itself changed on main after the tag of its newest published version (`changedSince(name, tagVersion)`).
// A private package is read like any other. What could not be read is a gap and is left out of the package, never filled in.
export async function readPackages({ packages, tags, npm, changedSince }) {
  const gaps = [], parsed = tags === undefined ? undefined : tags.map(parseTag).filter(Boolean);
  if (parsed === undefined) gaps.push('tags: could not be read');
  const out = [];
  for (const pkg of packages) {
    const facts = { name: pkg.name, version: pkg.version, private: Boolean(pkg.private) };
    if (parsed !== undefined) facts.tags = parsed.filter((t) => t.name === pkg.name).map((t) => t.version);
    try {
      const published = await npm(pkg.name);
      facts.published = published === null ? null : { versions: published.versions ?? [], distTags: published.distTags ?? {} };
    } catch (error) { gaps.push(`npmjs: ${pkg.name} could not be read (${error.message})`); }
    const newest = facts.published?.versions?.slice().sort(compareVersions).at(-1);
    if (newest !== undefined && facts.tags?.includes(newest)) {
      try { const changed = await changedSince(pkg.name, newest); if (changed !== undefined) facts.changedSinceTag = Boolean(changed); }
      catch (error) { gaps.push(`${pkg.name}: change since tag ${newest} could not be read (${error.message})`); }
    }
    out.push(facts);
  }
  return { packages: out, gaps };
}

function compareVersions(a, b) {
  const [x, y] = [a, b].map((v) => /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(v) ?? []);
  for (let i = 1; i <= 3; i++) if (Number(x[i]) !== Number(y[i])) return Number(x[i]) - Number(y[i]);
  return x[4] === y[4] ? 0 : x[4] === undefined ? 1 : y[4] === undefined ? -1 : x[4] < y[4] ? -1 : 1;
}

// Every release tag, page by page. A list that could not be read to its end is not "all tags": it is not returned, and a gap says so.
// `gh(args)` returns the parsed answer of one read call; the args carry `page=<n>` and `per_page=<n>`.
export async function readTags(repoName, gh, perPage = 100) {
  const tags = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const refs = await gh([`repos/${repoName}/git/matching-refs/tags`, '-F', `per_page=${perPage}`, '-F', `page=${page}`]);
    tags.push(...refs.map((r) => r.ref.replace('refs/tags/', '')));
    if (refs.length < perPage) return { tags, gaps: [] };
  }
  return { tags: undefined, gaps: [`tags: more than ${MAX_PAGES * perPage} were listed, the rest are not read`] };
}

// Whether a package itself changed in a comparison of its tag with main. The host cuts the list of files; a cut list can show a change but never its absence.
export const COMPARE_FILE_LIMIT = 300;
export function packageChanged(compared, dir) {
  const files = compared?.files;
  if (!Array.isArray(files)) return undefined;
  if (files.some((f) => String(f.filename).startsWith(`packages/${dir}/`))) return true;
  return files.length >= COMPARE_FILE_LIMIT ? undefined : false;
}
