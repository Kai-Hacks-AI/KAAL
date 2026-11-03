import type { Files } from "./index.js";
import type { Location, Skipped } from "./conformance.js";

/** Whether a source is production code or test code (hosting/F27). */
export type Scope = "production" | "test";

/** What a finding is (hosting/F28). */
export type Rule = "platform-query" | "platform-literal" | "host-api";

/** What a finding does where it is (hosting/F29). */
export type FindingKind = "coupling" | "registration" | "dilution" | "setup";

/** A place where code couples to a particular platform: evidence for review, never a verdict. */
export interface Finding extends Location {
  scope: Scope;
  rule: Rule;
  kind: FindingKind;
  /** The construct as written. */
  construct: string;
  /** The reason a `// kaal-hosting: platform <reason>` comment gives: evidence offered to a reviewer, never an approval. */
  acknowledged?: string;
}

/** A source read, and its scope. */
export interface Source {
  file: string;
  scope: Scope;
}

/**
 * Where the sources couple to a platform, within `coverage`. A report with
 * no finding says that none was found there, never that the code complies.
 */
export interface CouplingReport {
  coverage: readonly string[];
  exclusions: readonly string[];
  sources: Source[];
  skipped: Skipped[];
  findings: Finding[];
}

export interface CouplingOptions {
  /** Whether a path is test code; replaces the path rule of hosting/F27. */
  test?: (path: string) => boolean;
}

/** What `couplings` examines. */
export const COUPLING_COVERAGE: readonly string[] = Object.freeze([
  "JavaScript and TypeScript sources (.js, .mjs, .cjs, .ts, .mts, .cts): platform queries, platform literals and host-specific APIs, with identifiers bound to them in the same file, and how each is used in test code",
]);

/** What `couplings` does not examine: a finding-free report says nothing about these. */
export const COUPLING_EXCLUSIONS: readonly string[] = Object.freeze([
  "platform decisions reached through data: values read from files, the environment or arguments at run time, or passed in from outside the inspected sources",
  "identifiers bound to a platform query in another file",
  "code loaded indirectly or built at run time",
  "TypeScript declaration files (.d.ts)",
]);

const SOURCE = /\.(m?js|cjs|ts|mts|cts)$/;
const DECLARATION = /\.d\.(m|c)?ts$/;
const PLATFORMS = new Set(["win32", "darwin", "linux", "freebsd", "openbsd", "sunos", "aix", "android", "cygwin", "netbsd", "windows", "macos"]);
const OS_QUERIES = ["platform", "type", "arch", "release", "version", "EOL"];
const PATH_QUERIES = ["sep", "delimiter", "win32", "posix"];

const isTest = (path: string): boolean => /(^|\/)(test|tests|__tests__|fixtures|scripts)\//.test(path) || /\.(test|spec)\./.test(path.split("/").at(-1) ?? "");

interface Comment {
  line: number;
  text: string;
  /** Whether code precedes it on its line. */
  trailing: boolean;
}

/** The source with every comment blanked out, offsets kept, and the line comments. */
function strip(source: string): { code: string; comments: Comment[] } {
  let code = "";
  const comments: Comment[] = [];
  let line = 1;
  for (let i = 0; i < source.length; ) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i) === -1 ? source.length : source.indexOf("\n", i);
      comments.push({ line, text: source.slice(i + 2, end), trailing: code.slice(code.lastIndexOf("\n") + 1).trim() !== "" });
      code += " ".repeat(end - i);
      i = end;
    } else if (c === "/" && next === "*") {
      const close = source.indexOf("*/", i + 2);
      const end = close === -1 ? source.length : close + 2;
      for (const ch of source.slice(i, end)) {
        code += ch === "\n" ? "\n" : " ";
        if (ch === "\n") line++;
      }
      i = end;
    } else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < source.length && source[j] !== c) j += source[j] === "\\" ? 2 : 1;
      const literal = source.slice(i, j + 1);
      code += literal;
      for (const ch of literal) if (ch === "\n") line++;
      i = j + 1;
    } else {
      code += c;
      if (c === "\n") line++;
      i++;
    }
  }
  return { code, comments };
}

/** The 1-based line and column of `index`. */
function position(code: string, index: number): { line: number; column: number } {
  const before = code.slice(0, index);
  return { line: before.split("\n").length, column: index - before.lastIndexOf("\n") };
}

/** The [open, close] offsets of every balanced pair of `open` and `close` outside string literals. */
function groups(code: string, open: string, close: string): [number, number][] {
  const stack: number[] = [];
  const out: [number, number][] = [];
  let quote: string | undefined;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = undefined;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === open) stack.push(i);
    else if (c === close && stack.length) out.push([stack.pop()!, i]);
  }
  return out;
}

