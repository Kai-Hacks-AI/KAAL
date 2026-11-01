// Conformance evidence: Hosting's generic inspection of a consumer's
// JavaScript against the host modules the consumer declares. Fixtures are in
// memory; CI runs this suite on Linux, Windows and macOS.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { describe, it } from "node:test";
import { promisify } from "node:util";
import type { Files } from "@kaihacksai/kaal-hosting";
import { COVERAGE, EXCLUSIONS, inspect } from "@kaihacksai/kaal-hosting/conformance";

const run = promisify(execFile);

function files(entries: Record<string, string>): Files {
  return Object.fromEntries(Object.entries(entries).map(([p, s]) => [p, Buffer.from(s)]));
}

describe("inspect", () => {
  it("states in every report what it covers and what it excludes, and never a verdict", async () => {
    const report = await inspect(files({}), { builtins: [] });
    assert.deepEqual(Object.keys(report).sort(), ["coverage", "exclusions", "inspected", "outside", "skipped", "validation", "violations"]);
    assert.deepEqual(report.coverage, [
      "static import and export-from declarations in ES module JavaScript files (.js, .mjs)",
      "import() with a literal specifier",
      "Node builtins named with or without the node: prefix, including subpaths such as fs/promises",
      "import() with a computed specifier, process.getBuiltinModule, process.binding, process._linkedBinding, process.dlopen, eval and new Function, which are reported for validation",
    ]);
    assert.deepEqual(report.exclusions, [
      "host access through process, globalThis or other globals beyond the members reported for validation",
      "CommonJS: require and .cjs files",
      "native addons, WebAssembly, workers and other code loaded indirectly",
      "the host access of modules reported as outside",
      "TypeScript sources and declarations (.ts, .d.ts, .mts, .cts): inspect the JavaScript that runs",
      "whether relative imports resolve to the files given",
    ]);
    assert.equal(report.coverage, COVERAGE);
    assert.equal(report.exclusions, EXCLUSIONS);
    assert.ok(Object.isFrozen(COVERAGE) && Object.isFrozen(EXCLUSIONS));
  });

  it("compliant: finds no violation and nothing to validate when only declared builtins are imported, and lists what lies outside", async () => {
    const report = await inspect(
      files({
        "index.js": 'import { read } from "@kaihacksai/kaal-hosting";\nimport { join } from "node:path";\nimport { helper } from "./lib/helper.js";\nexport { helper };\n',
        "lib/helper.mjs": 'export const helper = () => import.meta.url;\n',
      }),
      { builtins: ["node:path"] },
    );
    assert.deepEqual(report.inspected, ["index.js", "lib/helper.mjs"]);
    assert.deepEqual(report.violations, []);
    assert.deepEqual(report.validation, []);
    assert.deepEqual(report.outside, [{ file: "index.js", line: 1, column: 23, specifier: "@kaihacksai/kaal-hosting" }]);
  });

  it("detectable violation: reports each undeclared host module with file, line, column, specifier and its node: name", async () => {
    const report = await inspect(
      files({
        "a.js": 'import { readFileSync } from "node:fs";\n',
        "b.js": 'export { readFile } from "fs/promises";\nconst cp = await import("child_process");\n',
      }),
      { builtins: [] },
    );
    assert.deepEqual(report.violations, [
      { file: "a.js", line: 1, column: 31, specifier: "node:fs", builtin: "node:fs" },
      { file: "b.js", line: 1, column: 27, specifier: "fs/promises", builtin: "node:fs/promises" },
      { file: "b.js", line: 2, column: 25, specifier: "child_process", builtin: "node:child_process" },
    ]);
    assert.deepEqual(report.validation, []);
  });

  it("needs validation: reports what may reach the host undecidably, never as a violation and never as a pass", async () => {
    const report = await inspect(
      files({
        "c.js": [
          "const name = process.env.MODULE;",
          "await import(name);",
          "await import(`node:${name}`);",
          "process.getBuiltinModule(name);",
          'eval("1");',
          'new Function("return 1");',
          "",
        ].join("\n"),
      }),
      { builtins: [] },
    );
    assert.deepEqual(report.violations, []);
    assert.deepEqual(
      report.validation.map((v) => [v.line, v.construct]),
      [
        [2, "import(name)"],
        [3, "import(`node:${name}`)"],
        [4, "process.getBuiltinModule"],
        [5, "eval("],
        [6, "new Function"],
      ],
    );
    for (const v of report.validation) assert.ok(v.reason.length > 0);
  });

  it("gives the same report for the same input, whatever order the files come in", async () => {
    const a = files({ "z.js": 'import "node:os";\nimport("x" + y);\n', "a.js": 'import "node:net";\n' });
    const b = Object.fromEntries(Object.entries(a).reverse());
    assert.deepEqual(await inspect(a, { builtins: [] }), await inspect(b, { builtins: [] }));
  });

  it("treats a builtin named with and without node: as one module, on either side", async () => {
    const source = files({ "a.js": 'import "fs";\nimport "node:path";\n' });
    assert.deepEqual((await inspect(source, { builtins: ["node:fs", "path"] })).violations, []);
    assert.deepEqual((await inspect(source, { builtins: ["fs"] })).violations.map((v) => v.builtin), ["node:path"]);
  });

  it("reads imports, not text: a builtin named in a comment or a string is no import", async () => {
    const report = await inspect(files({ "a.js": '// import "node:fs"\nconst s = "import(\'node:fs\')";\n/* require("fs") */\n' }), { builtins: [] });
    assert.deepEqual(report.violations, []);
    assert.deepEqual(report.validation, []);
  });

  it("names what it skipped, and asks for validation of a file it cannot read as a module", async () => {
    const report = await inspect(files({ "a.cjs": 'require("fs");', "a.d.ts": 'import "node:fs";', "a.ts": 'import "node:fs";', "broken.js": "import {" }), { builtins: [] });
    assert.deepEqual(report.inspected, ["broken.js"]);
    assert.deepEqual(report.skipped.map((s) => s.file), ["a.cjs", "a.d.ts", "a.ts"]);
    assert.deepEqual(report.violations, []);
    assert.equal(report.validation.length, 1);
    assert.equal(report.validation[0].file, "broken.js");
  });

  it("refuses an expectation naming something that is not a builtin", async () => {
    await assert.rejects(inspect(files({}), { builtins: ["yaml"] }), TypeError);
  });

  it("is loaded only by its own entry point: importing kaal-hosting loads no parser", async () => {
    const probe = [
      'import { registerHooks } from "node:module";',
      "const seen = [];",
      "registerHooks({ resolve(s, c, next) { seen.push(s); return next(s, c); } });",
      'await import("@kaihacksai/kaal-hosting");',
      "process.stdout.write(JSON.stringify(seen));",
    ].join("\n");
    const { stdout } = await run(process.execPath, ["--input-type=module", "-e", probe], { cwd: new URL(".", import.meta.url) });
    const seen: string[] = JSON.parse(stdout);
    assert.ok(seen.includes("@kaihacksai/kaal-hosting"));
    assert.ok(!seen.some((s) => s.includes("es-module-lexer") || s.includes("conformance")), seen.join(", "));
  });
});
