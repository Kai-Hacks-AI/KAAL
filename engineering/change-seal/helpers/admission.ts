// PROVISIONAL, admission into the lineage: one predicate over two KAAL
// directories, the baseline (already admitted) and the candidate (proposed).
// It admits exactly when the candidate introduces one new Change, that Change
// is closed in the process's own sense, and every Change closed in the baseline
// is still closed here with the same identity. It adds no rule of completeness
// of its own: closure is stateOf's verdict, identity is changes.ts's, history
// is preservation.ts's preserveChanges. It knows nothing of
// Git, GitHub, branches, PRs or CI; whatever hosts the lineage supplies the two
// directories and enforces the verdict.
import { changes, closedChanges } from "./changes.js";
import { preserveChanges } from "./preservation.js";
import { stateOf } from "./process.js";

export interface Verdict {
  admitted: boolean;
  /** The new Change, when there is exactly one. */
  change?: string;
  /** Why not; empty exactly when admitted. */
  reasons: string[];
}

/** A Change of the candidate is new when the baseline has neither a Change at its address nor a closed Change of its identity. */
export function newChanges(baseline: string, candidate: string): string[] {
  const addresses = new Set(changes(baseline));
  const identities = new Set(closedChanges(baseline).map((c) => c.id));
  const identityAt = new Map(closedChanges(candidate).map((c) => [c.path, c.id]));
  return changes(candidate).filter((path) => !addresses.has(path) && !identities.has(identityAt.get(path) ?? ""));
}

export function admit(baseline: string, candidate: string): Verdict {
  const reasons: string[] = [];
  reasons.push(...preserveChanges(baseline, candidate));
  const fresh = newChanges(baseline, candidate);
  if (fresh.length === 0) reasons.push("the candidate introduces no new Change: everything that joins the lineage is a Change");
  if (fresh.length > 1) reasons.push(`the candidate introduces ${fresh.length} new Changes (${fresh.join(", ")}): an admission is exactly one`);
  if (fresh.length !== 1) return { admitted: false, reasons };
  const change = fresh[0];
  const { stage, next, problems } = stateOf(candidate, change);
  if (stage !== "CHANGE CLOSED") reasons.push(`the new Change ${change} is ${stage}, not closed: ${next}`);
  reasons.push(...problems);
  return { admitted: reasons.length === 0, change, reasons };
}
