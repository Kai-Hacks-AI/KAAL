// Gathers the facts track Work classifies (release-management/F23). Read-only: one GraphQL call and a few REST reads through `gh`.
// `gh` is injected (args -> parsed JSON) so the Cases run it without a network, and the model says what is the default branch and the integration prefix.
// What cannot be read is returned as a gap, never dropped.
import { fromGraphql } from "./track-work.mjs";

const QUERY = `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){
  pullRequests(states:OPEN,first:100){pageInfo{hasNextPage} nodes{number title headRefName headRefOid baseRefName mergeStateStatus autoMergeRequest{enabledAt}
    files(first:100){pageInfo{hasNextPage} nodes{path}}
    reviewThreads(first:100){pageInfo{hasNextPage} nodes{isResolved}}
    latestReviews(first:20){nodes{state commit{oid}}}
    commits(last:1){nodes{commit{oid statusCheckRollup{state contexts(first:100){pageInfo{hasNextPage} nodes{__typename ... on CheckRun{name conclusion status startedAt} ... on StatusContext{context state}}}}}}}}}
  refs(refPrefix:"refs/heads/",first:100){pageInfo{hasNextPage} nodes{name target{oid} associatedPullRequests(first:1){totalCount}}}}}`;

export async function gather(gh, repo, model) {
  const [owner, name] = repo.split("/");
  const { defaultBranch, integrationPrefix } = model;
  const gaps = [`${model.positions.release.station ?? model.positions.release.stage}: the deployment request is not read yet`];
  const data = (await gh(["graphql", "-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `name=${name}`])).data.repository;
  if (data.pullRequests.pageInfo.hasNextPage) gaps.push("more than 100 open pull requests: the rest are not read");
  if (data.refs.pageInfo.hasNextPage) gaps.push("more than 100 branches: the rest are not read");
  const prs = data.pullRequests.nodes.map((n) => {
    if (n.reviewThreads.pageInfo.hasNextPage) gaps.push(`#${n.number}: more than 100 review threads, unresolved count may be low`);
    if (n.files?.pageInfo.hasNextPage) gaps.push(`#${n.number}: more than 100 changed files, the record folder may be missed`);
    return fromGraphql(n, model);
  });
  const branches = [];
  const collectors = [];
  for (const ref of data.refs.nodes) {
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
