// The Boundary Check scan (hosting/F64–hosting/F69, hosting/A27–hosting/A29): where the files under any
// target decide by platform, one finding per source line, as evidence and never as a verdict. It reads each
// target through Hosting's own `read` and `readFile`, groups the hits of `scanHits`, and stores and judges
// no decision. It imports no module of another KAAL capability and no `node:crypto` (hosting/N9).
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
import { digest, kind, read, readFile } from "./index.js";
import type { Files } from "./index.js";
import { scanHits } from "./couplings.js";
import type { FindingKind, Hit, Rule, Scope } from "./couplings.js";

/** What a scan is run with. */
export interface ScanOptions {
  /** The files and folders to scan, as given. */
  targets: string[];
  /** The one directory file ids are relative to. Default: the current directory. */
  base?: string;
  /** The scan's name as reported. Default: the base name of the first target. */
  name?: string;
}

/** A later use of an identifier bound on a finding's line: counted apart, never a finding or a decision of its own. */
export interface Reference {
  file: string;
  line: number;
  column: number;
  construct: string;
}

/** A line of a source that holds platform logic: a question put to the owner of the code. */
export interface ScanFinding {
  /** `kaal-hosting/<file>:<line>`, `file` relative to the base, written with `/`. */
  id: string;
  file: string;
  line: number;
  column: number;
  scope: Scope;
  rules: Rule[];
  classes: FindingKind[];
  /** The constructs as written, in order of appearance. */
  constructs: string[];
  /** Hosting's `digest` of the line's text as UTF-8: it moves with no edit above the line and changes with an edit to it. */
  digest: string;
  question: string;
  acknowledged?: string;
  references: Reference[];
}

export interface ScanResult {
  name: string;
  mode: "scan";
  /** `complete` when every target was read; `unknown` otherwise. Neither is a pass. */
  result: "complete" | "unknown";
  target: string[];
  findings: ScanFinding[];
  coverage: {
    /** The sources examined. */
    read: string[];
    /** Files not examined, with the reason. */
    skipped: { file: string; reason: string }[];
    /** Targets that could not be read, with the reason. */
    unreadable: { target: string; reason: string }[];
    /** The rules applied. */
    rules: Rule[];
    /** What the scan does not examine. */
    exclusions: readonly string[];
  };
  counts: { findings: number; references: number; rules: Record<string, number>; classes: Record<string, number> };
}

const RULES: Rule[] = ["platform-query", "platform-literal", "host-api"];
const CLASSES: FindingKind[] = ["coupling", "registration", "dilution", "setup"];

/** What the owner is asked about a finding (hosting/F68). */
export const SCAN_QUESTION = "Can this platform logic move to Hosting or be removed, or is it legitimate here, and what evidence says so?";

const slash = (path: string): string => path.split(sep).join("/");
const within = (base: string, path: string): boolean => {
  const to = relative(base, path);
  return to === "" || (!to.startsWith("..") && !isAbsolute(to));
};

/**
 * Scan the targets. The result is `complete` when every target was read and `unknown` when one was not;
 * a finding-free result says that none was found within `coverage`, never that the target complies (hosting/F32).
 */
