// Where a failure could have been found earliest (release-management/C2, T30; Owner, 10 November 2026: "checks are registered to guard").
// One pure function of a Guard check declaration (`runs`, `facts`) and, optionally, the inputs its verdict actually needs. It uses Guard's
// registry and builds no new mechanism. The line is information only: it never changes a verdict, an exit status or a gate.
// The vocabulary is the product's stage names the Owner cleared; tagging and release are not cleared and are absent. Born in KAAL, to be
// abstracted into Guard later, so this file carries product language only.

/** The stages the Owner cleared as product language. */
export const STAGES = ["development", "integration", "promotion", "publishing"] as const;
export type Stage = (typeof STAGES)[number];

/** The facts a development hook supplies, as Guard documents them. */
export const DEVELOPMENT_FACTS: readonly string[] = ["head", "base", "base-ref", "changed"];

export interface Declaration {
  runs?: string[];
  facts?: string[];
}

export interface Earliest {
  /** Where the declaration runs the check first. */
  registered: Stage;
  /** Where its inputs would allow it to run first. */
  possible: Stage;
  /** The check is registered later than it could run. */
  gap: boolean;
  /** One short line, at most 100 characters. */
  line: string;
}

/**
 * @param needs inputs the verdict needs beyond its declared facts (for example "pull-request": state a hook cannot have). A declaration
 *              alone can omit them, so the caller names them and the check is then not movable to development.
 */
export function earliestStage(declaration: Declaration, opts: { needs?: string[] } = {}): Earliest {
  const runs = declaration.runs ?? [];
  const facts = declaration.facts ?? [];
  const needs = opts.needs ?? [];
  const registered: Stage = runs.includes("hook") ? "development" : "integration";
  const hookCan = facts.every((f) => DEVELOPMENT_FACTS.includes(f)) && needs.length === 0;
  const possible: Stage = hookCan ? "development" : "integration";
  const gap = registered !== possible;
  const where = gap
    ? "declare runs: [hook] to move it"
    : registered === "development"
      ? "registered there"
      : `registered for ci; needs ${[...facts.filter((f) => !DEVELOPMENT_FACTS.includes(f)), ...needs].join(", ") || "ci"}`;
  const line = `Earliest: ${possible} (${where})`.slice(0, 100);
  return { registered, possible, gap, line };
}
