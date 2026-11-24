// Reads the facts of the collectors by GET alone (release/C73). `api(method, path)` is the only way out.
const COLLECTOR = /^kaal\/[a-z0-9-]+\/[a-z0-9-]+$/;
export async function listCollectors(api, repo) {
  const refs = await api('GET', `repos/${repo}/git/matching-refs/heads/kaal/`);
  return refs.map((r) => r.ref.replace('refs/heads/', '')).filter((n) => COLLECTOR.test(n));
}
export async function openPromotions(api, repo) {
  const open = await api('GET', `repos/${repo}/pulls?state=open&base=main&per_page=50`);
  return open.map((p) => ({ number: p.number, title: p.title, head: p.head.ref }));
}
export async function gatherFacts(api, repo, collector) {
  const owner = repo.split('/')[0];
  const cmp = await api('GET', `repos/${repo}/compare/main...${collector}`);
  const ref = await api('GET', `repos/${repo}/git/ref/heads/${collector}`);
  const closed = await api('GET', `repos/${repo}/pulls?state=closed&base=${collector}&per_page=30&sort=updated&direction=desc`);
  const open = await api('GET', `repos/${repo}/pulls?state=open&head=${owner}:${collector}&per_page=30`);
  return {
    collector,
    aheadOfMain: cmp.ahead_by,
    tip: ref.object.sha,
    merged: closed.filter((p) => p.merged_at).sort((a, b) => b.merged_at.localeCompare(a.merged_at)).map((p) => ({ number: p.number, title: p.title, body: p.body })),
    open: open.map((p) => ({ number: p.number, title: p.title, base: p.base.ref, head: p.head.ref })),
  };
}
