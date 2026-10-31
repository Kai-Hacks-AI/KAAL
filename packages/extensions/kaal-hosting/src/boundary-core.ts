// The platform coupling conformance result (hosting/F33, hosting/A14), with no
// test harness, so the command runs it without node:test (hosting/A13).
import { kind, read } from "./index.js";
import { couplings, inspect } from "./conformance.js";
import type { CouplingReport, Finding, FindingKind, Source } from "./couplings.js";
import type { Outside, Skipped, Validation, Violation } from "./conformance.js";

/** What a capability is inspected with. */
export interface BoundaryOptions {
  /** The capability's name, as reported. */
  name: string;
  /** The directory whose sources are inspected. */
  root: string;
  /** The host modules the capability declares it may import directly. Default none. */
  builtins?: string[];
  /** Whether a path is test code; replaces the path rule of hosting/F27. */
  test?: (path: string) => boolean;
}

/** A deterministic Test Case of the suite. */
export interface BoundaryCase {
  name: string;
  outcome: "pass" | "fail" | "not run";
}

/** A request for judgment, owned by Review: it carries no outcome. */
export interface ReviewRequest {
  /** Stable over the same sources, so a judgment can cite it. */
  id: string;
  rule: string;
  owner: "Hosting";
  finding: Finding;
  question: string;
}

export interface BoundaryResult {
  name: string;
  /** Testing's vocabulary, for the deterministic cases only. */
  result: "verified" | "failed" | "unknown";
  review: "requested" | "none";
  cases: BoundaryCase[];
  failures: string[];
  findings: Finding[];
  reviews: ReviewRequest[];
  summary: Record<FindingKind | "acknowledged", number>;
  violations: Violation[];
  validation: Validation[];
  outside: Outside[];
  sources: Source[];
  skipped: Skipped[];
  coverage: readonly string[];
  exclusions: readonly string[];
}

/** The deterministic cases, in order. */
export const CASES = Object.freeze(["inspection completes", "host modules are declared", "production code leaves the host to Hosting"]);

/** What a reviewer must answer, by kind (hosting/F33). */
const QUESTIONS: Record<FindingKind, string> = {
  coupling: "Does this platform literal in production code decide behaviour that Hosting should mediate?",
  registration: "Does this platform decision about whether the test runs leave a behaviour untested on that platform?",
  dilution: "Does this platform decision weaken what is asserted on that platform?",
  setup: "Is this platform-specific fixture setup, with the same assertions on every platform?",
};

/** The line a runner reads: the result, unescaped, on one line. */
export const LINE = "kaal-hosting-boundary";

/** Whether a production finding fails the case `production code leaves the host to Hosting`. */
const deterministic = (f: Finding): boolean => f.scope === "production" && f.rule !== "platform-literal";

/**
 * Inspect the capability under `root`: deterministic Test Cases for what can
 * be decided, and a review request for every other finding (hosting/F33).
 */
export async function boundary({ name, root, builtins = [], test }: BoundaryOptions): Promise<BoundaryResult> {
  const failures: string[] = [];
  let found: CouplingReport = { coverage: [], exclusions: [], sources: [], skipped: [], findings: [] };
  let imports: { violations: Violation[]; validation: Validation[]; outside: Outside[] } = { violations: [], validation: [], outside: [] };
  try {
    if ((await kind(root)) !== "directory") throw new Error(`${root} is not a directory`);
    const files = await read(root);
    found = await couplings(files, test ? { test } : {});
    imports = await inspect(files, { builtins });
  } catch (e) {
    failures.push(e instanceof Error ? e.message : String(e));
  }
  const complete = failures.length === 0;
  const production = found.findings.filter(deterministic);
  const cases: BoundaryCase[] = [
    { name: CASES[0], outcome: complete ? "pass" : "fail" },
    { name: CASES[1], outcome: !complete ? "not run" : imports.violations.length ? "fail" : "pass" },
    { name: CASES[2], outcome: !complete ? "not run" : production.length ? "fail" : "pass" },
  ];
  const reviews: ReviewRequest[] = found.findings
    .filter((f) => !deterministic(f))
    .map((finding) => ({ id: `kaal-hosting/${finding.rule}@${finding.file}:${finding.line}:${finding.column}`, rule: `kaal-hosting/${finding.rule}`, owner: "Hosting", finding, question: QUESTIONS[finding.kind] }));
  const summary = { coupling: 0, registration: 0, dilution: 0, setup: 0, acknowledged: 0 };
  for (const f of found.findings) {
    summary[f.kind]++;
    if (f.acknowledged) summary.acknowledged++;
  }
  return {
    name,
    result: !complete ? "unknown" : cases.some((c) => c.outcome === "fail") ? "failed" : "verified",
    review: reviews.length ? "requested" : "none",
    cases,
    failures,
    findings: found.findings,
    reviews,
    summary,
    violations: imports.violations,
    validation: imports.validation,
    outside: imports.outside,
    sources: found.sources,
    skipped: found.skipped,
    coverage: found.coverage,
    exclusions: found.exclusions,
  };
}
