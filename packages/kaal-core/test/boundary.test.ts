// Architecture boundary: Core leaves every host mechanic to Hosting. This is
// Core's own declaration and its own evidence, checked against the
// JavaScript Core ships with Hosting's generic conformance inspection.
// Mechanical findings fail here; what cannot be decided mechanically is
// listed for Agent or human validation, never taken as a pass.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { read, type Files } from "kaal-hosting";
import { EXCLUSIONS, inspect, type Expectation, type Validation } from "kaal-hosting/conformance";

/**
 * The host modules Core may import directly: the path and URL handling with
 * which Core names its own payload and the CLI names an Engine location.
 * Identity, hashing included, is Graph's. Everything else that touches the
 * host goes through kaal-hosting.
 */
const BOUNDARY: Expectation = { builtins: ["node:path", "node:url"] };

/**
 * Findings that need validation and have been judged, each with its reason.
 * A new one fails this suite until an Agent or a person has judged it and
 * recorded it here; a judged one that disappears fails too, so the list
 * stays exact.
 */
const VALIDATED: { file: string; construct: string; judgment: string }[] = [];

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const SRC = fileURLToPath(new URL("../src/", import.meta.url));

/**
 * The JavaScript Core ships: what npm packs from dist/. Graph's Node support delivered in
 * dist/node/ is Graph's code, byte-identical to Graph's source, and stays under Graph's boundary.
 */
async function shipped(): Promise<Files> {
  const all = await read(DIST);
  return Object.fromEntries(Object.entries(all).filter(([p]) => p.endsWith(".js")));
}

function judged(v: Validation[]): { file: string; construct: string }[] {
  return v.map(({ file, construct }) => ({ file, construct }));
}

describe("Core's Hosting boundary", () => {
  it("permitted: Core's shipped JavaScript imports no undeclared host module, and reaches the host otherwise only through kaal-hosting; its other imports are Graph's Node support delivered inside kaal-core, for Node mechanics and for reading frontmatter, and Foundation, for SHA-256", async () => {
    const files = await shipped();
    assert.ok(Object.keys(files).length >= 7);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(report.violations, []);
    assert.deepEqual([...new Set(report.outside.map((o) => o.specifier))].sort(), ["#node/form", "#node/node", "@kaihacksai/kaal-foundation/sha256", "kaal-hosting"]);
    assert.deepEqual(judged(report.validation), VALIDATED.map(({ file, construct }) => ({ file, construct })));
    // A clean result is evidence within the inspection's coverage, not proof of compliance.
    assert.ok(report.exclusions.length > 0 && report.exclusions === EXCLUSIONS);
  });

  it("prohibited: a host builtin Core does not declare fails verification, with its location", async () => {
    const files = await shipped();
    files["bootstrap.js"] = Buffer.concat([Buffer.from('import { readFileSync } from "node:fs";\n'), files["bootstrap.js"]]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(
      report.violations.map(({ file, line, builtin }) => ({ file, line, builtin })),
      [{ file: "bootstrap.js", line: 1, builtin: "node:fs" }],
    );
  });

  it("undecidable: host access the inspection cannot decide is reported for validation, never as a pass or a violation", async () => {
    const files = await shipped();
    files["register.js"] = Buffer.concat([files["register.js"], Buffer.from("\nexport const probe = (name) => [process.getBuiltinModule(name), import(name)];\n")]);
    const report = await inspect(files, BOUNDARY);
    assert.deepEqual(report.violations, []);
    assert.deepEqual(
      report.validation.map(({ file, construct }) => ({ file, construct })),
      [
        { file: "register.js", construct: "process.getBuiltinModule" },
        { file: "register.js", construct: "import(name)" },
      ],
    );
  });

  it("takes what a path is from Hosting's kind: no Core source reads it from a refusal or a host error code", () => {
    // Text, not imports: the inspection cannot see this, so Core checks its own sources.
    for (const p of readdirSync(SRC).filter((p) => p.endsWith(".ts"))) {
      assert.doesNotMatch(readFileSync(join(SRC, p), "utf8"), /"(NOT_FILE|MISSING|ENOENT|ENOTDIR|EISDIR|ELOOP|EACCES|EPERM)"/, p);
    }
  });

  it("depends at runtime on kaal-foundation, kaal-hosting and yaml alone, with Graph only for the build", () => {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    assert.deepEqual(pkg.dependencies, { "@kaihacksai/kaal-foundation": "0.0.1", "kaal-hosting": "0.0.1", yaml: "2.9.1" });
    assert.equal(pkg.devDependencies["kaal-graph"], "0.0.1");
  });
});
