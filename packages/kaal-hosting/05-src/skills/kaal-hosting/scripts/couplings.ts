import ts from "typescript";
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

let parsedCode: string | undefined;
let parsedFile: ts.SourceFile | undefined;

/** The source parsed once for a run of findings in the same file. */
function parsedSource(code: string): ts.SourceFile {
  if (parsedCode !== code || !parsedFile) {
    parsedFile = ts.createSourceFile("source.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    parsedCode = code;
  }
  return parsedFile;
}

/** Whether a branch of a conditional is a test registration: `it`, `test`, `describe` or `suite`, or a member of one such as `it.skip`. */
function isRegistration(node: ts.Expression): boolean {
  let e: ts.Expression = node;
  for (;;) {
    if (ts.isParenthesizedExpression(e) || ts.isNonNullExpression(e)) e = e.expression;
    else if (ts.isPropertyAccessExpression(e) || ts.isElementAccessExpression(e)) e = e.expression;
    else break;
  }
  return ts.isIdentifier(e) && /^(it|test|describe|suite)$/.test(e.text);
}

/** Whether the offset lies in the condition of a conditional expression that picks a test registration on either branch. */
function picksRegistration(code: string, at: number): boolean {
  const file = parsedSource(code);
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found || at < node.pos || at > node.end) return;
    if (ts.isConditionalExpression(node) && at >= node.condition.getStart(file) && at < node.condition.end && (isRegistration(node.whenTrue) || isRegistration(node.whenFalse))) found = true;
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

/** What a platform finding in test code decides (hosting/F29). */
function classify(code: string, at: number, parens: [number, number][], braces: [number, number][]): FindingKind {
  // In a skip, todo or only option.
  if (/(skip|todo|only)\s*:\s*[^,}]*$/.test(code.slice(Math.max(0, at - 80), at))) return "registration";
  // In a conditional expression that picks a test registration on either side,
  // such as `(WINDOWS ? () => {} : it)(…)` (hosting/F40).
  const start = Math.max(code.lastIndexOf(";", at), code.lastIndexOf("\n", at)) + 1;
  if (/\?\s*(it|test|describe|suite)\b[^:]*:|\?[^:]*:\s*(it|test|describe|suite)\b/.test(rest(code, start))) return "registration";
  // The same, however the expression is laid out: its branches may sit on lines after the condition (hosting/D10).
  if (picksRegistration(code, at)) return "registration";
  // In an if condition: what its branches do.
  for (const [open, close] of parens) {
    if (!(open < at && at < close && /\bif\s*$/.test(code.slice(Math.max(0, open - 6), open)))) continue;
    let k = close + 1;
    while (/\s/.test(code[k] ?? "")) k++;
    let body: string;
    let controlled = false;
    if (code[k] === "{") {
      const group = braces.find(([s]) => s === k);
      const end = group ? group[1] + 1 : code.length;
      body = code.slice(k, end);
      const otherwise = /^\s*else\s*/.exec(code.slice(end));
      if (otherwise) {
        const s = end + otherwise[0].length;
        const next = braces.find(([o]) => o === s);
        if (next) body += code.slice(s, next[1] + 1);
        else {
          // An unbraced alternative is bounded to its own statement.
          const alternative = rest(code, s);
          body += alternative.slice(0, firstStatement(maskLiterals(alternative)).length);
        }
      }
    } else {
      body = rest(code, k);
      controlled = true;
    }
    if (REGISTRATION.test(body) || returnsFromBranch(body, controlled) || leavesScope(controlled ? firstStatement(maskLiterals(body)) : body)) return "registration";
    if (/\bassert\b|\bexpect\s*\(/.test(body)) return "dilution";
    return "setup";
  }
  // In an assertion's arguments.
  for (const [open, close] of parens) if (open < at && at < close && ASSERTION.test(code.slice(Math.max(0, open - 200), open))) return "dilution";
  return "setup";
}

/**
 * The controlled statement of an unbraced branch: `text` up to the first semicolon outside any bracket or the closing brace of a compound statement, continuing
 * through an `else` so the alternative branch is still included, and no further, so a statement after the branch is not
 * taken for part of it. `text` has its literals masked.
 */
function firstStatement(text: string): string {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "(" || c === "{" || c === "[") depth++;
    else if (c === ")" || c === "}" || c === "]") {
      depth--;
      // A compound statement ends at its closing brace, unless an else follows.
      if (c === "}" && depth <= 0 && !/^\s*else\b/.test(text.slice(i + 1))) return text.slice(0, i + 1);
    }
    else if (c === ";" && depth <= 0 && !/^\s*else\b/.test(text.slice(i + 1))) return text.slice(0, i + 1);
  }
  return text;
}

