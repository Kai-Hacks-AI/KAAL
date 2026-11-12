// Recorded host responses for the supplier Cases. Not a Case. They are RECONSTRUCTED to the shape the host documents
// (a GraphQL result and a compare result), not captured from the live host: they prove the supplier's mapping,
// never that the host can supply the facts. The live Case (T22) proves that.
export const run = (name, status, conclusion, startedAt = '2026-11-12T07:00:00Z') => ({ __typename: 'CheckRun', name, status, conclusion, startedAt });

export const node = (number, over = {}) => ({
  number,
  title: 'DO: Work item',
  body: `## Change\n\nc/C${number} work item: something.\n\n## Implement\n\nDone.\n`,
  headRefName: `work-${number}`,
  headRefOid: `h${number}`,
  baseRefName: 'col-a',
  state: 'OPEN',
  mergedAt: null,
  mergeCommit: null,
  mergeStateStatus: 'CLEAN',
  autoMergeRequest: null,
  reviewThreads: { pageInfo: { hasNextPage: false }, nodes: [] },
  latestReviews: { nodes: [] },
  commits: { nodes: [{ commit: { statusCheckRollup: { state: 'SUCCESS', contexts: { pageInfo: { hasNextPage: false }, nodes: [run('build', 'COMPLETED', 'SUCCESS')] } } } }] },
  ...over,
});

export const ref = (name, oid) => ({ name, target: { oid } });

export const graphql = ({ open = [], landed = [], refs = [], main = 'main-1', openMore = false, landedMore = false, refsMore = false } = {}) => ({
  data: { repository: {
    defaultBranchRef: { name: 'main', target: { oid: main } },
    open: { pageInfo: { hasNextPage: openMore }, nodes: open },
    landed: { pageInfo: { hasNextPage: landedMore }, nodes: landed },
    refs: { pageInfo: { hasNextPage: refsMore }, nodes: refs },
  } },
});

// The injected host reader: gh(args) -> parsed JSON, like the `gh` command line. A compare result says how far a collector is behind the target.
export const ghFrom = ({ graphql: result, compare = {} }) => async (args) => {
  if (args[0] === 'graphql') {
    if (result instanceof Error) throw result;
    return result;
  }
  const match = /compare\/[^/]+\.\.\.(.+)$/.exec(args[0]);
  const hit = match && compare[match[1]];
  if (!hit) throw new Error(`404 ${args[0]}`);
  return hit;
};