const escape = (name: string): string => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const REGISTRATION = /\b(it|test|describe|suite)(\s*\.\s*(skip|todo|only))?\s*\(|\.skip\s*\(|\.todo\s*\(/;
const ASSERTION = /(\bassert(\s*\.\s*\w+)*|\bt\s*\.\s*assert\s*\.\s*\w+|\bexpect\s*\([^]*?\)\s*(\.\s*\w+)+)\s*$/;

/** The rest of the line from `from`. */
const rest = (code: string, from: number): string => code.slice(from, code.indexOf("\n", from) === -1 ? code.length : code.indexOf("\n", from));

/** What a platform finding in test code decides (hosting/F29). */
function classify(code: string, at: number, parens: [number, number][], braces: [number, number][]): FindingKind {
  // In a skip, todo or only option.
  if (/(skip|todo|only)\s*:\s*[^,}]*$/.test(code.slice(Math.max(0, at - 80), at))) return "registration";
  // In a conditional expression that picks a test registration on either side,
  // such as `(WINDOWS ? () => {} : it)(…)` (hosting/F40).
  const start = Math.max(code.lastIndexOf(";", at), code.lastIndexOf("\n", at)) + 1;
  if (/\?\s*(it|test|describe|suite)\b[^:]*:|\?[^:]*:\s*(it|test|describe|suite)\b/.test(rest(code, start))) return "registration";
  // In an if condition: what its branches do.
  for (const [open, close] of parens) {
    if (!(open < at && at < close && /\bif\s*$/.test(code.slice(Math.max(0, open - 6), open)))) continue;
    let k = close + 1;
    while (/\s/.test(code[k] ?? "")) k++;
    let body: string;
    if (code[k] === "{") {
      const group = braces.find(([s]) => s === k);
      const end = group ? group[1] + 1 : code.length;
      body = code.slice(k, end);
      const otherwise = /^\s*else\s*/.exec(code.slice(end));
      if (otherwise) {
        const s = end + otherwise[0].length;
        const next = braces.find(([o]) => o === s);
        body += next ? code.slice(s, next[1] + 1) : rest(code, s);
      }
    } else {
      body = rest(code, k);
    }
    if (REGISTRATION.test(body) || /^\s*\{?\s*return\b/.test(body)) return "registration";
    if (/\bassert\b|\bexpect\s*\(/.test(body)) return "dilution";
    return "setup";
  }
  // In an assertion's arguments.
  for (const [open, close] of parens) if (open < at && at < close && ASSERTION.test(code.slice(Math.max(0, open - 200), open))) return "dilution";
  return "setup";
}

interface Raw {
  index: number;
  rule: Rule;
  construct: string;
}

/** Every platform finding in `code`, unclassified. */
function find(code: string): Raw[] {
  const raw: Raw[] = [];
  const add = (index: number, rule: Rule, construct: string) => raw.push({ index, rule, construct });
  const osNames = new Set(["os"]);
  const pathNames = new Set(["path"]);
  const queries = new Map<string, string>();
  for (const m of code.matchAll(/import\s+(?:\*\s+as\s+)?([\w$]+)\s+from\s+["'](node:)?(os|path)["']/g)) (m[3] === "os" ? osNames : pathNames).add(m[1]);
  for (const m of code.matchAll(/(?:const|let|var)\s+([\w$]+)\s*=\s*require\(\s*["'](node:)?(os|path)["']\s*\)/g)) (m[3] === "os" ? osNames : pathNames).add(m[1]);
  for (const m of code.matchAll(/import\s*\{([^}]*)\}\s*from\s*["'](node:)?(os|path)["']/g)) {
    for (const part of m[1].split(",")) {
      const [name, alias] = part.trim().split(/\s+as\s+/);
      if ((m[3] === "os" ? OS_QUERIES : PATH_QUERIES).includes(name)) queries.set(alias ?? name, `${m[3]}.${name}`);
    }
  }
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=\s*process\b/g)) {
    for (const part of m[1].split(",")) {
      const [name, alias] = part.trim().split(/\s*:\s*/);
      if (name !== "platform" && name !== "arch") continue;
      queries.set(alias ?? name, `process.${name}`);
      add(m.index! + m[0].indexOf(name), "platform-query", `process.${name}`);
    }
  }
  for (const m of code.matchAll(/\bprocess\s*\.\s*(platform|arch)\b/g)) add(m.index!, "platform-query", m[0]);
  for (const name of osNames) {
    for (const m of code.matchAll(new RegExp(`\\b${escape(name)}\\s*\\.\\s*(platform|type|arch|release|version)\\s*\\(|\\b${escape(name)}\\s*\\.\\s*EOL\\b`, "g"))) add(m.index!, "platform-query", m[0].replace(/\s*\($/, "()"));
  }
  for (const name of pathNames) for (const m of code.matchAll(new RegExp(`\\b${escape(name)}\\s*\\.\\s*(sep|delimiter|win32|posix)\\b`, "g"))) add(m.index!, "platform-query", m[0]);
  for (const [name, what] of queries) {
    for (const m of code.matchAll(new RegExp(`(?<![.\\w$])${escape(name)}\\b(?!\\s*[:,}]|\\s+as\\b)`, "g"))) {
      const inImport = /import\s*\{[^}]*$/.test(code.slice(0, m.index));
      const inPattern = /\{[^}]*$/.test(code.slice(code.lastIndexOf("\n", m.index!), m.index).replace(/^.*=\s*/, ""));
      if (!inImport && !inPattern) add(m.index!, "platform-query", what);
    }
  }
  for (const m of code.matchAll(/(["'`])([a-z0-9]+)\1/g)) if (PLATFORMS.has(m[2])) add(m.index!, "platform-literal", m[0]);
  // An identifier bound to a platform query or literal is found wherever it is used.
  let offset = 0;
  for (const line of code.split("\n")) {
    const m = /^\s*(?:const|let|var)\s+([\w$]+)\s*=\s*(.*)$/.exec(line);
    if (m) {
      const from = offset + line.indexOf(m[2]);
      if (raw.some((r) => r.index >= from && r.index < offset + line.length)) {
        const bound = offset + line.indexOf(m[1]);
        for (const u of code.matchAll(new RegExp(`(?<![.\\w$])${escape(m[1])}\\b`, "g"))) if (u.index !== bound) add(u.index!, "platform-query", m[1]);
      }
    }
    offset += line.length + 1;
  }
  const hostApis = [
    /\bshell\s*:\s*true\b/g,
    /\b(spawn|spawnSync|exec|execSync|execFile|execFileSync|fork|execute)\s*\(\s*["'`](cmd|cmd\.exe|[^"'`]*\.cmd|[^"'`]*\.bat|powershell|sh|\/bin\/sh|mkfifo)["'`]/g,
    /\b(chmod|chmodSync|mkdir|mkdirSync|writeFile|writeFileSync)\s*\([^)]*\b0o[0-7]+/g,
    /\bsymlink(Sync)?\s*\([^)]*["'](junction|dir|file)["']/g,
    /\bprocess\s*\.\s*(getuid|getgid|geteuid)\b/g,
    /\bprocess\s*\.\s*env\s*\.\s*(PATHEXT|ComSpec|SystemRoot|USERPROFILE|APPDATA|HOME)\b/g,
  ];
  for (const pattern of hostApis) for (const m of code.matchAll(pattern)) add(m.index!, "host-api", m[0]);
  for (const name of osNames) for (const m of code.matchAll(new RegExp(`\\b${escape(name)}\\s*\\.\\s*(homedir|userInfo)\\b`, "g"))) add(m.index!, "host-api", m[0]);
  if (/from\s*["'](node:)?net["']|require\(\s*["'](node:)?net["']\s*\)/.test(code)) for (const m of code.matchAll(/\.listen\s*\(\s*(?!\d)[^)]/g)) add(m.index!, "host-api", m[0]);
  return raw.sort((a, b) => a.index - b.index || (a.rule < b.rule ? -1 : a.rule > b.rule ? 1 : 0));
}

/**
 * Where the JavaScript and TypeScript sources among `files` couple to a
 * particular platform instead of leaving the host to Hosting (hosting/F27–
 * hosting/F30, hosting/F32). Each finding is evidence for review; this never
 * decides a pass or a fail, and never drops a finding. The same input always
 * yields the same report.
 */
export async function couplings(files: Files, options: CouplingOptions = {}): Promise<CouplingReport> {
  const test = options.test ?? isTest;
  const report: CouplingReport = { coverage: COUPLING_COVERAGE, exclusions: COUPLING_EXCLUSIONS, sources: [], skipped: [], findings: [] };
  for (const file of Object.keys(files).sort()) {
    if (DECLARATION.test(file)) {
      report.skipped.push({ file, reason: "a TypeScript declaration file" });
      continue;
    }
    if (!SOURCE.test(file)) {
      report.skipped.push({ file, reason: "not a JavaScript or TypeScript source" });
      continue;
    }
    const scope: Scope = test(file) ? "test" : "production";
    report.sources.push({ file, scope });
    const { code, comments } = strip(files[file].toString("utf8"));
    const parens = groups(code, "(", ")");
    const braces = groups(code, "{", "}");
    const seen = new Set<string>();
    for (const r of find(code)) {
      const key = `${r.index}:${r.rule}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { line, column } = position(code, r.index);
      const kind = scope === "production" ? "coupling" : classify(code, r.index, parens, braces);
      const comment = comments.find((c) => (c.line === line && c.trailing) || (c.line === line - 1 && !c.trailing));
      const reason = comment && /^\s*kaal-hosting:\s*platform\s+(\S.*?)\s*$/.exec(comment.text)?.[1];
      report.findings.push({ file, line, column, scope, rule: r.rule, kind, construct: r.construct, ...(reason ? { acknowledged: reason } : {}) });
    }
  }
  return report;
}
