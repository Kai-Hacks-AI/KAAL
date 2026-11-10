// Gathers the facts track Work sorts (release-management/C7). Read-only: one GraphQL call and a few REST reads through `gh`.
// `gh` is injected (args -> parsed JSON) so the Cases run it without a network. What cannot be read is returned as a gap, never dropped.
import { fromGraphql } from "./track-work.mjs";

const QUERY = `query($owner:String!,$name:String!){repository(owner:$owner,name:$name){
  pullRequests(states:OPEN,first:100){pageInfo{hasNextPage} nodes{number title headRefName headRefOid baseRefName mergeStateStatus autoMergeRequest{enabledAt}
    reviewThreads(first:100){pageInfo{hasNextPage} nodes{isResolved}}
    latestReviews(first:20){nodes{state commit{oid}}}
    commits(last:1){nodes{commit{oid statusCheckRollup{state contexts(first:100){nodes{__typename ... on CheckRun{name conclusion} ... on StatusContext{context state}}}}}}}}}
  refs(refPrefix:"refs/heads/",first:100){pageInfo{hasNextPage} nodes{name target{oid} associatedPullRequests(first:1){totalCount}}}}}`;

export async function gather(gh, repo, defaultBranch = "main") {
  const [owner, name] = repo.split("/");
  const gaps = ["10-npmjs: the deployment request to the protected npm environment is not read yet"];
  const data = (await gh(["graphql", "-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `name=${name}`])).data.repository;
  if (data.pullRequests.pageInfo.hasNextPage) gaps.push("more than 100 open pull requests: the rest are not read");
  if (data.refs.pageInfo.hasNextPage) gaps.push("more than 100 branches: the rest are not read");
  const prs = data.pullRequests.nodes.map((n) => {
    if (n.reviewThreads.pageInfo.hasNextPage) gaps.push(`#${n.number}: more than 100 review threads, unresolved count may be low`);
    return fromGraphql(n);
  });
  const branches = [];
  const collectors = [];
  for (const ref of data.refs.nodes) {
    if (ref.name === defaultBranch) continue;
    if (ref.name.startsWith("kaal/")) {
      const cmp = await gh([`repos/${repo}/compare/${defaultBranch}...${ref.name}`]);
      collectors.push({ name: ref.name, headSha: ref.target.oid, aheadOfMain: cmp.ahead_by });
    } else if (ref.associatedPullRequests.totalCount === 0) {
      branches.push({ name: ref.name, headSha: ref.target.oid, base: null });
    }
  }
  const main = { headSha: (await gh([`repos/${repo}/commits/${defaultBranch}`])).sha };
  const releases = await gh([`repos/${repo}/releases?per_page=1`]);
  if (releases.length) {
    main.aheadOfLastTag = (await gh([`repos/${repo}/compare/${releases[0].tag_name}...${defaultBranch}`])).ahead_by;
    main.release = null;
  } else {
    gaps.push("10-npmjs: no Release exists to compare main with");
  }
  return { prs, branches, collectors, main, gaps };
}
