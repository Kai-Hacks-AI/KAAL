import { execute } from "../index.js";
import type { Gh, GhResult } from "./types.js";

/** `unsupported`: this transport does not answer in this environment, so another may. `transient`: it may answer later. `failed`: neither (no credentials, an answer that is not JSON, no `gh`). */
export type Kind = "unsupported" | "transient" | "failed";

export class TransportError extends Error {
  constructor(message: string, readonly kind: Kind) {
    super(message);
  }
}

/** The default binary: `gh`, started as any other command is. A `gh` that cannot be started is a result, not a throw. */
export const defaultGh: Gh = async (args) => {
  try {
    const run = await execute("gh", args, { cwd: process.cwd() });
    return { status: run.status, stdout: run.stdout, stderr: run.stderr };
  } catch (cause) {
    return { status: null, stdout: "", stderr: `gh could not be started: ${(cause as Error).message}` };
  }
};

/** What a failed call says about the route: refused here, failed in transit, or neither. A rate limit is in transit, never a refusal. */
export function classify(result: GhResult): Kind {
  const text = result.stderr;
  if (/rate limit|abuse|secondary|HTTP 429|HTTP 5\d\d|timed? ?out|ETIMEDOUT|ECONN|EAI_AGAIN|ENOTFOUND|could not resolve|network is unreachable|connection (reset|refused)/i.test(text)) return "transient";
  if (/not available from Claude Code sessions|HTTP (404|410)\b|HTTP 403\b/i.test(text)) return "unsupported";
  return "failed";
}

const pause = (ms: number) => new Promise((done) => setTimeout(done, ms));
const first = (text: string) => text.trim().split("\n")[0] ?? "";

/** One call, parsed. A failure in transit is repeated three times; a refusal or any other failure is thrown at once, as what it is. */
export function caller(gh: Gh, pauseMs: number): (args: string[]) => Promise<unknown> {
  return async (args) => {
    for (let attempt = 1; ; attempt++) {
      const result = await gh(args);
      if (result.status === 0) {
        try {
          return JSON.parse(result.stdout);
        } catch {
          throw new TransportError(`gh ${args[0]} did not answer JSON`, "failed");
        }
      }
      const kind = classify(result);
      if (kind !== "transient" || attempt === 4) throw new TransportError(`gh ${args.slice(0, 2).join(" ")}: ${first(result.stderr) || `status ${result.status}`}`, kind);
      await pause(pauseMs * 2 ** (attempt - 1));
    }
  };
}

export type Call = ReturnType<typeof caller>;
