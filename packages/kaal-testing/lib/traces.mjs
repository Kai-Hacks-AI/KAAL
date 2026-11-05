// kaal-testing/traces: Testing derives each Case's `tests →` relationship (testing/N7) from the Case's own
// declaration in its source file (testing/C48, testing/F84–testing/F88). The caller reads the files and gives them
// as plain data; this module never executes, reads or keeps anything. It imports only Testing's own model.
import { check, tested } from "./model.mjs";

/** The case locations, relative to a capability's root. testing/C45 removes the legacy entry (testing/F77). */
export const LOCATIONS = Object.freeze(["test/embed/", "test/engineer/", "test/plan/", "test/acceptance/"]);

const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const nonempty = (s) => typeof s === "string" && s !== "";
const before = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const ESCAPES = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", v: "\v", 0: "\0" };
const IDENTIFIER = /^(?:[\w-]+\/)?[A-Z]+\d+$/;
const KEYWORD_BEFORE_REGEX = new Set(["return", "typeof", "case", "in", "of", "delete", "void", "throw", "new", "instanceof", "yield", "await", "else", "do"]);

/** Where the string literal opening at `i` (a quote) ends: the index after its closing quote, with its value. */
function readString(text, i) {
  const quote = text[i];
  let value = "";
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (c === "\\") {
      const n = text[j + 1];
      value += Object.hasOwn(ESCAPES, n) ? ESCAPES[n] : (n ?? "");
      j++;
    } else if (c === quote) return { end: j + 1, value };
    else if (c === "\n" && quote !== "`") return { end: j, value, broken: true };
    else value += c;
  }
  return { end: text.length, value, broken: true };
}

/** The index after the template literal opening at `i`, and whether it has a substitution. */
function skipTemplate(text, i) {
  let substituted = false;
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (c === "\\") j++;
    else if (c === "`") return { end: j + 1, substituted };
    else if (c === "$" && text[j + 1] === "{") {
      substituted = true;
      j = skipBraces(text, j + 1) - 1;
    }
  }
  return { end: text.length, substituted };
}

/** The index after the `{ ... }` opening at `i`, skipping strings, templates and comments inside it. */
function skipBraces(text, i) {
  let depth = 0;
  for (let j = i; j < text.length; j++) {
    const c = text[j];
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return j + 1; }
    else if (c === '"' || c === "'") j = readString(text, j).end - 1;
    else if (c === "`") j = skipTemplate(text, j).end - 1;
    else if (c === "/" && text[j + 1] === "/") { const n = text.indexOf("\n", j); j = n < 0 ? text.length : n; }
    else if (c === "/" && text[j + 1] === "*") { const n = text.indexOf("*/", j + 2); j = n < 0 ? text.length : n + 1; }
  }
  return text.length;
}

/** The index after the regular expression literal opening at `i`. */
function skipRegex(text, i) {
  let inClass = false;
  for (let j = i + 1; j < text.length; j++) {
    const c = text[j];
    if (c === "\\") j++;
    else if (c === "\n") return j;
    else if (c === "[") inClass = true;
    else if (c === "]") inClass = false;
    else if (c === "/" && !inClass) return j + 1;
  }
  return text.length;
}

/**
 * Every case call in `text`: a call to `it(` or `test(` at the start of a line, in code. A call inside a string, a
 * template, a regular expression or a comment is not one, even where that spans lines (testing/F86). Each is
 * `{ literal, title }` where the first argument is a static string, or `{ literal: false }` where it is not.
 */
function calls(text) {
  const out = [];
  let lineStart = true;
  let previous = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === "\n") { lineStart = true; continue; }
    if (c === " " || c === "\t" || c === "\r") continue;
    if (c === "/" && text[i + 1] === "/") { const n = text.indexOf("\n", i); if (n < 0) break; i = n - 1; continue; }
    if (c === "/" && text[i + 1] === "*") {
      const n = text.indexOf("*/", i + 2);
      if (n < 0) break;
      if (text.slice(i, n).includes("\n")) lineStart = false;
      i = n + 1;
      continue;
    }
    const started = lineStart;
    lineStart = false;
    if (c === '"' || c === "'") { i = readString(text, i).end - 1; previous = '"'; continue; }
    if (c === "`") { i = skipTemplate(text, i).end - 1; previous = '"'; continue; }
    if (c === "/") {
      const regex = previous === "" || "(,=:[!&|?{};+-*%<>~^".includes(previous) || KEYWORD_BEFORE_REGEX.has(previous);
      if (regex) { i = skipRegex(text, i) - 1; previous = '"'; continue; }
      previous = "/";
      continue;
    }
    if (/[\w$]/.test(c)) {
      let j = i;
      while (j < text.length && /[\w$]/.test(text[j])) j++;
      const word = text.slice(i, j);
      if (started && (word === "it" || word === "test") && text[j] === "(") out.push(argument(text, j + 1));
      i = j - 1;
      previous = word;
      continue;
    }
    previous = c;
  }
  return out;
}

/** The first argument of the call whose parenthesis ends just before `i`, as a static title or not. */
function argument(text, i) {
  let j = i;
  while (j < text.length && /\s/.test(text[j])) j++;
  const c = text[j];
  if (c === '"' || c === "'") {
    const s = readString(text, j);
    return s.broken ? { literal: false } : { literal: true, title: s.value };
  }
  if (c === "`") {
    const t = skipTemplate(text, j);
    return t.substituted ? { literal: false } : { literal: true, title: readString(text, j).value };
  }
  return { literal: false };
}

