// The platform coupling conformance result (hosting/F33, hosting/A14), with no
// test harness, so the command runs it without node:test (hosting/A13).
import { kind, read } from "./index.js";
import { couplings, inspect, osBoundary } from "./conformance.js";
import { FACTS } from "./fixtures.js";
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

/** A case's declared applicability, as testing/F47 and hosting/F39 shape it. */
export interface Applicability {
  platforms?: string[];
  requires?: string[];
  absent?: string[];
  /** Host facts the case needs (hosting/F37). */
  host?: string[];
  reason?: string;
  /** An https link. */
  evidence?: string;
  /** A link to Review's judgment: evidence only, never closing the request. */
  review?: string;
}

export interface PortabilityOptions extends BoundaryOptions {
  /** The capability's declarations, keyed by case name, as the runner read them. */
  applicability?: Record<string, Applicability>;
}

/** A problem with a declared applicability (hosting/F40). */
export interface ApplicabilityFinding {
  /** The case, or `package.json` for the manifest. */
  case: string;
  rule: "platform-applicability" | "unknown-host-fact" | "unreasoned" | "unevidenced" | "stale";
  problem: string;
}

/** A host exception put to Review: it carries no outcome. */
export interface HostReviewRequest {
  id: string;
  rule: "kaal-hosting/host-applicability";
  owner: "Hosting";
  case: string;
  declaration: Applicability;
  question: string;
}

export interface PortabilityCase {
  name: string;
  outcome: "pass" | "fail" | "not run" | "not applicable";
}

export interface PortabilityResult extends Omit<BoundaryResult, "cases" | "reviews"> {
  osBoundary: boolean;
  cases: PortabilityCase[];
  applicability: ApplicabilityFinding[];
  reviews: (ReviewRequest | HostReviewRequest)[];
  /** The case names Testing must not count as evidence. */
  challenged: string[];
}

/** The deterministic cases the audit adds to hosting/F33's. */
export const PORTABILITY_CASES = Object.freeze(["applicability is not scoped by platform", "host exceptions are well-formed"]);

/** Facts that hold on every host in skills/kaal-hosting-boundary/HOSTS.md: an exception needing only these is stale. */
const EVERYWHERE: readonly string[] = [];
const LINK = /^https:\/\/\S+$/;
const HOST_QUESTION = "Is this case genuinely inapplicable where the fact does not hold, with its assertions intact where it does, and does the evidence show it?";

/** The literal titles of the tests registered in `code`, with where each call starts. */
function titles(code: string): { index: number; title: string }[] {
  return [...code.matchAll(/\b(?:it|test)(?:\s*\.\s*\w+)?\s*\)?\s*\(\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/g)].map((m) => ({ index: m.index!, title: m[2] }));
}

/** Preserve offsets while hiding comments and quoted text from structural scans. */
function structure(code: string): string {
  return code.replace(/\/\*[^]*?\*\/|\/\/[^\n]*|"(?:\\[^]|[^"\\])*"|'(?:\\[^]|[^'\\])*'|`(?:\\[^]|[^`\\])*`/g,
    (text) => text.replace(/[^\n\r]/g, " "));
}

