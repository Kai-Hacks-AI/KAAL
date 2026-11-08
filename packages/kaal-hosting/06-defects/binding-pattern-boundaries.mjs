// hosting/T143 to hosting/T165 and hosting/T167 to hosting/T172, hosting/T176 to hosting/T200: where `couplings` draws the line between a use of a platform query and a local
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
  ["T196", "the bound query read as an array element before a comma", "export const a = [host, 1];"],
  ["T197", "the bound query read as the true branch before a colon", 'export const a = flag ? host : "/";'],
  ["T198", "the bound query read as a shorthand property", "export const a = { host };"],
];
for (const [id, what, body] of finding) {
  test(`hosting/${id}: ${what} is a finding`, async () => {
    assert.equal((await found(body)) > 0, true);
  });
}

// A use outside the shadowing scope is still the import.
test("hosting/T184: a use beside a shadowing scope is still a finding", async () => {
  assert.equal(await found("function f() { const host = 1; }\nconst x = host();"), 1);
});

test("hosting/T185: a query destructured inside a function, and a parameter default beside a body var, are findings", async () => {
  assert.equal(await found('function f() { const { platform: host } = require("node:os"); return host(); }'.replace("import","")), 1);
  assert.equal(await found("function f(x = host()) { var host; }"), 1);
});

test("hosting/T186: a computed method name beside a same-named parameter is a finding", async () => {
  assert.equal(await found("const obj = { metadata: {}, [host()](host) {} };"), 1);
});

test("hosting/T187: a method decorator beside a same-named parameter is a finding", async () => {
  assert.equal(await found("class C {\n  @decorate(host())\n  m(host: string) {}\n}"), 1);
});

test("hosting/T189: a parameter decorator beside a same-named parameter is a finding", async () => {
  assert.equal(await found("class C { m(@decorate(host()) host: string) {} }"), 1);
});

test("hosting/T191: a decorator in a function that has a same-named parameter is local", async () => {
  assert.equal(await found("function f(host) { class C { @decorate(host()) m() {} } }"), 0);
});

test("hosting/T192: a query destructured in a block beneath a same-named parameter is a finding", async () => {
  assert.equal(await found('function f(host) { { const { platform: host } = require("node:os"); return host(); } }'), 1);
});

test("hosting/T193: a function declaration and a var that destructures the query share one binding", async () => {
  assert.equal(await found('function f() { function host() {} var { platform: host } = require("node:os"); return host(); }'), 1);
});

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
  ["T180", "a call to a local function of the same name", "function f() { const host = () => 1; return host(); }"],
  ["T181", "a reference to a parameter of the same name", "function f(host) { return host(); }"],
  ["T182", "a reference to a hoisted var and to a catch binding", "function f() { host(); var host = () => 1; }\nfunction g() { try {} catch (host) { host(); } }"],
  ["T183", "a reference to a loop binding and to a named function expression", "for (const host of list) { host(); }\nconst k = function host() { return host; };"],
  ["T188", "a var and its call inside a class static block", "class C { static { var host = () => 1; host(); } }"],
  ["T190", "a statement label and a break to it", "host: while (true) { break host; }"],
  ["T194", "a nested namespace and an enum named like the query", "namespace N { export namespace host { export const value = 1; } }\nenum Mode { A }\nenum host { B }"],
  ["T195", "an enum initializer that names a member of the same name", "enum E { host = 1, value = host + 1 }"],
  ["T199", "an object key and an import rename that only share the name", 'export const a = { host: 1 };\nexport { host as other };'],
  ["T177", "a nested function and a simple parameter of the same name", "function outer() { function host() {} }\nfunction g(host) {}"],
];
for (const [id, what, body] of local) {
  test(`hosting/${id}: ${what} declares a local binding and is not a finding`, async () => {
    assert.equal(await found(body), 0);
  });
}

test("hosting/T200: a CommonJS destructured query read before a comma or a colon is a finding", async () => {
  for (const tail of ['module.exports = [sep, "x"];', 'module.exports = flag ? sep : "/";']) {
    const r = await couplings({ "lib/a.cjs": `const { sep } = require("node:path");\n${tail}\n` });
    assert.equal(r.findings.filter((f) => f.scope === "production" && f.rule === "platform-query").length, 1, tail);
  }
});
