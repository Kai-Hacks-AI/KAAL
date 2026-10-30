/** Testing's results (testing/F13). Packaging defines none of its own (packaging/N10). */
export type Result = "verified" | "failed" | "unknown";

/** One generic Requirement, decided against one package. */
export interface Finding {
  /** The Requirement decided, such as "packaging/F7". */
  requirement: string;
  result: Result;
  /** Why, in words a person can act on. */
  cause: string;
}

export interface Conformance {
  package: { name: string; version: string; location: string };
  /** failed when any finding failed, unknown when any is unknown, else verified. */
  result: Result;
  /** One finding for each of packaging/F7–F13 and N7–N9, in that order. */
  findings: Finding[];
  /** What the package's own verification reported. That is its specific contract, not Packaging's to judge. */
  reported: { result: string; exit: number; causes: string[] } | null;
}

/** The documents a KAAL package ships (packaging/F8). */
export const DOCUMENTS: readonly string[];
/** The names under which a source Test Plan declares its Embedded verification (packaging/F14). */
export const EMBEDDED: readonly string[];

/**
 * The generic KAAL Package contract, decided against the package installed at `dir` (absolute)
 * inside the consumer project `consumer` (absolute; default: the directory holding its
 * node_modules). It runs the installed `npm test` once, with `env`.
 */
export function conform(dir: string, options?: { consumer?: string; env?: Record<string, string | undefined> }): Promise<Conformance>;

/** packaging/F14, decided against a package's source workspace at `dir` (absolute). */
export function conformSource(dir: string, options?: { env?: Record<string, string | undefined> }): Promise<Finding>;

/**
 * packaging/N10, decided for the Requirements text `requirements`. `plans` maps each cited owner's
 * plan documents, path to text, as they stand on that owner's branch.
 */
export function references(requirements: string, plans: Record<string, string>): Finding;

/** Every `<capability>/<ID>` the text cites, ranges expanded. */
export function cited(text: string): string[];
/** Every `<capability>/<ID>` a plan document defines. */
export function defined(text: string): Set<string>;

/** The result a verifier reported on its last line, or why none could be read. */
export function resultLine(stdout: string):
  | { result: string; exit: number | undefined; causes: string[]; summary: Record<string, unknown> | null }
  | { error: string };