/** Whether `text`, which ends with ")", ends with the parenthesised condition of an if, while, for or with. */
function closesCondition(text: string): boolean {
  let depth = 0;
  for (let k = text.length - 1; k >= 0; k--) {
    if (text[k] === ")") depth++;
    else if (text[k] === "(" && --depth === 0) return /\b(if|while|for|with)\s*$/.test(text.slice(0, k));
  }
  return false;
}

/**
 * `text` with the contents of string, template and regular-expression literals blanked, offsets kept, so a quoted
 * brace, parenthesis or "return" is not read as code. A slash opens a regular expression where an expression may
 * begin (after an operator, an opening bracket, a separator or a keyword) and is a division after an operand.
 */
function maskLiterals(text: string): string {
  const out = text.split("");
  const blank = (from: number, to: number) => {
    for (let k = from; k < to; k++) if (out[k] !== "\n") out[k] = " ";
  };
  for (let i = 0; i < text.length; ) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === "\\" ? 2 : 1;
      blank(i + 1, Math.min(j, text.length));
      i = j + 1;
    } else if (c === "/" && text[i + 1] !== "/" && text[i + 1] !== "*") {
      const before = text.slice(0, i).trimEnd();
      const word = /([\w$]+)$/.exec(before)?.[1];
      // A slash after the closing parenthesis of an if, while, for or with condition starts a statement, so it opens a regular expression.
      const maskedBefore = out.slice(0, i).join("").trimEnd();
      const afterCondition = maskedBefore.endsWith(")") && closesCondition(maskedBefore);
      const begins = afterCondition || before === "" || /[(,=:[!&|?{};+\-*%<>~^]$/.test(before) || (word !== undefined && /^(return|typeof|case|in|of|void|delete|throw|new|yield|await|else|do)$/.test(word));
      if (!begins) {
        i++;
        continue;
      }
      let j = i + 1;
      let inClass = false;
      while (j < text.length && text[j] !== "\n" && (inClass || text[j] !== "/")) {
        if (text[j] === "\\") j++;
        else if (text[j] === "[") inClass = true;
        else if (text[j] === "]") inClass = false;
        j++;
      }
      blank(i + 1, Math.min(j, text.length));
      i = j + 1;
    } else i++;
  }
  return out.join("");
}

const CONTROL = new Set(["if", "for", "while", "switch", "catch", "with"]);

/**
 * Whether `text` returns from the code around it. Only a `return` that no function can enclose counts: it must sit
 * directly in the branch or in nested control-flow blocks (if, else, for, while, do, switch, try, catch, finally, a
 * case clause or a bare block). Every other brace, whatever it is (a function, method, accessor, class, object
 * literal or type, in any syntax), is not control flow and is blanked with its contents, so no function signature
 * has to be recognised. String and regular-expression literals are blanked first.
 */