export async function scan({ targets, base = process.cwd(), name }: ScanOptions): Promise<ScanResult> {
  const root = resolve(base);
  const files: Files = {};
  const unreadable: { target: string; reason: string }[] = [];
  for (const given of targets) {
    const at = resolve(given);
    if (!within(root, at)) {
      unreadable.push({ target: given, reason: `lies outside the base ${slash(root)}` });
      continue;
    }
    const prefix = slash(relative(root, at));
    try {
      const found = await kind(at);
      if (found === "directory") {
        for (const [path, bytes] of Object.entries(await read(at))) Object.defineProperty(files, prefix ? `${prefix}/${path}` : path, { value: bytes, enumerable: true, writable: true, configurable: true });
      } else if (found === "file") {
        Object.defineProperty(files, prefix, { value: await readFile(at), enumerable: true, writable: true, configurable: true });
      } else {
        unreadable.push({ target: given, reason: found === "missing" ? "does not exist" : "is neither a file nor a directory" });
      }
    } catch (e) {
      unreadable.push({ target: given, reason: e instanceof Error ? e.message : String(e) });
    }
  }
  const report = await scanHits(files);
  const lines = (file: string) => files[file].toString("utf8").split("\n");

  // Group the hits by file and line; a use of a bound identifier whose declaration line is itself a finding is a reference.
  const byLine = new Map<string, Hit[]>();
  for (const hit of report.findings) {
    const key = `${hit.file}\u0000${hit.line}`;
    byLine.set(key, [...(byLine.get(key) ?? []), hit]);
  }
  const isUse = (hit: Hit): boolean => hit.via !== undefined;
  // Where a line's references point: a line is an origin unless all its hits are uses of a binding whose line holds hits.
  const origin = (file: string, line: number, seen = new Set<number>()): number | undefined => {
    const hits = byLine.get(`${file}\u0000${line}`);
    if (!hits || seen.has(line)) return undefined;
    seen.add(line);
    if (!hits.every(isUse)) return line;
    const via = hits[0].via!;
    return hits.every((h) => h.via === via) ? origin(file, via, seen) : line;
  };
  const referenceOf = (hit: Hit): number | undefined => (isUse(hit) && hit.via !== hit.line ? origin(hit.file, hit.via!) : undefined);

  const findings = new Map<string, ScanFinding & { _hits: Hit[] }>();
  const references = new Map<string, Reference[]>();
  for (const hit of report.findings) {
    const target = referenceOf(hit);
    if (target !== undefined && byLine.get(`${hit.file}\u0000${hit.line}`)!.every((h) => referenceOf(h) !== undefined)) {
      const key = `${hit.file}\u0000${target}`;
      references.set(key, [...(references.get(key) ?? []), { file: hit.file, line: hit.line, column: hit.column, construct: hit.construct }]);
    }
  }
  for (const [key, hits] of byLine) {
    if (hits.every((h) => referenceOf(h) !== undefined)) continue;
    const { file, line } = hits[0];
    const text = (lines(file)[line - 1] ?? "").replace(/\r$/, "");
    const acknowledged = hits.find((h) => h.acknowledged)?.acknowledged;
    findings.set(key, {
      id: `kaal-hosting/${file}:${line}`,
      file,
      line,
      column: Math.min(...hits.map((h) => h.column)),
      scope: hits[0].scope,
      rules: RULES.filter((r) => hits.some((h) => h.rule === r)),
      classes: CLASSES.filter((c) => hits.some((h) => h.kind === c)),
      constructs: [...new Set([...hits].sort((a, b) => a.column - b.column).map((h) => h.construct))],
      digest: digest(Buffer.from(text, "utf8")),
      question: SCAN_QUESTION,
      ...(acknowledged ? { acknowledged } : {}),
      references: [],
      _hits: hits,
    });
  }
  const out: ScanFinding[] = [];
  for (const [key, f] of [...findings].sort(([a], [b]) => {
    const [fa, la] = a.split("\u0000");
    const [fb, lb] = b.split("\u0000");
    return fa < fb ? -1 : fa > fb ? 1 : Number(la) - Number(lb);
  })) {
    const { _hits, ...finding } = f;
    out.push({ ...finding, references: (references.get(key) ?? []).sort((a, b) => a.line - b.line || a.column - b.column) });
  }

  const counts = { findings: out.length, references: out.reduce((n, f) => n + f.references.length, 0), rules: {} as Record<string, number>, classes: {} as Record<string, number> };
  for (const rule of RULES) counts.rules[rule] = out.filter((f) => f.rules.includes(rule)).length;
  for (const klass of CLASSES) counts.classes[klass] = out.filter((f) => f.classes.includes(klass)).length;
  return {
    name: name ?? basename(resolve(targets[0] ?? ".")),
    mode: "scan",
    result: unreadable.length || targets.length === 0 ? "unknown" : "complete",
    target: targets,
    findings: out,
    coverage: {
      read: report.sources.map((s) => s.file),
      skipped: [...report.skipped].map((s) => ({ file: s.file, reason: s.reason })),
      unreadable,
      rules: RULES,
      exclusions: report.exclusions,
    },
    counts,
  };
}