/** Literal cases containing a finding or registered by its controlling condition. */
function affected(code: string, line: number, column: number): string[] {
  const mask = structure(code);
  const pairs = new Map<number, number>();
  const stack: number[] = [];
  for (let i = 0; i < mask.length; i++) {
    if ("({[".includes(mask[i])) stack.push(i);
    else if (")}]".includes(mask[i]) && stack.length) pairs.set(stack.pop()!, i);
  }
  const space = (from: number): number => {
    while (/\s/.test(mask[from] ?? "") && from < mask.length) from++;
    return from;
  };
  const statementEnd = (from: number): number => {
    const start = space(from);
    if (mask[start] === "{") return (pairs.get(start) ?? mask.length - 1) + 1;
    for (let i = start; i < mask.length; i++) {
      if (pairs.has(i)) i = pairs.get(i)!;
      else if (mask[i] === ";") return i + 1;
      else if (mask[i] === "}") return i;
    }
    return mask.length;
  };
  const at = code.split("\n").slice(0, line - 1).reduce((n, text) => n + text.length + 1, 0) + column - 1;
  const calls: { start: number; end: number; title: string }[] = [];
  for (const match of mask.matchAll(/\b(?:it|test)(?:\s*\.\s*\w+)?\s*\)?\s*\(/g)) {
    const open = match.index! + match[0].lastIndexOf("(");
    const end = pairs.get(open);
    const title = /^\s*(["'`])((?:(?!\1)[^\\]|\\.)*)\1/.exec(code.slice(open + 1));
    if (end === undefined || !title) continue;
    // A conditional selecting it/test is wrapped before its argument list.
    const wrapper = [...pairs].find(([start, close]) => start < match.index! && close >= match.index! && close < open && mask.slice(close + 1, open).trim() === "");
    calls.push({ start: wrapper?.[0] ?? match.index!, end, title: title[2] });
  }
  const result = new Set<string>();
  const containing = calls.filter((call) => call.start <= at && at <= call.end).sort((a, b) => (a.end - a.start) - (b.end - b.start));
  if (containing.length) result.add(containing[0].title);
  for (const match of mask.matchAll(/\bif\s*\(/g)) {
    const open = match.index! + match[0].lastIndexOf("(");
    const close = pairs.get(open);
    if (close === undefined || !(open < at && at < close)) continue;
    let end = statementEnd(close + 1);
    const otherwise = space(end);
    if (/^else\b/.test(mask.slice(otherwise))) end = statementEnd(otherwise + 4);
    for (const call of calls) if (close < call.start && call.start < end) result.add(call.title);
  }
  return [...result];
}

/**
 * The portability audit (hosting/F40): hosting/F33's result, unchanged, with
 * the capability's applicability declarations checked against hosting/F39's
 * rules, each host exception put to review, and the challenged cases named.
 */
export async function portability({ applicability = {}, ...options }: PortabilityOptions): Promise<PortabilityResult> {
  const base = await boundary(options);
  const complete = base.failures.length === 0;
  const files = complete ? await read(options.root) : {};
  let manifest: { name?: unknown; os?: unknown; cpu?: unknown } = {};
  try {
    if (files["package.json"]) manifest = JSON.parse(files["package.json"].toString("utf8"));
  } catch {
    // An unreadable manifest names no package, so it is not the boundary.
  }
  const os = typeof manifest.name === "string" && osBoundary(manifest.name);
  const tests = base.sources.filter((s) => s.scope === "test").map((s) => [s.file, files[s.file].toString("utf8")] as const);
  const registered = new Set(tests.flatMap(([, text]) => titles(text).map((t) => t.title)));
  const found: ApplicabilityFinding[] = [];
  const requests: HostReviewRequest[] = [];
  if (!os && (manifest.os !== undefined || manifest.cpu !== undefined)) found.push({ case: "package.json", rule: "platform-applicability", problem: "the manifest limits the package by os or cpu outside the operating-system boundary" });
  for (const [name, declaration] of Object.entries(applicability)) {
    if (!os && Array.isArray(declaration.platforms) && declaration.platforms.length) found.push({ case: name, rule: "platform-applicability", problem: "applicability scoped by platform outside the operating-system boundary" });
    if (!Array.isArray(declaration.host) || !declaration.host.length) continue;
    const unknown = declaration.host.filter((h) => !(FACTS as readonly string[]).includes(h));
    if (unknown.length) found.push({ case: name, rule: "unknown-host-fact", problem: `names facts Hosting does not establish: ${unknown.join(", ")}` });
    if (!declaration.reason) found.push({ case: name, rule: "unreasoned", problem: "declared with no reason" });
    if (!LINK.test(declaration.evidence ?? "")) found.push({ case: name, rule: "unevidenced", problem: "declared with no https evidence" });
    const isRegistered = registered.has(name) || [...registered].some((t) => name.endsWith(` > ${t}`));
    if (!isRegistered) found.push({ case: name, rule: "stale", problem: "no test source registers a case of that title" });
    else if (declaration.host.every((h) => EVERYWHERE.includes(h))) found.push({ case: name, rule: "stale", problem: "every fact it names holds on every host" });
    requests.push({ id: `kaal-hosting/host-applicability@${name}`, rule: "kaal-hosting/host-applicability", owner: "Hosting", case: name, declaration, question: HOST_QUESTION });
  }
  const scoped = found.some((f) => f.rule === "platform-applicability");
  const malformed = found.some((f) => f.rule !== "platform-applicability");
  const cases: PortabilityCase[] = [
    ...base.cases,
    { name: PORTABILITY_CASES[0], outcome: !complete ? "not run" : os ? "not applicable" : scoped ? "fail" : "pass" },
    { name: PORTABILITY_CASES[1], outcome: !complete ? "not run" : malformed ? "fail" : "pass" },
  ];
  const challenged = new Set(found.filter((f) => f.case !== "package.json").map((f) => f.case));
  for (const f of base.findings) {
    if (f.kind !== "registration" && f.kind !== "dilution") continue;
    for (const title of affected(tests.find(([file]) => file === f.file)?.[1] ?? "", f.line, f.column)) challenged.add(title);
  }
  const reviews = [...base.reviews, ...requests];
  return {
    ...base,
    result: !complete ? "unknown" : cases.some((c) => c.outcome === "fail") ? "failed" : "verified",
    review: reviews.length ? "requested" : "none",
    osBoundary: os,
    cases,
    applicability: found,
    reviews,
    challenged: [...challenged].sort(),
  };
}
