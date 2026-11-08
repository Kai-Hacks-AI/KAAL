// The Change lifecycle, read from facts a Change's realization keeps.
// Reading those facts from a pull request is Engineering's Branching.

export const STATES = Object.freeze(["Proposed", "Accepted", "Withdrawn", "Promoted"]);

const MOVES = Object.freeze({
  Proposed: ["Accepted", "Withdrawn"],
  Withdrawn: ["Proposed"],
  Accepted: ["Promoted"],
  Promoted: [],
});

/**
 * Reads a Change's state from `{ open, merged, promoted }`: whether it is
 * open against its collector, whether it merged into it, and whether the
 * collector's work containing it reached main. Returns `{ state }`, or
 * `{ finding }` when the facts contradict each other.
 */
export function readLifecycle({ open, merged, promoted }) {
  if (![open, merged, promoted].every((fact) => typeof fact === "boolean")) return { finding: "open, merged and promoted are each true or false" };
  if (open && merged) return { finding: "a Change cannot be open and merged at once" };
  if (promoted && !merged) return { finding: "only an Accepted Change can be Promoted" };
  if (promoted) return { state: "Promoted" };
  if (merged) return { state: "Accepted" };
  return { state: open ? "Proposed" : "Withdrawn" };
}

/** Whether a Change may move from one state to another. */
export function canMove(from, to) {
  return (MOVES[from] ?? []).includes(to);
}
