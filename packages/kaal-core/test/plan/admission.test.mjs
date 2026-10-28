// core/C9 planned outer tests: typed artifacts and Type states. Immutable to DO and CHECK;
// core/C11 turns them GREEN. Each title names the contracts it checks (plan/admission/*.md).
// They use kaal-core's public interface only.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, evaluate, foundation, payload } from "kaal-core";

const sha = (text) => createHash("sha256").update(text).digest("hex");
const ref = (r) => `\n  name: ${JSON.stringify(r.name)}\n  id: ${r.id}`;

/** Core's Engine, or the reason the tests are blocked before any behavioural assertion. */
function engine(files, options) {
  const e = evaluate(files, options);
  if (!("artifacts" in e)) assert.fail("blocked before behavioural assertion: evaluate returns no artifacts");
  return e;
}

const capability = (name) => `---\nname: ${name}\ntype:${ref(foundation().capability)}\n---\n\n# ${name}\n`;
const definition = (name, owner) => `---\nname: ${name}\ntype:${ref(foundation().definition)}\n${owner ? `capability:${ref(owner)}\n` : ""}---\n\n# ${name}\n`;
const GUARD = capability("Guard");
const OWNER = { name: "Guard", id: sha(GUARD) };
const CHECK = definition("Guard/Check", OWNER);
const ARTIFACT = "---\ntype: Guard/Check\nruns: [hook]\n---\n\n# push\n";
const AT = "config/guard/push.md";
const files = (extra) => ({ ...payload(), ...Object.fromEntries(Object.entries(extra).map(([p, t]) => [p, Buffer.from(t)])) });
const artifact = (e, path = AT) => e.artifacts.find((a) => a.path === path);

describe("Typed artifacts (core/C9)", () => {
  it("core/T23 [core/F23, core/F25]: a <Capability>/<Type> frontmatter is a typed artifact wherever it is, and a Node in Form under .kaal/config/<capability>/ is still admitted", () => {
    const e = engine(files({ [AT]: ARTIFACT, "elsewhere/push.md": ARTIFACT, "config/guard/Guard.md": GUARD }));
    for (const path of [AT, "elsewhere/push.md"]) {
      assert.equal(artifact(e, path)?.type, "Guard/Check", path);
      assert.ok(!e.rejected.some((r) => r.path === path), `${path} is not a rejected Node`);
      assert.ok(!e.nodes.some((n) => n.paths.includes(path)), `${path} is not admitted as a Node`);
    }
    assert.ok(e.nodes.some((n) => n.name === "Guard" && n.paths.includes("config/guard/Guard.md")));
  });

  it("core/T24 [core/F24]: a Node with type: KAAL Skill, type: guard/check or type: Guard stays rejected as not in Form", () => {
    for (const type of ["KAAL Skill", "guard/check", "Guard"]) {
      const e = engine(files({ "x.md": `---\nname: X\ntype: ${type}\n---\n` }));
      assert.ok(e.rejected.some((r) => r.path === "x.md" && /not in Form/.test(r.reason)), type);
      assert.equal(artifact(e, "x.md"), undefined, type);
    }
  });
});