/** Whether `file` is a case file in a case location: its path starts with one, and it ends in `.test.mjs`. */
const caseFile = (path) => typeof path === "string" && path.endsWith(".test.mjs") && LOCATIONS.some((l) => path.startsWith(l));

/**
 * The Cases a set of files declare, as Testing's model: `{ model, untraced, findings }`. A Case is a call to
 * `it(` or `test(` at the start of a line in a case file; its title's first bracket names its targets (testing/F84).
 * A title or target that cannot be read, or a Case declared twice, is a finding and traces nothing (testing/F86).
 */
export function derive(files, { owner } = {}) {
  const findings = [];
  const untraced = [];
  const declared = [];
  if (!Array.isArray(files)) return { model: { cases: [] }, untraced, findings: ["files is not a list of { path, text }"] };
  const valid = [];
  files.forEach((f, i) => {
    if (!plain(f) || !nonempty(f.path)) findings.push(`files[${i}] is not a { path, text }`);
    else if (!caseFile(f.path)) return;
    else if (f.text === null) findings.push(`${f.path}: the file could not be read, so its Cases are not known`);
    else if (typeof f.text !== "string") findings.push(`${f.path}: the file has no text`);
    else valid.push(f);
  });
  valid.sort((a, b) => before(a.path, b.path));
  for (const f of valid) {
    for (const call of calls(f.text)) {
      if (!call.literal) { findings.push(`${f.path}: a case title is not a static string`); continue; }
      const title = call.title;
      const m = /^((?:[\w-]+\/)?T\d+)(?=[\s\[:])/.exec(title);
      const open = title.indexOf("[");
      const close = open < 0 ? -1 : title.indexOf("]", open);
      const bracket = close < 0 ? null : [null, title.slice(open + 1, close)];
      if (!bracket) { untraced.push(`${f.path} > ${title}`); continue; }
      const own = m && m[1].includes("/") ? m[1].split("/")[0] : undefined;
      const scope = own ?? (nonempty(owner) ? owner : undefined);
      let id = title;
      let bad = false;
      if (m) {
        if (m[1].includes("/")) id = m[1];
        else if (scope) id = `${scope}/${m[1]}`;
        else { findings.push(`${f.path}: ${m[1]} is a bare Case identity with no owner to qualify it`); bad = true; }
      }
      const parts = bracket[1].split(",").map((s) => s.trim());
      const tests = [];
      if (bracket[1].trim() === "") { findings.push(`${f.path}: ${id} has an empty bracket`); bad = true; }
      else for (const part of parts) {
        if (!IDENTIFIER.test(part)) { findings.push(`${f.path}: ${id}: ${JSON.stringify(part)} is not an identifier`); bad = true; continue; }
        const target = part.includes("/") ? part : scope ? `${scope}/${part}` : undefined;
        if (!target) { findings.push(`${f.path}: ${id}: ${part} is a bare target with no owner to qualify it`); bad = true; continue; }
        if (tests.includes(target)) { findings.push(`${f.path}: ${id}: ${target} is named twice`); bad = true; continue; }
        tests.push(target);
      }
      if (!bad) declared.push({ id, tests, path: f.path });
    }
  }
  const byId = new Map();
  for (const d of declared) byId.set(d.id, [...(byId.get(d.id) ?? []), d.path]);
  const cases = [];
  for (const d of declared) {
    const where = byId.get(d.id);
    if (where.length > 1) continue;
    cases.push({ id: d.id, tests: d.tests });
  }
  for (const [id, where] of [...byId].sort(([a], [b]) => before(a, b))) if (where.length > 1) findings.push(`${id} is declared in ${[...new Set(where)].sort(before).join(" and ")}${new Set(where).size < where.length ? " (more than once)" : ""}`);
  cases.sort((a, b) => before(a.id, b.id));
  return { model: { cases }, untraced: untraced.sort(before), findings };
}

/** One `{ from, type: "tests", to }` per Case and target, ordered by Case, then target (testing/F87). */
export function edges(model) {
  const findings = check(model);
  if (findings.length) return { edges: [], findings };
  const out = [];
  for (const c of [...(model.cases ?? [])].sort((a, b) => before(a.id, b.id))) {
    if (c.retired) continue;
    for (const to of [...(c.tests ?? [])].sort(before)) out.push({ from: c.id, type: "tests", to });
  }
  return { edges: out, findings };
}

/** The Cases that test `target` in `model`, and `[]` for a target none tests. It is never proof of absence (testing/F88). */
export function incoming(model, target) {
  const t = tested(model);
  return Object.hasOwn(t, target) ? [...t[target]] : [];
}

/**
 * Whether the Cases that test `target` are established, from `derive`'s whole result (testing/F88): `established`
 * only when the inventory is complete, `unknown` otherwise, with the Cases found as a lower bound and the
 * findings and untraced Cases in full, for the caller to report.
 */
export function impact(derived, target) {
  const findings = [];
  const untraced = [];
  let model = null;
  if (!plain(derived) || !plain(derived.model) || !Array.isArray(derived.findings) || !Array.isArray(derived.untraced)) {
    findings.push("the inventory is not a result of derive");
  } else {
    model = derived.model;
    findings.push(...derived.findings.map(String));
    untraced.push(...derived.untraced.map(String));
    findings.push(...check(model));
  }
  if (typeof target !== "string") findings.push("the target is not a string");
  const cases = model && typeof target === "string" ? incoming(model, target) : [];
  const complete = model !== null && findings.length === 0 && untraced.length === 0;
  return { result: complete ? "established" : "unknown", cases, findings, untraced };
}