function returnsFromBranch(text: string, unbraced = false): boolean {
  let masked = maskLiterals(text);
  if (unbraced) masked = firstStatement(masked);
  const parens = groups(masked, "(", ")");
  const chars = masked.split("");
  // A brace group that follows the close of a non-control group (an object type before a function body, for example)
  // continues an expression, not a statement.
  const expression = new Set<number>();
  for (const [open, close] of groups(masked, "{", "}").sort((x, y) => x[0] - y[0])) {
    const before = masked.slice(0, open).trimEnd();
    let control = before === "" || /[;{]$/.test(before) || (before.endsWith("}") && !expression.has(before.length - 1)) || /(?<![\w$.])(else|try|finally|do)$/.test(before) || /\b(case\b[^;{}]*|default)\s*:$/.test(before);
    if (!control && before.endsWith(")")) {
      const at = parens.find(([, c]) => c === before.length - 1);
      const name = at && /([\w$]+)\s*$/.exec(masked.slice(0, at[0]));
      control = !!name && CONTROL.has(name[1]);
    }
    if (!control) {
      expression.add(close);
      for (let i = open; i <= close; i++) chars[i] = " ";
    }
  }
  return /(?<![\w$])(?<!\.\s*)return\b(?!\s*:)/.test(chars.join(""));
}

/**
 * How a statement leaves the scope it is in (hosting/D12, hosting/D14): by a return (`returns`), by a
 * `process.exit()` (`exits`: it ends the process, so no finally block runs),
 * or by a throw that no try with a catch handler inside the statement handles (`throws`). Decided on the parsed tree,
 * outside nested functions and classes (a registered callback leaves only itself).
 */
export function exitKinds(text: string): { returns: boolean; throws: boolean; exits: boolean } {
  const file = ts.createSourceFile("guard.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const kinds = { returns: false, throws: false, exits: false };
  const visit = (node: ts.Node, caught: boolean): void => {
    if (ts.isFunctionLike(node) || ts.isClassLike(node)) return;
    if (ts.isReturnStatement(node)) kinds.returns = true;
    else if (ts.isCallExpression(node) && /^process\s*\.\s*exit$/.test(node.expression.getText(file))) kinds.exits = true;
    else if (ts.isThrowStatement(node) && !caught) kinds.throws = true;
    if (ts.isTryStatement(node)) {
      visit(node.tryBlock, caught || node.catchClause !== undefined);
      if (node.catchClause) visit(node.catchClause.block, caught);
      if (node.finallyBlock) visit(node.finallyBlock, caught);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, caught));
  };
  visit(file, false);
  return kinds;
}

/** Whether a statement leaves the scope it is in, by any means (`exitKinds`). */
export function leavesScope(text: string): boolean {
  const kinds = exitKinds(text);
  return kinds.returns || kinds.throws || kinds.exits;
}

/**
 * Where the registrations skipped by a leaving guard end (hosting/D13): the end of the function the guard at `position`
 * is in, however deep in blocks it sits, or of the module. A throw that an enclosing try with a catch handler inside
 * that function catches leaves only that try block, so it ends there. The finally blocks of the tries the guard sits in
 * still run (a process exit runs none); the catch handler a return bypasses, the other branch of an enclosing if and
 * the other clauses of an enclosing switch are not reached from the guard. Those ranges are returned to be left out. Decided on the parsed tree.
 */
export function scopeEnd(file: ts.SourceFile, position: number, kinds: { returns: boolean; throws: boolean; exits: boolean }): { end: number; runs: Array<[number, number]> } {
  const chain: ts.Node[] = [];
  const descend = (node: ts.Node): void => {
    chain.push(node);
    ts.forEachChild(node, (child) => {
      if (child.getStart(file) <= position && position < child.getEnd()) {
        descend(child);
        return true;
      }
      return undefined;
    });
  };
  descend(file);
  let caught: number | undefined;
  const runs: Array<[number, number]> = [];
  for (let i = chain.length - 1; i > 0; i--) {
    const node = chain[i];
    if (ts.isTryStatement(node)) {
      if (node.catchClause && chain[i + 1] === node.tryBlock && caught === undefined) caught = node.tryBlock.getEnd();
      if (!kinds.exits && node.finallyBlock && (chain[i + 1] === node.tryBlock || chain[i + 1] === node.catchClause)) runs.push([node.finallyBlock.getStart(file), node.finallyBlock.getEnd()]);
      // A return from the try block does not enter its catch handler (a throw does, and a process exit runs nothing).
      if (kinds.returns && !kinds.throws && !kinds.exits && node.catchClause && chain[i + 1] === node.tryBlock) runs.push([node.catchClause.getStart(file), node.catchClause.getEnd()]);
    }
    // The other clauses of an enclosing switch are reached by matching, not by passing the guard.
    if ((ts.isCaseClause(node) || ts.isDefaultClause(node)) && ts.isCaseBlock(node.parent)) {
      // A clause that does not end in break, return, throw or continue falls into the next one, which the guard is then on the way to.
      const clauses = node.parent.clauses;
      const reached = new Set<ts.Node>([node]);
      for (let k = clauses.indexOf(node); k + 1 < clauses.length; k++) {
        let last: ts.Statement | undefined = clauses[k].statements[clauses[k].statements.length - 1];
        while (last && ts.isBlock(last)) last = last.statements[last.statements.length - 1];
        if (last && (ts.isBreakStatement(last) || ts.isReturnStatement(last) || ts.isThrowStatement(last) || ts.isContinueStatement(last))) break;
        reached.add(clauses[k + 1]);
      }
      for (const clause of clauses) if (!reached.has(clause)) runs.push([clause.getStart(file), clause.getEnd()]);
    }
    // The other branch of an enclosing if is never reached from the guard.
    if (ts.isIfStatement(node)) {
      const sibling = chain[i + 1] === node.thenStatement ? node.elseStatement : chain[i + 1] === node.elseStatement ? node.thenStatement : undefined;
      if (sibling) runs.push([sibling.getStart(file), sibling.getEnd()]);
    }
    const body = ts.isFunctionLike(node) ? (node as ts.FunctionLikeDeclaration).body : undefined;
    if (body) return { end: kinds.returns || kinds.exits ? body.getEnd() : (caught ?? body.getEnd()), runs };
  }
  return { end: kinds.returns || kinds.exits ? file.getEnd() : (caught ?? file.getEnd()), runs };
}

interface Raw {
  index: number;
  rule: Rule;
  construct: string;
  /** The offset of the declaration that binds the identifier this hit is a later use of (scan only). */
  via?: number;
}

/** Every platform finding in `code`, unclassified. */
function find(code: string, scanning: boolean): Raw[] {
  const raw: Raw[] = [];
  const add = (index: number, rule: Rule, construct: string, via?: number) => raw.push({ index, rule, construct, ...(via === undefined ? {} : { via }) });
  const osNames = new Set(["os"]);
  const pathNames = new Set(["path"]);
  const queries = new Map<string, string>();
  // Where a name bound by destructuring `process` is declared, so a later use can be a reference to that finding (scan only).
  const declared = new Map<string, number>();
  for (const m of code.matchAll(/import\s+(?:\*\s+as\s+)?([\w$]+)\s+from\s+["'](node:)?(os|path)["']/g)) (m[3] === "os" ? osNames : pathNames).add(m[1]);
  for (const m of code.matchAll(/(?:const|let|var)\s+([\w$]+)\s*=\s*require\(\s*["'](node:)?(os|path)["']\s*\)/g)) (m[3] === "os" ? osNames : pathNames).add(m[1]);
  // A destructuring binds the same queries as a named import: from the module itself, or from a name bound to it above.
  const destructured = (parts: string, module: "os" | "path") => {
    for (const part of parts.split(",")) {
      // A default initializer (`sep = "/"`, `sep: separator = "/"`) is not part of the name or the local binding.
      const [name, alias] = part.replace(/=[^]*$/, "").trim().split(/\s*:\s*/);
      if ((module === "os" ? OS_QUERIES : PATH_QUERIES).includes(name)) queries.set(alias ?? name, `${module}.${name}`);
    }
  };
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=\s*require\(\s*["'](node:)?(os|path)["']\s*\)/g)) destructured(m[1], m[3] as "os" | "path");
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([^}]*)\}\s*=\s*([\w$]+)\s*[;\n]/g)) {
    if (osNames.has(m[2])) destructured(m[1], "os");
    if (pathNames.has(m[2])) destructured(m[1], "path");
  }
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
      declared.set(alias ?? name, m.index! + m[0].indexOf(name));
      add(m.index! + m[0].indexOf(name), "platform-query", `process.${name}`);
    }
  }
  for (const m of code.matchAll(/\bprocess\s*\.\s*(platform|arch)\b/g)) add(m.index!, "platform-query", m[0]);
  for (const name of osNames) {
    for (const m of code.matchAll(new RegExp(`\\b${escape(name)}\\s*\\.\\s*(platform|type|arch|release|version)\\s*\\(|\\b${escape(name)}\\s*\\.\\s*EOL\\b`, "g"))) add(m.index!, "platform-query", m[0].replace(/\s*\($/, "()"));
  }
  for (const name of pathNames) for (const m of code.matchAll(new RegExp(`\\b${escape(name)}\\s*\\.\\s*(sep|delimiter|win32|posix)\\b`, "g"))) add(m.index!, "platform-query", m[0]);
  // A use of a bound query is an identifier that is not a declaration. The source is parsed, so what counts as a
  // declaration (an import, a binding pattern in a declaration or a parameter, a property name) does not depend on
  // how the source is laid out, and a default value inside a pattern is read as the use it is (hosting/D8).
  const uses = queries.size > 0 ? identifierUses(code, [...queries.keys()]) : new Map<string, number[]>();
  for (const [name, what] of queries) {
    for (const at of uses.get(name) ?? []) add(at, "platform-query", what, scanning ? declared.get(name) : undefined);
  }
  for (const m of code.matchAll(/(["'`])([a-z0-9]+)\1/g)) if (PLATFORMS.has(m[2])) add(m.index!, "platform-literal", m[0]);
  // An identifier bound to a platform query or literal is found wherever it is used.
  let offset = 0;
  for (const line of code.split("\n")) {
    // A scan also follows a binding that is exported; the gating consumers keep the narrower reading.
    const m = (scanning ? /^\s*(?:export\s+)?(?:const|let|var)\s+([\w$]+)\s*=\s*(.*)$/ : /^\s*(?:const|let|var)\s+([\w$]+)\s*=\s*(.*)$/).exec(line);
    if (m) {
      const from = offset + line.indexOf(m[2]);
      if (raw.some((r) => r.index >= from && r.index < offset + line.length)) {
        const bound = offset + line.indexOf(m[1]);
        for (const u of code.matchAll(new RegExp(`(?<![.\\w$])${escape(m[1])}\\b`, "g"))) if (u.index !== bound) add(u.index!, "platform-query", m[1], scanning ? bound : undefined);
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
  return collect(files, options, false);
}

/** A finding with, in a scan, the line of the declaration whose bound identifier it is a later use of. */
export interface Hit extends Finding {
  via?: number;
}

/** The report of `scanHits`: findings that carry `via`. */
export interface HitReport extends Omit<CouplingReport, "findings"> {
  findings: Hit[];
}

/**
 * The hits a Boundary Check scan groups (hosting/F66, hosting/A28): the findings of `couplings`, plus the
 * binding line of each later use of a bound identifier, and a binding that is exported. `couplings` itself
 * never changes: the gating consumers keep every raw finding at every use site.
 */
export async function scanHits(files: Files, options: CouplingOptions = {}): Promise<HitReport> {
  return collect(files, options, true);
}

async function collect(files: Files, options: CouplingOptions, scanning: boolean): Promise<HitReport> {
  const test = options.test ?? isTest;
  const report: HitReport = { coverage: COUPLING_COVERAGE, exclusions: COUPLING_EXCLUSIONS, sources: [], skipped: [], findings: [] };
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
    for (const r of find(code, scanning)) {
      const key = `${r.index}:${r.rule}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const { line, column } = position(code, r.index);
      const kind = scope === "production" ? "coupling" : classify(code, r.index, parens, braces);
      const comment = comments.find((c) => (c.line === line && c.trailing) || (c.line === line - 1 && !c.trailing));
      const reason = comment && /^\s*kaal-hosting:\s*platform\s+(\S.*?)\s*$/.exec(comment.text)?.[1];
      report.findings.push({ file, line, column, scope, rule: r.rule, kind, construct: r.construct, ...(reason ? { acknowledged: reason } : {}), ...(r.via === undefined ? {} : { via: position(code, r.via).line }) });
    }
  }
  return report;
}

/** Whether an identifier is a name the source declares, or a name that is not a reference at all. */
function declaresOrNames(node: ts.Identifier): boolean {
  const parent = node.parent;
  // An import binds the name; a binding pattern in a declaration or a parameter declares a local one, and its
  // property name is a key.
  for (let n: ts.Node | undefined = parent; n; n = n.parent) {
    // A type position never runs: a type annotation, a type alias, an interface, `typeof host` in a type. A class `extends` clause is an
    // expression and does run; an `implements` clause is erased.
    if (ts.isImportDeclaration(n) || ts.isImportEqualsDeclaration(n) || ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n)) return true;
    if (ts.isExpressionWithTypeArguments(n)) {
      if (ts.isHeritageClause(n.parent) && n.parent.token === ts.SyntaxKind.ImplementsKeyword) return true;
    } else if (ts.isTypeNode(n)) return true;
  }
  if (ts.isBindingElement(parent) && (parent.name === node || parent.propertyName === node)) return true;
  // An ordinary declaration of the same name (a variable, parameter, function or class) declares; it does not query.
  if ((ts.isVariableDeclaration(parent) || ts.isParameter(parent) || ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isClassDeclaration(parent) || ts.isClassExpression(parent) || ts.isModuleDeclaration(parent) || ts.isEnumDeclaration(parent)) && parent.name === node) return true;
  // A property name is not a reference to the binding: `a.host`, `{ host: 1 }`, a method or member name.
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return true;
  if (ts.isQualifiedName(parent) && parent.right === node) return true;
  if ((ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent) || ts.isPropertyDeclaration(parent) || ts.isPropertySignature(parent) || ts.isMethodSignature(parent) || ts.isGetAccessorDeclaration(parent) || ts.isSetAccessorDeclaration(parent) || ts.isEnumMember(parent)) && parent.name === node) return true;
  if ((ts.isLabeledStatement(parent) || ts.isBreakOrContinueStatement(parent)) && parent.label === node) return true;
  if (ts.isExportSpecifier(parent) || ts.isNamespaceExport(parent) || ts.isNamespaceImport(parent)) return true;
  return false;
}

/** Which declarations of a name a scope check looks for: a local one that shadows a query, or the query binding itself. */
type Declares = "local" | "query";

/** Whether a binding name or pattern declares `name`, as a local binding or as the query binding itself. */
function bindsName(target: ts.BindingName, name: string, mode: Declares): boolean {
  if (ts.isIdentifier(target)) return mode === "local" && target.text === name;
  return target.elements.some((e) => {
    if (ts.isOmittedExpression(e)) return false;
    if (bindsQuery(e)) return mode === "query" && ts.isIdentifier(e.name) && e.name.text === name;
    return bindsName(e.name, name, mode);
  });
}

/** Whether a binding element is itself a query binding: a platform query destructured from a module, `process` or a name bound to one. */
function bindsQuery(element: ts.BindingElement): boolean {
  const pattern = element.parent;
  if (!ts.isObjectBindingPattern(pattern) || !ts.isVariableDeclaration(pattern.parent)) return false;
  const key = element.propertyName ?? element.name;
  if (!ts.isIdentifier(key) || ![...OS_QUERIES, ...PATH_QUERIES].includes(key.text)) return false;
  const init = pattern.parent.initializer;
  if (!init) return false;
  return ts.isIdentifier(init) || (ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === "require");
}

/** Whether a `var` declaration of `name` sits in a function body, outside nested functions (it hoists to the function). */
function hoistsVar(node: ts.Node, name: string, mode: Declares): boolean {
  if (ts.isVariableDeclarationList(node) && !(node.flags & ts.NodeFlags.BlockScoped) && node.declarations.some((d) => bindsName(d.name, name, mode))) return true;
  let found = false;
  ts.forEachChild(node, (child) => {
    if (!found && !ts.isFunctionLike(child) && !ts.isClassLike(child)) found = hoistsVar(child, name, mode);
  });
  return found;
}

/** Whether a statement list declares `name` in block scope: let, const, a function, a class or an enum. */
function declaresInBlock(statements: ts.NodeArray<ts.Statement>, name: string, mode: Declares): boolean {
  return statements.some((st) => {
    if (ts.isVariableStatement(st)) return !!(st.declarationList.flags & ts.NodeFlags.BlockScoped) && st.declarationList.declarations.some((d) => bindsName(d.name, name, mode));
    if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isEnumDeclaration(st)) return mode === "local" && st.name?.text === name;
    return false;
  });
}

/** Whether one lexical scope `n` declares `name` for a use at `node`. `skip` is the declaration whose decorator the use sits in. */
function scopeDeclares(n: ts.Node, node: ts.Identifier, name: string, mode: Declares, skip: ts.Node | undefined): boolean {
  // Only the parameters and the body see a function's own bindings; a computed name or a decorator runs in the enclosing scope.
  const inside = (part: ts.Node | undefined) => !!part && node.pos >= part.pos && node.end <= part.end;
  if (ts.isClassStaticBlockDeclaration(n)) return inside(n.body) && hoistsVar(n.body, name, mode);
  if (ts.isFunctionLike(n)) {
    if (n === skip || !(inside((n as ts.FunctionLikeDeclaration).body) || n.parameters.some(inside))) return false;
    if (n.parameters.some((p) => bindsName(p.name, name, mode))) return true;
    if (mode === "local" && ts.isFunctionExpression(n) && n.name?.text === name) return true;
    // A body-level `var` does not reach a parameter default: only a use inside the body resolves to it.
    const body = (n as ts.FunctionLikeDeclaration).body;
    return !!body && inside(body) && hoistsVar(body, name, mode);
  }
  // A function declaration and a `var` of one name in a function body are one binding: the query destructured into it wins.
  if (ts.isBlock(n) && mode === "query" && ts.isFunctionLike(n.parent) && hoistsVar(n, name, mode)) return true;
  if (ts.isBlock(n) || ts.isModuleBlock(n)) return declaresInBlock(n.statements, name, mode);
  if (ts.isCaseBlock(n)) return n.clauses.some((c) => declaresInBlock(c.statements, name, mode));
  if (ts.isForStatement(n) || ts.isForInStatement(n) || ts.isForOfStatement(n)) {
    const init = n.initializer;
    return !!init && ts.isVariableDeclarationList(init) && !!(init.flags & ts.NodeFlags.BlockScoped) && init.declarations.some((d) => bindsName(d.name, name, mode));
  }
  // An enum's members are in scope inside the enum, so an initializer naming one refers to it.
  if (ts.isEnumDeclaration(n)) return mode === "local" && inside(n) && n.members.some((m) => (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name)) && m.name.text === name && !inside(m.name));
  if (ts.isCatchClause(n)) return !!n.variableDeclaration && bindsName(n.variableDeclaration.name, name, mode);
  return mode === "local" && ts.isClassExpression(n) && n.name?.text === name;
}

/** Whether the nearest lexical scope that declares `name` between a use and the top of the source declares something other than the query. */
function shadowed(node: ts.Identifier): boolean {
  const name = node.text;
  // A decorator expression runs in the scope around the declaration it decorates: that declaration's own bindings do not apply to it.
  let skip: ts.Node | undefined;
  for (let n: ts.Node | undefined = node.parent; n && !ts.isSourceFile(n); n = n.parent) {
    if (ts.isDecorator(n) && skip === undefined) skip = ts.isParameter(n.parent) ? n.parent.parent : n.parent;
    if (scopeDeclares(n, node, name, "query", skip)) return false;
    if (scopeDeclares(n, node, name, "local", skip)) return true;
  }
  return false;
}

/** The offsets of each name's uses in a source: every identifier of that name that is neither a declaration nor a property name. */
function identifierUses(code: string, names: string[]): Map<string, number[]> {
  const wanted = new Set(names);
  const out = new Map<string, number[]>();
  const file = ts.createSourceFile("source.ts", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && wanted.has(node.text) && !declaresOrNames(node) && !shadowed(node)) {
      // A key, a listed name or a rename is a declaration or a property name and `declaresOrNames` has dropped it; every other identifier is a read.
      (out.get(node.text) ?? out.set(node.text, []).get(node.text)!).push(node.getStart(file));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}