describe("Type states (core/C9)", () => {
  it("core/T25 [core/F28]: with no Definition of that name, the Type is unregistered, with a next step", () => {
    const a = artifact(engine(files({ [AT]: ARTIFACT })));
    assert.equal(a.state, "unregistered");
    assert.ok(a.findings.length > 0 && a.findings.every((f) => typeof f.rule === "string" && f.rule.length > 0));
  });

  it("core/T26 [core/F26, core/F27]: with one Type Definition owned by the prefix's Capability, the Type is registered", () => {
    const a = artifact(engine(files({ [AT]: ARTIFACT, "guard/Guard.md": GUARD, "guard/Check.md": CHECK })));
    assert.equal(a.state, "registered");
    assert.deepEqual(a.findings, []);
  });

  it("core/T27 [core/F29]: two Nodes of that name, a Definition without a Capability, or one owned by another Capability, make the Type unknown", () => {
    const OTHER = capability("Testing");
    const cases = {
      "two Definitions": { "guard/Guard.md": GUARD, "guard/Check.md": CHECK, "guard/Check2.md": CHECK + "\nAgain.\n" },
      "no Capability": { "guard/Check.md": definition("Guard/Check") },
      "another Capability": { "guard/Testing.md": OTHER, "guard/Check.md": definition("Guard/Check", { name: "Testing", id: sha(OTHER) }) },
    };
    for (const [name, extra] of Object.entries(cases)) {
      const a = artifact(engine(files({ [AT]: ARTIFACT, ...extra })));
      assert.equal(a.state, "unknown", name);
      assert.ok(a.findings.length > 0, name);
    }
  });

  it("core/T28 [core/F30]: a supplied schema the frontmatter fails makes the artifact invalid with core/C6's findings, registered or not", () => {
    const types = { "Guard/Check": { keys: { runs: { value: "enum", list: true, values: ["ci"] } } } };
    for (const extra of [{}, { "guard/Guard.md": GUARD, "guard/Check.md": CHECK }]) {
      const a = artifact(engine(files({ [AT]: ARTIFACT, ...extra }), { types }));
      assert.equal(a.state, "invalid");
      assert.deepEqual(a.findings, [{ key: "runs", rule: "value" }]);
    }
    const ok = { "Guard/Check": { keys: { runs: { value: "enum", list: true, values: ["hook", "ci"] } } } };
    assert.equal(artifact(engine(files({ [AT]: ARTIFACT, "guard/Guard.md": GUARD, "guard/Check.md": CHECK }), { types: ok })).state, "registered");
  });

  it("core/T29 [core/I8, core/F31, core/N9]: registering the Definition afterwards turns the same unchanged bytes from unregistered to registered", () => {
    const before = files({ [AT]: ARTIFACT });
    const bytes = Buffer.from(before[AT]);
    assert.equal(artifact(engine(before)).state, "unregistered");
    const after = { ...before, ...files({ "guard/Guard.md": GUARD, "guard/Check.md": CHECK }) };
    assert.equal(artifact(engine(after)).state, "registered");
    assert.ok(after[AT].equals(bytes));
  });

  it("core/T30 [core/N8]: the same files and Types give the same result", () => {
    const input = () => files({ [AT]: ARTIFACT, "guard/Guard.md": GUARD, "guard/Check.md": CHECK, "other.md": ARTIFACT.replace("Guard/Check", "Testing/TestCase") });
    assert.deepEqual(engine(input()), engine(input()));
  });
});

describe("Verifying typed artifacts (core/C9)", () => {
  it("core/T31 [core/F32]: kaal verify passes with an unregistered artifact and lists it, and fails on an unknown one", async () => {
    engine(payload());
    const cli = join(dirname(fileURLToPath(import.meta.resolve("kaal-core"))), "cli.js");
    const verify = (dir) => {
      try {
        return { status: 0, out: execFileSync(process.execPath, [cli, "verify", "--engine", dir], { encoding: "utf8" }) };
      } catch (e) {
        return { status: e.status, out: `${e.stdout}${e.stderr}` };
      }
    };
    const root = mkdtempSync(join(tmpdir(), "kaal-c9-"));
    try {
      const dir = join(root, ".kaal");
      await bootstrap(dir);
      mkdirSync(join(dir, "config", "guard"), { recursive: true });
      writeFileSync(join(dir, AT), ARTIFACT);
      const passed = verify(dir);
      assert.equal(passed.status, 0, passed.out);
      assert.match(passed.out, /^ok: \d+ Nodes admitted/);
      assert.match(passed.out, /config\/guard\/push\.md/);
      assert.match(passed.out, /unregistered/);
      assert.equal(readFileSync(join(dir, AT), "utf8"), ARTIFACT);
      writeFileSync(join(dir, "Check.md"), definition("Guard/Check"));
      const failed = verify(dir);
      assert.notEqual(failed.status, 0, failed.out);
      assert.match(failed.out, /unknown/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
