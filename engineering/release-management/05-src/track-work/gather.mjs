// Gathers the facts track Work classifies (release-management/F23). Read-only: GraphQL read page by page and a few REST reads through `gh`.
// `gh` is injected (args -> parsed JSON) so the Cases run it without a network, and the model says what is the default branch and the integration prefix.
// What cannot be read is returned as a gap, never dropped.
import { fromGraphql } from "./track-work.mjs";

// Two light queries, each followed page by page: one heavy call for every pull request and branch at once is cut by GitHub's gateway (502, 504).
const PRS = `query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){
  pullRequests(states:OPEN,first:20,after:$after){pageInfo{hasNextPage endCursor} nodes{number title headRefName headRefOid baseRefName mergeStateStatus autoMergeRequest{enabledAt}
    files(first:100){pageInfo{hasNextPage} nodes{path}}
    reviewThreads(first:100){pageInfo{hasNextPage} nodes{isResolved}}
    latestReviews(first:20){pageInfo{hasNextPage} nodes{state commit{oid}}}
    commits(last:1){nodes{commit{oid statusCheckRollup{state contexts(first:100){pageInfo{hasNextPage} nodes{__typename ... on CheckRun{name conclusion status startedAt} ... on StatusContext{context state}}}}}}}}}}}`;
const REFS = `query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){
  refs(refPrefix:"refs/heads/",first:100,after:$after){pageInfo{hasNextPage endCursor} nodes{name target{oid} associatedPullRequests(first:1){totalCount}}}}}`;
const MAX_PAGES = 20;

// Reads every page of one connection; a page limit or a missing cursor is returned as a gap, never dropped silently.
async function pages(gh, query, repo, field, what, gaps) {
  const [owner, name] = repo.split("/");
  const nodes = [];
  let after = null;
  for (let page = 1; ; page++) {
    const args = ["graphql", "-f", `query=${query}`, "-F", `owner=${owner}`, "-F", `name=${name}`];
    if (after) args.push("-F", `after=${after}`);
    const conn = (await gh(args)).data.repository[field];
    nodes.push(...conn.nodes);
    if (!conn.pageInfo.hasNextPage) return nodes;
    if (!conn.pageInfo.endCursor || page >= MAX_PAGES) {
      gaps.push(`more ${what} than were read (${nodes.length}): the rest are not read`);
      return nodes;
    }
    after = conn.pageInfo.endCursor;
  }
}

export async function gather(gh, repo, model) {
  const { defaultBranch, integrationPrefix } = model;
  const gaps = [`${model.positions.release.station ?? model.positions.release.stage}: the deployment request is not read yet`];
  // The truncated lists inside a pull request are handled per pull request in fromGraphql: what a cut list cannot show is unknown, never counted as absent.
  const prs = (await pages(gh, PRS, repo, "pullRequests", "open pull requests", gaps)).map((n) => fromGraphql(n, model));
  const refs = await pages(gh, REFS, repo, "refs", "branches", gaps);
  const branches = [];
  const collectors = [];
  for (const ref of refs) {
    if (ref.name === defaultBranch) continue;
    if (ref.name.startsWith(integrationPrefix)) {
      const cmp = await gh([`repos/${repo}/compare/${defaultBranch}...${ref.name}`]);
      collectors.push({ name: ref.name, headSha: ref.target.oid, aheadOfMain: cmp.ahead_by });
    } else if (ref.associatedPullRequests.totalCount === 0) {
      branches.push({ name: ref.name, headSha: ref.target.oid, base: null });
    }
  }
  const main = { name: defaultBranch, headSha: (await gh([`repos/${repo}/commits/${defaultBranch}`])).sha };
  const releases = await gh([`repos/${repo}/releases?per_page=1`]);
  if (releases.length) {
    main.aheadOfLastTag = (await gh([`repos/${repo}/compare/${releases[0].tag_name}...${defaultBranch}`])).ahead_by;
    main.release = null;
  } else {
    gaps.push(`${model.positions.release.station ?? model.positions.release.stage}: no Release exists to compare the default branch with`);
  }
  return { prs, branches, collectors, main, gaps };
}
