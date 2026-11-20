import { TransportError, type Call } from "./gh.js";
import { type PullRequest, unknown } from "./types.js";

/**
 * The review-thread route a Claude Code cloud session offers: `pulls/<n>/ccr/review_threads` answers `resolved` per thread.
 * Plain REST has no thread state at all. Where this route is not answered (`unsupported`) the count is unknown, never a zero.
 * A failure in transit is not "unsupported": it is thrown, so an outage is never reported as a missing fact.
 */
export async function readThreads(repository: string, number: number, call: Call): Promise<PullRequest["threads"]> {
  try {
    const threads = (await call(["api", `repos/${repository}/pulls/${number}/ccr/review_threads`])) as { resolved?: boolean }[];
    if (!Array.isArray(threads)) return unknown("the review-thread route did not answer a list");
    return { unresolved: threads.filter((t) => t.resolved === false).length };
  } catch (error) {
    if (error instanceof TransportError && error.kind === "unsupported") return unknown("no route gives review-thread state in this environment");
    throw error;
  }
}
