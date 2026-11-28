// The attribution of a fact (hosting/F106, hosting/A47). A fact Hosting read is frozen and entered in a table of Hosting's
// own, with the App whose grant read it and the repository; the table is private and the entry is never a field of the
// fact. What a copy, a clone, a JSON round trip or a hand-built twin holds is the same data and no entry, so it is not
// Hosting's. A consumer that gets `null` has an unknown, never a result, and a fact does not cross a process: the judge
// there reads again through Hosting with its own grant.
import { grantOrigin } from "./grant.js";

export interface FactOrigin { app: string; repo: string }
const table = new WeakMap<object, FactOrigin>();

function freeze<T>(value: T): T {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) freeze(inner);
  }
  return value;
}

/**
 * Hosting's own act, used by the reads after the grant was verified: freeze the fact and enter it in the table. The origin is
 * what Hosting holds privately for the grant, never a field of anything the caller supplied, and this function is not exported
 * from the package, whose exports map refuses a deep import of this module.
 */
export function attribute<T extends object>(fact: T, grant: unknown): T {
  table.set(freeze(fact), Object.freeze(grantOrigin(grant)));
  return fact;
}

/** The App and the repository whose read made this very fact, or null when Hosting did not make it: unknown, never a result. */
export function factOrigin(fact: unknown): FactOrigin | null {
  const found = typeof fact === "object" && fact !== null ? table.get(fact) : undefined;
  return found === undefined ? null : { app: found.app, repo: found.repo };
}
