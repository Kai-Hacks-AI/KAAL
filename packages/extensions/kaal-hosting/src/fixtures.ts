// Host facts and the fixtures that need them (hosting/F37, hosting/F38,
// hosting/A17). Test support for other capabilities' tests, never their
// production code; it never loads node:test. It is the one place a KAAL test
// makes a FIFO or a Unix-domain socket.
import { lstatSync, mkdtempSync, rmSync } from "node:fs";
import { createServer, type Server } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execute } from "./index.js";

/** A host fact a case may need, named without any platform. */
export type Fact = "kaal-hosting/special-entries";

/** Whether a fact holds on this host, why, and the evidence. */
export interface Established {
  holds: boolean;
  reason: string;
  /** An https link. */
  evidence: string;
}

/** The fixture where `kaal-hosting/special-entries` holds. */
export interface SpecialEntries {
  holds: true;
  fifo: string;
  socket: string;
  /** Stops the listener; the entries stay for the case to inspect. */
  close(): Promise<void>;
}

/** The fixture where it does not: nothing was made. */
export interface Unavailable {
  holds: false;
  fact: Fact;
  reason: string;
  evidence: string;
}

/** The facts Hosting establishes, in order. */
export const FACTS: readonly Fact[] = Object.freeze(["kaal-hosting/special-entries"]);

// The evidence per outcome, as skills/kaal-hosting-boundary/HOSTS.md states it per host (hosting/F41).
const EVIDENCE = {
  holds: "https://github.com/Kai-Hacks-AI/KAAL/blob/kaal/hosting/packages/extensions/kaal-hosting/test/plan/portability.test.mjs",
  lacks: "https://github.com/Kai-Hacks-AI/KAAL/pull/650#issuecomment-6517684723",
};

/** The entry at `path`, or undefined where there is none or it cannot be looked at. */
const look = (path: string) => {
  try {
    return lstatSync(path, { throwIfNoEntry: false });
  } catch {
    return undefined;
  }
};

/** Remove `path` where it exists; a path that cannot hold an entry holds nothing to remove. */
const remove = (path: string) => {
  try {
    rmSync(path, { force: true });
  } catch {
    // ENOTDIR and the like: nothing was made there.
  }
};

const closing = (server: Server) => (): Promise<void> => new Promise((done) => server.close(() => done()));

/**
 * Try to make a FIFO and a listening socket in `dir`, undoing whatever was made
 * when either cannot be. Returns the fixture, or the reason it could not be made.
 */
async function attempt(dir: string): Promise<SpecialEntries | { failed: string }> {
  const fifo = join(dir, "fifo");
  const socket = join(dir, "socket");
  // These names belong to the caller until this attempt creates them. In
  // particular, a failed mkfifo/listen is never authority to unlink them.
  for (const path of [fifo, socket]) if (look(path)) return { failed: `${path} already exists` };
  const made = await execute("mkfifo", [fifo], { cwd: tmpdir() }).then(
    (r) => (r.status === 0 ? undefined : `mkfifo exited ${r.status}: ${r.stderr.trim()}`),
    (e: unknown) => `mkfifo could not run: ${e instanceof Error ? e.message : String(e)}`,
  );
  if (made !== undefined || !look(fifo)?.isFIFO()) {
    if (made === undefined) remove(fifo);
    return { failed: made ?? `${fifo} is not a FIFO` };
  }
  const server = createServer();
  const listening = await new Promise<string | undefined>((done) => {
    server.once("error", (e) => done(e.message));
    server.listen(socket, () => done(undefined));
  });
  if (listening !== undefined || !look(socket)?.isSocket()) {
    if (listening === undefined) await closing(server)();
    remove(fifo);
    if (listening === undefined) remove(socket);
    return { failed: listening ?? `${socket} is not a socket` };
  }
  return { holds: true, fifo, socket, close: closing(server) };
}

/**
 * The host fact holds, but the fixture could not be made in the directory asked
 * for: a setup failure, so the case cannot be verified. It is thrown, never
 * returned as `holds: false`, so it can never stand for a host that lacks the
 * fact or justify treating a case as not applicable (hosting/F38).
 */
export class SetupFailure extends Error {
  readonly outcome = "unknown";
  constructor(
    readonly fact: Fact,
    readonly dir: string,
    readonly reason: string,
  ) {
    super(`${fact} holds on this host, but its fixture could not be made in ${dir}: ${reason}`);
    this.name = "SetupFailure";
  }
}

let established: Promise<Record<Fact, Established>> | undefined;

/**
 * Establish each host fact on this host by trying it in a fresh temporary
 * directory, never by reading the platform's name. Established once per process.
 */
export function facts(): Promise<Record<Fact, Established>> {
  established ??= (async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-hosting-fact-"));
    try {
      const made = await attempt(dir);
      if ("holds" in made) await made.close();
      return {
        "kaal-hosting/special-entries": "holds" in made
          ? { holds: true, reason: "a FIFO and a Unix-domain socket can be placed in a directory tree", evidence: EVIDENCE.holds }
          : { holds: false, reason: "no FIFO or Unix-domain socket can be placed in a directory tree on this host", evidence: EVIDENCE.lacks },
      };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  })();
  return established;
}

/**
 * The special-entry fixture, with three distinct outcomes (hosting/F38):
 * - the fact holds and the fixture is made: a FIFO at `dir/fifo` and a
 *   listening Unix-domain socket at `dir/socket`, for the case to run with
 *   its full assertions;
 * - the fact does not hold on this host: nothing is made, and the fact,
 *   reason and evidence are returned, for a declared host applicability;
 * - the fact holds but the fixture cannot be made in `dir`: a `SetupFailure`
 *   is thrown, so the case fails as unverifiable and is never not applicable.
 */
export async function specialEntries(dir: string): Promise<SpecialEntries | Unavailable> {
  const fact = (await facts())["kaal-hosting/special-entries"];
  if (!fact.holds) return { holds: false, fact: "kaal-hosting/special-entries", reason: fact.reason, evidence: fact.evidence };
  const made = await attempt(dir);
  if ("failed" in made) throw new SetupFailure("kaal-hosting/special-entries", dir, made.failed);
  return made;
}
