/** One neutral fact about a copy an installation host holds (packaging/F53). */
export interface HeldFact {
  package: string;
  at: string;
  /** The number of `node_modules/` segments in `at`. */
  depth: number;
  /** The consumer a nested copy sits under; `null` at depth 1. */
  consumer: string | null;
  held: string;
  packed: string;
  integrity: string;
  packedIntegrity: string;
  resolved?: string | null;
}

export interface HeldVerdict {
  verdict: "match" | "pin-behind" | "verified failure";
  reason: string;
}

/** Judge a held copy against the packed one (packaging/F53 to F57). Pure. */
export function classifyHeld(fact: HeldFact): HeldVerdict;
