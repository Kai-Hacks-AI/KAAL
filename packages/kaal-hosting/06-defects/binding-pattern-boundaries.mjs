// hosting/T143 to hosting/T165 and hosting/T167 to hosting/T172, hosting/T176 to hosting/T179: where `couplings` draws the line between a use of a platform query and a local
// binding that only shares its name.
//
// These Cases are GREEN regression Cases for hosting/D8 and its review rounds. They run the real `couplings` from the
// built package over one production source each. An import binds `host` to `os.platform`. A use of `host` is a finding
// (hosting/F28) unless it is a binding the source declares itself: a destructuring pattern or a destructured parameter.
// "Findings" means the production findings of rule platform-query or host-api.
//
//   npm run build -w @kaihacksai/kaal-hosting
//   node --test packages/kaal-hosting/06-defects/binding-pattern-boundaries.mjs
//
// `couplings` decides these from the parsed syntax tree of the source (the TypeScript compiler API), not from the text
// around a name, so a layout that spans lines, a default value inside a pattern and an annotation are read as written.
import assert from "node:assert/strict";
import { test } from "node:test";
import { couplings } from "../dist/skills/kaal-hosting/scripts/couplings.js";

const IMPORT = 'import { platform as host } from "node:os";\n';

/** The production findings `couplings` reports for one ESM source that imports `host`. */
async function found(body) {
  const r = await couplings({ "lib/a.mjs": IMPORT + body + "\n" });
  return r.findings.filter((f) => f.scope === "production" && (f.rule === "platform-query" || f.rule === "host-api")).length;
}

const finding = [
  ["T143", "an object literal that holds a completed nested object before the query", "const config = { metadata: {}, platform: host() };"],
  ["T144", "an object literal in a default argument", "function f(options = { metadata: {}, platform: host() }) {}"],
  ["T145", "an object literal in a default argument nested in another function", "function outer() { function f(options = { metadata: {}, platform: host() }) {} }"],
  ["T146", "a one-line arrow body", "export const f = () => { return host(); };"],
  ["T147", "an object literal that holds an arrow function", "const o = { f: () => { return host(); } };"],
  ["T148", "a call argument that is an object", "g({ p: host() });"],
  ["T149", "an object after a quoted brace", 'const o = { a: "}", p: host() };'],
  ["T150", "a call in a block after a call with two arguments", "while (g({ a: host() }, x)) { y(); }"],
  ["T159", "an object literal used as a control-flow condition", "if ({ metadata: {}, platform: host() }) {}"],
  ["T160", "an object in an array literal", "const a = [{ p: host() }];"],
  ["T168", "a platform query written as a default inside a destructuring pattern", "const { a = host() } = x;"],
  ["T163", "an object literal after a default-expression operator", "function f(options = fallback || { metadata: {}, platform: host() }) {}"],
  ["T164", "an object literal in a conditional default", "function f(options = flag ? { metadata: {}, platform: host() } : {}) {}"],
];
for (const [id, what, body] of finding) {
  test(`hosting/${id}: ${what} is a finding`, async () => {
    assert.equal((await found(body)) > 0, true);
  });
}

const local = [
  ["T151", "a destructured parameter followed by another destructured parameter", 'function f({ host = "default" }, {}) {}'],
  ["T152", "a destructured parameter followed by a callback default", 'function f({ host = "default" }, cb = () => {}) {}'],
  ["T153", "a destructured arrow parameter", 'const f = ({ host = "default" }) => {};'],
  ["T154", "a destructured second parameter", 'function f(arg, { host = "default" }) {}'],
  ["T155", "a destructured parameter with a quoted brace default", 'function f({ host = "}" }) {}'],
  ["T156", "a destructured parameter with a regular-expression default", "function f({ host = /}/ }) {}"],
  ["T157", "a destructured parameter with type annotations", 'function f({ host = "d" }: Options): void {}'],
  ["T158", "a destructuring declaration inside a one-line block", 'function f() { const { host = "default" } = settings; }'],
  ["T161", "an object binding nested in an array pattern", 'const [{ host = "default" }] = settings;'],
  ["T162", "an object binding nested in an array parameter", 'function f([{ host = "default" }]) {}'],
  ["T165", "a destructured parameter followed by a callback default whose body has statements", 'function f({ host = "default" }, cb = () => { return 1; }) {}'],
  ["T167", "a destructured parameter that spans several lines", 'function f({\n  host = "default",\n}) {}'],
  ["T169", "the name inside a string literal", 'const mode = "host";'],
  ["T170", "an optional member of a type alias", "type Options = { host?: string };"],
  ["T171", "an optional member of an interface and of an inline parameter type", "interface O { host?: string; run?(): void }\nfunction f(o: { host?: string }) {}"],
  ["T172", "a type query that names the binding", "let x: typeof host;"],
  ["T176", "an ordinary local declaration of the same name", 'function f() { const host = "default"; }'],
  ["T178", "a local type alias and an annotation that uses it", "function f() { type host = string; let value: host[]; }"],
  ["T179", "an implements clause naming the same name", "function f() { interface host {} function g() { class C implements host {} } }"],
  ["T177", "a nested function and a simple parameter of the same name", "function outer() { function host() {} }\nfunction g(host) {}"],
];
for (const [id, what, body] of local) {
  test(`hosting/${id}: ${what} declares a local binding and is not a finding`, async () => {
    assert.equal(await found(body), 0);
  });
}
