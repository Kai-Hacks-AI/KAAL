// core/C26 Code tests: a Registration Node passes `verify`, and `verify` and `kaal verify` report
// the assembled registrations (core/A25, core/A28, core/F56), beside the planned outer tests in
// test/plan/registration.test.mjs. Commands run through Hosting, with no platform decision (core/F88).
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { bootstrap, verify } from "kaal-core";
import { assemble, REGISTRATION_SCHEMA, REGISTRATION_TYPE } from "kaal-core/registration";

const CLI = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
const CAPABILITY = fileURLToPath(new URL("../capability/", import.meta.url));

/** Kind owners and a consuming repository, as registration frontmatter: nested kinds, rules, instances and qualified references. */
const OWNER = `---
type: Core/Registration
holder: kaal-requirements
scope: requirements
kinds:
  F:
    traces: [I, { scope: testing, kind: T }]
    definition: "requirements: Functional Requirement"
  I:
    traces: []
---

Requirements' kinds.
`;
const TESTING = `---
type: Core/Registration
holder: kaal-testing
scope: testing
kinds:
  T:
    traces: any
---
`;
const ACME = (trace: string) => `---
type: Core/Registration
holder: acme-product
scope: acme
instances:
  - id: WHY-1
    kind: { scope: requirements, kind: I }
    traces: []
  - id: REQ-001
    kind: { scope: requirements, kind: F }
    traces: [WHY-1]
  - id: case 1
    kind: { scope: testing, kind: T }
    traces: [${trace}]
---
`;

/** An Engine holding Core's Capability Node and its Registration Type Definition, and the given files. */
async function engine(files: Record<string, string>): Promise<{ dir: string; done: () => void }> {
  const root = mkdtempSync(join(tmpdir(), "kaal-c26-"));
  const dir = join(root, ".kaal");
  await bootstrap(dir);
  mkdirSync(join(dir, "capabilities", "core"), { recursive: true });
  for (const name of ["Core.md", "Registration.md"]) writeFileSync(join(dir, "capabilities", "core", name), readFileSync(join(CAPABILITY, name)));
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return { dir, done: () => rmSync(root, { recursive: true, force: true }) };
}

