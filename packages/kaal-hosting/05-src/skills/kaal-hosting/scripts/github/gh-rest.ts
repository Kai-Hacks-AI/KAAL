import { readThreads } from "./cloud-threads.js";
import { TransportError, type Call } from "./gh.js";
import { type Check, type PullRequest, type Review, newest, stateOf, unknown } from "./types.js";

const PAGE = 100;
const MAX_PAGES = 50;
const WIDTH = 6;
type Item = any; // GitHub's answer; each field is read defensively below

async function list(repository: string, call: Call): Promise<Item[]> {
  const all: Item[] = [];
  for (let page = 1; ; page++) {
    const part = (await call(["api", `repos/${repository}/pulls?state=open&per_page=${PAGE}&page=${page}`])) as Item[];
    all.push(...part);
    if (part.length < PAGE) return all;
    if (page >= MAX_PAGES) throw new TransportError(`more than ${all.length} open pull requests`, "failed");
  }
}

async function reviewsOf(repository: string, number: number, call: Call): Promise<Review[] | ReturnType<typeof unknown>> {
  const all = (await call(["api", `repos/${repository}/pulls/${number}/reviews?per_page=${PAGE}`])) as Item[];
  if (all.length >= PAGE) return unknown("GitHub cut the list of reviews at 100");
  const latest = new Map<string, Item>();
  for (const r of all.filter((x) => x.state !== "PENDING")) {
    const key = r.user?.login ?? `#${r.id}`;
    const held = latest.get(key);
    if (!held || (r.submitted_at ?? "") >= (held.submitted_at ?? "")) latest.set(key, r);
  }
  return [...latest.values()].map((r) => ({ author: r.user?.login, state: r.state, commit: r.commit_id, submittedAt: r.submitted_at }));
}

async function checksOf(repository: string, sha: string, call: Call): Promise<Check[] | ReturnType<typeof unknown>> {
  const runs = (await call(["api", `repos/${repository}/commits/${sha}/check-runs?per_page=${PAGE}`])) as Item;
  const status = (await call(["api", `repos/${repository}/commits/${sha}/status?per_page=${PAGE}`])) as Item;
  const checkRuns: Item[] = runs.check_runs ?? [];
  const statuses: Item[] = status.statuses ?? [];
  if ((runs.total_count ?? checkRuns.length) > checkRuns.length) return unknown("GitHub cut the list of checks at 100");
  return newest([
    ...checkRuns.map((c) => ({ name: c.name, state: c.status && c.status !== "completed" ? "pending" as const : stateOf(c.conclusion), at: c.started_at })),
    ...statuses.map((s) => ({ name: s.context, state: stateOf(s.state) })),
  ]);
}

async function record(repository: string, item: Item, call: Call): Promise<PullRequest> {
  const one = (await call(["api", `repos/${repository}/pulls/${item.number}`])) as Item;
  const state = String(one.mergeable_state ?? "unknown").toLowerCase();
  return {
    number: item.number, title: item.title, draft: Boolean(item.draft),
    head: { ref: item.head.ref, sha: item.head.sha }, base: { ref: item.base.ref },
    mergeState: state === "unknown" ? unknown("GitHub has not computed the merge state yet") : state,
    autoMerge: item.auto_merge != null,
    reviews: await reviewsOf(repository, item.number, call),
    threads: await readThreads(repository, item.number, call),
    checks: await checksOf(repository, item.head.sha, call),
  };
}

/** The transport that reads REST routes, pull by pull, and the review threads from the cloud route. */
export async function readRest(repository: string, call: Call): Promise<PullRequest[]> {
  const items = await list(repository, call);
  const records: PullRequest[] = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(WIDTH, items.length) }, async () => {
    while (next < items.length) {
      const at = next++;
      records[at] = await record(repository, items[at], call);
    }
  }));
  return records;
}
