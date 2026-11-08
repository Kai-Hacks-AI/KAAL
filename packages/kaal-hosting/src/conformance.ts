import { init, parse } from "es-module-lexer";
import { isBuiltin } from "node:module";
import type { Files } from "./index.js";

/** What a consumer declares: the host modules (Node builtins) its code may import directly. */
export interface Expectation {
  builtins: string[];
}

/** Where a finding is: a file of the inspected set, with a 1-based line and column. */
export interface Location {
  file: string;
  line: number;
  column: number;
}

/** A host module imported directly although the consumer did not declare it: mechanically verified. */
export interface Violation extends Location {
  /** The specifier as written. */
  specifier: string;
  /** The builtin it names, normalized to its `node:` form. */
  builtin: string;
}

/** Something that may reach the host where no mechanical check can decide whether it does: for an Agent or a person to judge. */
export interface Validation extends Location {
  /** The construct as found, or the file's whole path when the file could not be read as a module. */
  construct: string;
  reason: string;
}

/** A module from outside the inspected files and outside the host: its own host access is not inspected here. */
export interface Outside extends Location {
  specifier: string;
}

/** A file given but not inspected, and why. */
export interface Skipped {
  file: string;
  reason: string;
}

/**
 * Evidence about the inspected files, in three kinds that are never merged:
 * what was verified to break the declared boundary, what needs validation,
 * and what lies outside the inspection. A report with no violations says
 * that none was found within `coverage`; it is never a statement that the
 * code complies, since `exclusions` name what was not examined.
 */
export interface Report {
  coverage: readonly string[];
  exclusions: readonly string[];
  inspected: string[];
  skipped: Skipped[];
  violations: Violation[];
  validation: Validation[];
  outside: Outside[];
}

/** What `inspect` examines. */
export const COVERAGE: readonly string[] = Object.freeze([
  "static import and export-from declarations in ES module JavaScript files (.js, .mjs)",
  "import() with a literal specifier",
  "Node builtins named with or without the node: prefix, including subpaths such as fs/promises",
  "import() with a computed specifier, process.getBuiltinModule, process.binding, process._linkedBinding, process.dlopen, eval and new Function, which are reported for validation",
]);

/** What `inspect` does not examine: a finding-free report says nothing about these. */
export const EXCLUSIONS: readonly string[] = Object.freeze([
  "host access through process, globalThis or other globals beyond the members reported for validation",
  "CommonJS: require and .cjs files",
  "native addons, WebAssembly, workers and other code loaded indirectly",
  "the host access of modules reported as outside",
  "TypeScript sources and declarations (.ts, .d.ts, .mts, .cts): inspect the JavaScript that runs",
  "whether relative imports resolve to the files given",
]);

const MODULE = /\.(m?js)$/;

// Constructs that can reach the host without importing a builtin. A match may
// sit in a comment or a string; it is reported for validation, never as a
// violation, so over-reporting asks for judgment and claims nothing.
const INDIRECT: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bprocess\s*\.\s*(getBuiltinModule|binding|_linkedBinding|dlopen)\b/g, reason: "reaches host modules or native code without an import" },
  { pattern: /\beval\s*\(/g, reason: "runs code built at run time, which may reach the host" },
  { pattern: /\bnew\s+Function\b/g, reason: "runs code built at run time, which may reach the host" },
];

/** The `node:` form of a builtin's name, or undefined for anything that is not one. */
function builtin(specifier: string): string | undefined {
  if (!isBuiltin(specifier)) return undefined;
  return specifier.startsWith("node:") ? specifier : `node:${specifier}`;
}

function relative(specifier: string): boolean {
  return specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/");
}

function locate(source: string, file: string, index: number): Location {
  let line = 1;
  let start = 0;
  for (let i = source.indexOf("\n"); i !== -1 && i < index; i = source.indexOf("\n", i + 1)) {
    line++;
    start = i + 1;
  }
  return { file, line, column: index - start + 1 };
}

function order<T extends Location>(a: T, b: T): number {
  return a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.column - b.column;
}

/**
 * Inspect the JavaScript modules among `files` against the host modules the
 * consumer declares it may import. Hosting knows only what a host module is;
 * which ones a consumer may use is the consumer's declaration. The same input
 * always yields the same report.
 */
export async function inspect(files: Files, expected: Expectation): Promise<Report> {
  const declared = new Set<string>();
  for (const name of expected.builtins) {
    const normal = builtin(name);
    if (normal === undefined) throw new TypeError(`${name} is not a Node builtin`);
    declared.add(normal);
  }
  await init();
  const report: Report = { coverage: COVERAGE, exclusions: EXCLUSIONS, inspected: [], skipped: [], violations: [], validation: [], outside: [] };
  for (const file of Object.keys(files).sort()) {
    if (!MODULE.test(file)) {
      report.skipped.push({ file, reason: "not an ES module JavaScript file" });
      continue;
    }
    report.inspected.push(file);
    const source = files[file].toString("utf8");
    let imports;
    try {
      [imports] = parse(source, file);
    } catch (e) {
      report.validation.push({ file, line: 1, column: 1, construct: file, reason: `could not be read as a module: ${(e as Error).message}` });
      continue;
    }
    for (const i of imports) {
      if (i.type === "import-meta") continue;
      const at = locate(source, file, i.start);
      if (i.type === "dynamic" && (i.specifier === undefined || i.glob)) {
        report.validation.push({ ...at, construct: `import(${source.slice(i.start, i.end)})`, reason: "import() with a computed specifier may load a host module" });
        continue;
      }
      const specifier = i.specifier as string;
      const host = builtin(specifier);
      if (host !== undefined) {
        if (!declared.has(host)) report.violations.push({ ...at, specifier, builtin: host });
      } else if (!relative(specifier)) {
        report.outside.push({ ...at, specifier });
      }
    }
    for (const { pattern, reason } of INDIRECT) {
      for (const m of source.matchAll(pattern)) report.validation.push({ ...locate(source, file, m.index!), construct: m[0], reason });
    }
  }
  report.violations.sort(order);
  report.validation.sort(order);
  report.outside.sort(order);
  return report;
}
