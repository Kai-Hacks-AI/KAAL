import { HostingError } from "../index.js";
import { readGraphql } from "./gh-graphql.js";
import { readRest } from "./gh-rest.js";
import { TransportError, caller, defaultGh } from "./gh.js";
import type { PullRequest, PullRequestsOptions } from "./types.js";

export type { Check, Gh, GhResult, PullRequest, PullRequestsOptions, Review, Unknown } from "./types.js";

/**
 * The open pull requests of `repository` (`owner/name`), one record each, in one shape whichever transport answered. This step holds
 * no route, query or environment test: it tries the transports in order, moves on only from one that says it is `unsupported` here,
 * and leaves what no transport answered to the transport's own `unknown`. A failure in transit, or any other failure, rejects with
 * `PULLS_UNREADABLE` and its reason: an outage is never reported as a fact GitHub does not give.
 */
export async function readPullRequests(repository: string, options: PullRequestsOptions = {}): Promise<PullRequest[]> {
  if (typeof repository !== "string" || !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new HostingError(`${JSON.stringify(repository)} is not owner/name`, "PULLS_UNREADABLE");
  const call = caller(options.gh ?? defaultGh, options.pauseMs ?? 1000);
  const refused: string[] = [];
  for (const transport of [readGraphql, readRest]) {
    try {
      return await transport(repository, call);
    } catch (error) {
      if (!(error instanceof TransportError)) throw error;
      if (error.kind !== "unsupported") throw new HostingError(`the open pull requests of ${repository} could not be read (${error.kind}): ${error.message}`, "PULLS_UNREADABLE");
      refused.push(error.message);
    }
  }
  throw new HostingError(`no route reads the open pull requests of ${repository} here: ${refused.join("; ")}`, "PULLS_UNREADABLE");
}
