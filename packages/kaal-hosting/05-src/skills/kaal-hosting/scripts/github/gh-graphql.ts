import { TransportError, type Call } from "./gh.js";
import { type Check, type PullRequest, type Review, newest, stateOf, unknown } from "./types.js";

// Everything about the open pull requests in one call per page. Each nested list that GitHub cut is not read as short: that fact is unknown.
const QUERY = "query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){pullRequests(states:OPEN,first:20,after:$after){pageInfo{hasNextPage endCursor} nodes{number title isDraft headRefName headRefOid baseRefName mergeStateStatus autoMergeRequest{enabledAt} reviewThreads(first:100){pageInfo{hasNextPage} nodes{isResolved}} latestReviews(first:20){pageInfo{hasNextPage} nodes{state submittedAt author{login} commit{oid}}} commits(last:1){nodes{commit{oid statusCheckRollup{state contexts(first:100){pageInfo{hasNextPage} nodes{__typename ... on CheckRun{name conclusion status startedAt} ... on StatusContext{context state}}}}}}}}}}}";
const MAX_PAGES = 100;

type Node = any; // GitHub's answer; each field is read defensively below

function checksOf(node: Node): Check[] | ReturnType<typeof unknown> {
  const rollup = node.commits?.nodes?.at(-1)?.commit?.statusCheckRollup;
  if (!rollup) return [];
  const contexts = rollup.contexts;
  if (contexts?.pageInfo?.hasNextPage) return unknown("GitHub cut the list of checks at 100");
  if (!contexts?.nodes?.length) return rollup.state ? [{ name: "(roll-up)", state: stateOf(rollup.state) }] : [];
  return newest(contexts.nodes.map((c: Node) => (c.name
    ? { name: c.name, state: c.status && c.status !== "COMPLETED" ? "pending" as const : stateOf(c.conclusion), at: c.startedAt }
    : { name: c.context, state: stateOf(c.state) })));
}

function toRecord(node: Node): PullRequest {
  const state = String(node.mergeStateStatus ?? "UNKNOWN").toLowerCase();
  const reviews: Review[] | ReturnType<typeof unknown> = node.latestReviews?.pageInfo?.hasNextPage
    ? unknown("GitHub cut the list of latest reviews at 20")
    : (node.latestReviews?.nodes ?? []).map((r: Node) => ({ author: r.author?.login, state: r.state, commit: r.commit?.oid, submittedAt: r.submittedAt }));
  const threads = node.reviewThreads?.pageInfo?.hasNextPage
    ? unknown("GitHub cut the list of review threads at 100")
    : { unresolved: (node.reviewThreads?.nodes ?? []).filter((t: Node) => !t.isResolved).length };
  return {
    number: node.number, title: node.title, draft: Boolean(node.isDraft),
    head: { ref: node.headRefName, sha: node.headRefOid }, base: { ref: node.baseRefName },
    mergeState: state === "unknown" ? unknown("GitHub has not computed the merge state yet") : state,
    autoMerge: Boolean(node.autoMergeRequest), reviews, threads, checks: checksOf(node),
  };
}

/** The transport that asks GitHub GraphQL. It is refused in some environments (`unsupported`), and then another transport reads. */
export async function readGraphql(repository: string, call: Call): Promise<PullRequest[]> {
  const [owner, name] = repository.split("/");
  const nodes: Node[] = [];
  let after: string | null = null;
  for (let page = 1; ; page++) {
    const args = ["api", "graphql", "-f", `query=${QUERY}`, "-F", `owner=${owner}`, "-F", `name=${name}`];
    if (after) args.push("-F", `after=${after}`);
    const connection = ((await call(args)) as Node).data.repository.pullRequests;
    nodes.push(...connection.nodes);
    if (!connection.pageInfo.hasNextPage) break;
    if (!connection.pageInfo.endCursor || page >= MAX_PAGES) throw new TransportError(`more than ${nodes.length} open pull requests`, "failed");
    after = connection.pageInfo.endCursor;
  }
  return nodes.map(toRecord);
}
