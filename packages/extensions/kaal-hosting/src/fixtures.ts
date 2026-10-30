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

const closing = (server: Server) => (): Promise<void> => new Promise((done) => server.close(() => done()));

/** Try to make a FIFO and a listening socket in `dir`; undo whatever was made when either cannot be. */
async function attempt(dir: string): Promise<SpecialEntries | undefined> {
  const fifo = join(dir, "fifo");
  const socket = join(dir, "socket");
  const made = await execute("mkfifo", [fifo], { cwd: dir }).then(
    (r) => r.status === 0,
    () => false,
  );
  if (!made || !lstatSync(fifo, { throwIfNoEntry: false })?.isFIFO()) {
    rmSync(fifo, { force: true });
    return undefined;
  }
  const server = createServer();
  const listening = await new Promise<boolean>((done) => {
    server.once("error", () => done(false));
    server.listen(socket, () => done(true));
  });
  if (!listening || !lstatSync(socket, { throwIfNoEntry: false })?.isSocket()) {
    if (listening) await closing(server)();
    rmSync(fifo, { force: true });
    rmSync(socket, { force: true });
    return undefined;
  }
  return { holds: true, fifo, socket, close: closing(server) };
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
      await made?.close();
      return {
        "kaal-hosting/special-entries": made
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
 * Where `kaal-hosting/special-entries` holds, a FIFO at `dir/fifo` and a
 * listening Unix-domain socket at `dir/socket`. Where it does not, nothing is
 * made, and the fact, reason and evidence are returned. Never throws because
 * a host lacks the fact.
 */
export async function specialEntries(dir: string): Promise<SpecialEntries | Unavailable> {
  const fact = (await facts())["kaal-hosting/special-entries"];
  if (fact.holds) {
    const made = await attempt(dir);
    if (made) return made;
  }
  return { holds: false, fact: "kaal-hosting/special-entries", reason: fact.reason, evidence: fact.evidence };
}
