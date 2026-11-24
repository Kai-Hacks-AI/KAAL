/** A fact no transport could read. It is never an empty list or a zero: those are only ever what GitHub reported. */
export interface Unknown {
  unknown: true;
  reason: string;
}

/** One check of a pull request's head commit, its newest run, as one of three states. */
export interface Check {
  name: string;
  state: "success" | "failure" | "pending";
}

/** A reviewer's latest review. */
export interface Review {
  author?: string;
  state: string;
  /** The commit the review was made on. */
  commit?: string;
  submittedAt?: string;
}

/** One open pull request, in one shape whichever transport answered. */
export interface PullRequest {
  number: number;
  title: string;
  draft: boolean;
  head: { ref: string; sha: string };
  base: { ref: string };
  /** What GitHub reports (`clean`, `dirty`, `behind`, `blocked`, `unstable`, `has_hooks`, `draft`), lower case. */
  mergeState: string | Unknown;
  autoMerge: boolean | Unknown;
  reviews: Review[] | Unknown;
  threads: { unresolved: number } | Unknown;
  checks: Check[] | Unknown;
}

/** What one start of the command line GitHub is read through gives back. */
export interface GhResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** The one seam for the binary: arguments in, what the command did out. By default `gh`, started through Hosting. */
export type Gh = (args: string[]) => Promise<GhResult>;

export interface PullRequestsOptions {
  gh?: Gh;
  /** Milliseconds to wait before the first of a few repeats of a call that failed in transit; it doubles each time. Default 1000. */
  pauseMs?: number;
}

export const unknown = (reason: string): Unknown => ({ unknown: true, reason });

const BAD = new Set(["FAILURE", "ERROR", "TIMED_OUT", "CANCELLED", "ACTION_REQUIRED", "STARTUP_FAILURE"]);
const GOOD = new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);

/** A GitHub conclusion or state, in either transport's spelling, as one of three. */
export function stateOf(value: string | null | undefined): Check["state"] {
  const v = String(value ?? "").toUpperCase();
  return GOOD.has(v) ? "success" : BAD.has(v) ? "failure" : "pending";
}

/** One entry per check name: the newest run. `at` is its start; later or equal replaces earlier. */
export function newest(runs: { name: string; state: Check["state"]; at?: string }[]): Check[] {
  const held = new Map<string, { name: string; state: Check["state"]; at?: string }>();
  for (const run of runs) {
    const seen = held.get(run.name);
    if (!seen || (run.at ?? "") >= (seen.at ?? "")) held.set(run.name, run);
  }
  return [...held.values()].map(({ name, state }) => ({ name, state }));
}
