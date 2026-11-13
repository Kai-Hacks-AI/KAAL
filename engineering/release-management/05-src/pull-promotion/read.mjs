// Reads, from the host, the four things the Pull Promotion capability judges, for the collectors a declaration lists.
// Read-only: every call is a plain GET of the host's REST API. `get(path)` takes the path of one GET and returns its parsed answer;
// the command supplies it (see run.mjs). A list the host cut is never read as complete: the gatherer fails naming what it could not read.
const PAGE = 100;
const MAX_PAGES = 5;
const TYPE = /^(PLAN|DO|ACT|SYNC|PROMOTION|HOTFIX): /;
const PIECE = /^(PLAN|DO|ACT|SYNC|PROMOTION|HOTFIX): .*\(#(\d+)\)\s*$/;
const FAILED = new Set(['failure', 'timed_out', 'cancelled', 'action_required', 'startup_failure', 'stale']);
const GREEN = new Set(['success', 'neutral', 'skipped']);

const drivenBy = (message) => /^Driven-by:\s*(\S+)\s*$/m.exec(message ?? '')?.[1];

async function pages(get, path, pick) {
  const out = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = pick(await get(`${path}${path.includes('?') ? '&' : '?'}per_page=${PAGE}&page=${page}`));
    out.push(...batch);
    if (batch.length < PAGE) return out;
  }
  throw new Error(`could not read all of ${path.split('?')[0]}: more than ${PAGE * MAX_PAGES} entries`);
}

// Per check, the newest run counts: an older failure that a later run of the same check superseded is not red.
export function checksOf(runs) {
  const newest = new Map();
  for (const run of runs) {
    const held = newest.get(run.name);
    if (!held || (run.started_at ?? '') >= (held.started_at ?? '')) newest.set(run.name, run);
  }
  return [...newest.values()].map((run) => ({
    name: run.name,
    conclusion: run.status !== 'completed' ? 'pending' : GREEN.has(run.conclusion) ? 'success' : FAILED.has(run.conclusion) ? 'failure' : 'pending',
  }));
}

// A commit on a collector is a piece when its subject is `TYPE: description (#number)`. Its Change is its Driven-by trailer; without one it names none.
export function pieceOf(commit, collector, lifecycle) {
  const m = PIECE.exec(String(commit.commit?.message ?? '').split('\n')[0]);
  if (!m || !lifecycle.includes(m[1])) return undefined;
  return { ref: `#${m[2]}`, type: m[1], change: drivenBy(commit.commit.message), into: collector, state: 'landed', landedAt: commit.commit.committer?.date ?? commit.commit.author?.date };
}

export async function readFacts(repoName, declaration, get) {
  const [owner] = repoName.split('/');
  const lifecycle = Array.isArray(declaration.lifecycle) ? declaration.lifecycle : [];
  const facts = { collectors: [], pieces: [], deliveries: [] };
  for (const { name } of declaration.collectors ?? []) {
    let branch;
    try { branch = await get(`repos/${repoName}/branches/${encodeURIComponent(name).replace(/%2F/g, '/')}`); } catch (error) {
      if (/HTTP 404/.test(error.message)) continue; // the host has no such collector: the capability reports it as not judged
      throw error;
    }
    const sha = branch.commit.sha;
    const runs = await pages(get, `repos/${repoName}/commits/${sha}/check-runs`, (r) => r.check_runs ?? []);
    facts.collectors.push({ name, at: sha, checks: checksOf(runs) });

    const delivered = (await pages(get, `repos/${repoName}/pulls?state=closed&base=main&head=${owner}:${name}`, (r) => r))
      .filter((pull) => pull.merged_at)
      .map((pull) => ({ collector: name, delivered: pull.head.sha, landedAt: pull.merged_at }));
    facts.deliveries.push(...delivered);
    const since = delivered.map((d) => d.landedAt).sort().pop();

    const commits = await pages(get, `repos/${repoName}/commits?sha=${name}${since ? `&since=${since}` : ''}`, (r) => r);
    for (const commit of commits) {
      const piece = pieceOf(commit, name, lifecycle);
      if (piece) facts.pieces.push(piece);
    }

    for (const pull of await pages(get, `repos/${repoName}/pulls?state=open&base=${name}`, (r) => r)) {
      const type = TYPE.exec(pull.title)?.[1];
      if (!type || !lifecycle.includes(type)) continue;
      const own = await pages(get, `repos/${repoName}/pulls/${pull.number}/commits`, (r) => r);
      const change = [...own].reverse().map((c) => drivenBy(c.commit?.message)).find(Boolean);
      facts.pieces.push({ ref: `#${pull.number}`, type, change, into: name, state: 'open' });
    }
  }
  return facts;
}
