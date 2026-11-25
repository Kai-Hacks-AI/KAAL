import { HostingError } from "../index.js";
import { readPullRequests } from "./pull-requests.js";
import type { PullRequestsOptions } from "./types.js";

const LINE = "kaal-hosting-pulls";

/**
 * `kaal-hosting-pulls --repository <owner/name>`: the line it prints and the status it ends with. It prints facts, not a verdict:
 * `read` with the records, or `cannot-determine` with the code and reason. Exit 0 when read, 2 when not; it never exits 1.
 */
export async function pullRequestsCommand(args: string[], options: PullRequestsOptions = {}): Promise<{ line: string; status: 0 | 2 }> {
  const at = args.indexOf("--repository");
  const repository = at >= 0 ? args[at + 1] : undefined;
  if (!repository || repository.startsWith("--")) return { line: `${LINE} ${JSON.stringify({ result: "cannot-determine", code: "USAGE", reason: "usage: kaal-hosting-pulls --repository <owner/name>" })}`, status: 2 };
  try {
    return { line: `${LINE} ${JSON.stringify({ result: "read", repository, pulls: await readPullRequests(repository, options) })}`, status: 0 };
  } catch (error) {
    const code = error instanceof HostingError ? error.code : "ERROR";
    return { line: `${LINE} ${JSON.stringify({ result: "cannot-determine", code, reason: String((error as Error)?.message ?? error) })}`, status: 2 };
  }
}