describe("kaal-core registration in verify (core/C26)", () => {
  it("names its Type and schema, and its schema is a valid kaal-core/frontmatter schema", async () => {
    assert.equal(REGISTRATION_TYPE, "Core/Registration");
    const { checkSchema } = await import("kaal-core/frontmatter");
    assert.deepEqual(checkSchema(REGISTRATION_TYPE, REGISTRATION_SCHEMA), []);
  });

  it("a Registration Node passes verify: registered, validated, and assembled with no finding", async () => {
    const e = await engine({ "registrations/requirements.md": OWNER, "registrations/testing.md": TESTING, "registrations/acme.md": ACME("REQ-001") });
    try {
      const v = await verify(e.dir);
      assert.equal(v.ok, true, v.problems.join("\n"));
      const states = v.engine.artifacts.map((a) => [a.path, a.state]);
      assert.deepEqual(states, [["registrations/acme.md", "registered"], ["registrations/requirements.md", "registered"], ["registrations/testing.md", "registered"]]);
      const r = v.registrations!.assembly;
      assert.deepEqual(r.findings, []);
      assert.deepEqual(r.scopes.map((s) => s.scope), ["acme", "requirements", "testing"]);
      assert.deepEqual(r.untraced, [{ scope: "acme", id: "WHY-1" }], "an instance stating no trace is reported, not failed");
      assert.equal(r.kinds.find((k) => k.kind === "F")!.definition, "requirements: Functional Requirement");
      assert.equal(r.cycles, null, "without Graph, cycles are unavailable, and verify does not fail for it");
    } finally {
      e.done();
    }
  });

  it("an Engine with no registration verifies as before, with no registration result", async () => {
    const e = await engine({});
    try {
      const v = await verify(e.dir);
      assert.equal(v.ok, true, v.problems.join("\n"));
      assert.equal(v.registrations, undefined);
    } finally {
      e.done();
    }
  });

  it("fails verify on an assembly finding, and on a registration invalid against Core's schema", async () => {
    const forbidden = await engine({ "r/requirements.md": OWNER, "r/testing.md": TESTING, "r/acme.md": ACME("REQ-001").replace("    traces: []\n", "    traces: [REQ-001]\n") });
    try {
      const v = await verify(forbidden.dir);
      assert.equal(v.ok, false);
      assert.match(v.problems.join("\n"), /registration: not permitted by the rule: .*WHY-1.*REQ-001/);
    } finally {
      forbidden.done();
    }
    const incoming = await engine({ "r/acme.md": ACME("REQ-001").replace("    traces: []\n", "    traces: []\n    tracedBy: [REQ-001]\n") });
    try {
      const v = await verify(incoming.dir);
      assert.equal(v.ok, false, "a stated incoming trace is refused at the frontmatter boundary");
      assert.match(v.problems.join("\n"), /r\/acme\.md: Core\/Registration is invalid: instances \(undeclared\)/);
      assert.equal(v.registrations, undefined, "an invalid registration is not assembled");
    } finally {
      incoming.done();
    }
  });

  it("kaal verify lists the registrations, fails on a finding, and never on a cycle, an untraced instance or Graph's absence", async () => {
    const cyclic = ACME("REQ-001").replace("traces: [WHY-1]", "traces: [WHY-1, case 1]");
    const ok = await engine({ "r/requirements.md": OWNER, "r/testing.md": TESTING, "r/acme.md": cyclic });
    try {
      const r = await execute(process.execPath, [CLI, "verify", "--engine", ok.dir], { cwd: ok.dir });
      assert.equal(r.status, 0, r.stderr);
      for (const line of ["scope\tacme\tacme-product", "registration\t3 kinds, 3 instances, 0 findings", "untraced\tacme\tWHY-1", "cycles\tunavailable: Graph's analysis is not present"]) {
        assert.ok(r.stdout.split(/\r?\n/).includes(line), `${line} in:\n${r.stdout}`);
      }
    } finally {
      ok.done();
    }
    const bad = await engine({ "r/requirements.md": OWNER, "r/acme.md": ACME("REQ-001") });
    try {
      const r = await execute(process.execPath, [CLI, "verify", "--engine", bad.dir], { cwd: bad.dir });
      assert.equal(r.status, 1);
      assert.match(r.stderr, /registration: unknown kind/);
    } finally {
      bad.done();
    }
  });

  it("is pure: the same registrations in any order give the same result, and the input is not changed", () => {
    const input = [
      { holder: "kaal-x", scope: "x", kinds: { X: { traces: ["X"] as const } } },
      { holder: "acme", scope: "acme", instances: [{ id: "a", kind: { scope: "x", kind: "X" }, traces: ["b"] }, { id: "b", kind: { scope: "x", kind: "X" }, traces: ["a"] }] },
    ];
    const before = JSON.stringify(input);
    const a = assemble(input);
    const b = assemble([...input].reverse());
    assert.equal(JSON.stringify(input), before);
    assert.equal(JSON.stringify(a), JSON.stringify(b));
    assert.deepEqual(a.findings, [], "a cycle is never a finding");
    assert.deepEqual(a.outgoing("acme", "a"), [{ source: { scope: "acme", id: "a" }, target: { scope: "acme", id: "b" } }]);
  });

  it("keeps opaque text apart whatever it holds: a scope and identity that concatenate alike stay two instances", () => {
    const r = assemble([
      { holder: "kaal-x", scope: "x", kinds: { X: { traces: "any" as const } } },
      { holder: "h1", scope: "a", instances: [{ id: "b\u0000c", kind: { scope: "x", kind: "X" }, traces: [] }] },
      { holder: "h2", scope: "a\u0000b", instances: [{ id: "c", kind: { scope: "x", kind: "X" }, traces: ["c"] }] },
    ]);
    assert.deepEqual(r.findings, [], "no identity is stated twice");
    assert.deepEqual(r.outgoing("a", "b\u0000c"), [], "nor does one take another's traces");
  });
});
