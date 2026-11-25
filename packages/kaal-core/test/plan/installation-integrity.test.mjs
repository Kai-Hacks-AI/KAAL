// core/C53 planned outer tests: generic installation integrity. Immutable to DO and CHECK.
// Each title names the contracts it checks (plan/installation-integrity/*.md). They are written
// against the provisional entry point of core/A53, `kaal-core/integrity` (decision D6), and read
// the verdict as data, never a message. Cases whose decision is still open are in testing.md.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

/** `kaal-core/integrity`, or the reason the tests are blocked before any behavioural assertion. */
async function integrity() {
  let m;
  try {
    m = await import("kaal-core/integrity");
  } catch (e) {
    assert.fail(`blocked before behavioural assertion: kaal-core exports no ./integrity (${e.code ?? e.message})`);
  }
  for (const name of ["verifyInstallation", "exitStatus"]) {
    if (typeof m[name] !== "function") assert.fail(`blocked before behavioural assertion: kaal-core/integrity exports no ${name}`);
  }
  return m;
}

const sha = (text) => createHash("sha256").update(text).digest("hex");
const set = (files) => Object.fromEntries(Object.entries(files).map(([path, text]) => [path, sha(text)]));
const entity = { kind: "capability", name: "x" };
const source = { kind: "package", origin: "x@1.0.0" };
const verify = (m, expected, observed, extra = {}) => m.verifyInstallation({ entity, version: "1.0.0", source, expected: set(expected), observed: set(observed), ...extra });

describe("Installation integrity (core/C53)", () => {
  it("core/T110 [core/F100, core/N29, core/A53]: the verdict lists missing, unexpected and modified assets by content identity, in path order, and is aligned only when none exist; the same bytes at another path are one missing and one unexpected; the same name with other bytes is modified", async () => {
    const m = await integrity();
    const files = { "a.md": "a", "dir/b.md": "b", "dir/c.md": "c" };
    const same = verify(m, files, files);
    assert.equal(same.status, "aligned");
    assert.deepEqual([same.missing, same.unexpected, same.modified], [[], [], []]);
    const gone = verify(m, files, { "a.md": "a", "dir/b.md": "b" });
    assert.equal(gone.status, "differs");
    assert.deepEqual(gone.missing, ["dir/c.md"]);
    const extra = verify(m, files, { ...files, "z.md": "z", "dir/y.md": "y" });
    assert.deepEqual(extra.unexpected, ["dir/y.md", "z.md"], "path order");
    const changed = verify(m, files, { ...files, "a.md": "changed" });
    assert.deepEqual(changed.modified, ["a.md"], "the same name with other bytes is modified");
    assert.deepEqual([changed.missing, changed.unexpected], [[], []]);
    const moved = verify(m, files, { "a.md": "a", "dir/b.md": "b", "elsewhere/c.md": "c" });
    assert.deepEqual([moved.missing, moved.unexpected, moved.modified], [["dir/c.md"], ["elsewhere/c.md"], []], "the same bytes at another path are one missing and one unexpected");
    assert.equal(JSON.stringify(verify(m, files, files)), JSON.stringify(verify(m, files, files)), "the same input gives the same result");
  });

  it("core/T111 [core/F101, core/A53]: a verdict with no stated origin, or whose origin is the installation or its own record, is unknown with a reason, never aligned", async () => {
    const m = await integrity();
    const files = { "a.md": "a" };
    for (const src of [undefined, { kind: "package" }, { kind: "package", origin: "" }, { kind: "installation", origin: ".kaal/x" }, { kind: "record", origin: ".kaal/state/x/installation.json" }]) {
      const r = verify(m, files, files, { source: src });
      assert.equal(r.status, "unknown", `unknown for ${JSON.stringify(src)}`);
      assert.equal(typeof r.reason, "string");
      assert.ok(r.reason.length > 0, "and says why");
    }
    assert.equal(m.verifyInstallation({ entity, version: "1.0.0", source, observed: set(files) }).status, "unknown", "no expected set at all");
  });

  it("core/T112 [core/F102, core/A53]: the result names the entity, the selected version, the kind of source and the origin; the same installation compared with another version's expected set gives that version's differences", async () => {
    const m = await integrity();
    const v1 = { "a.md": "one" }; const v2 = { "a.md": "two", "b.md": "b" };
    const r = m.verifyInstallation({ entity, version: "1.0.0", source, expected: set(v1), observed: set(v1) });
    assert.deepEqual(r.entity, entity);
    assert.equal(r.version, "1.0.0");
    assert.equal(r.source.kind, "package");
    assert.equal(r.source.origin, "x@1.0.0");
    const other = m.verifyInstallation({ entity, version: "2.0.0", source: { kind: "package", origin: "x@2.0.0" }, expected: set(v2), observed: set(v1) });
    assert.equal(other.version, "2.0.0");
    assert.deepEqual([other.missing, other.modified], [["b.md"], ["a.md"]], "that version's differences");
    assert.equal(r.status, "aligned", "and nothing of the other leaks into the first");
  });

  it("core/T113 [core/F103, core/N28, core/A55]: the same call judges a Capability, an Agent, a Skill, an Extension and an entity nobody has heard of, and the module holds no name of another package and imports only what Core already depends on", async () => {
    const m = await integrity();
    for (const kind of ["capability", "agent", "skill", "extension", "something-core-has-never-heard-of"]) {
      const r = m.verifyInstallation({ entity: { kind, name: "n" }, version: "1.0.0", source, expected: set({ "p": "p" }), observed: set({ "p": "p" }) });
      assert.equal(r.status, "aligned", `a ${kind}`);
      assert.equal(m.verifyInstallation({ entity: { kind, name: "n" }, version: "1.0.0", source, expected: set({ "p": "p" }), observed: {} }).status, "differs");
    }
    const here = new URL("../../", import.meta.url);
    const text = readFileSync(new URL("dist/integrity.js", here), "utf8");
    const specifiers = [...text.matchAll(/(?:import|export)[^"']*from\s*["']([^"']+)["']/g)].map((x) => x[1]);
    for (const s of specifiers) assert.ok(s.startsWith("./") || s.startsWith("node:") || s.startsWith("@kaihacksai/kaal-hosting") || s.startsWith("@kaihacksai/kaal-foundation"), `imports only what Core depends on: ${s}`);
    const others = readdirSync(new URL("../", here)).filter((d) => d.startsWith("kaal-") && d !== "kaal-core");
    for (const name of others) assert.ok(!text.includes(name), `the module names no other package: ${name}`);
  });

  it("core/T114 [core/F104, core/A56]: a discrepancy exits 0, exits 1 only when enforcement is requested, and unknown exits 2 whatever is requested", async () => {
    const m = await integrity();
    const ok = verify(m, { "a.md": "a" }, { "a.md": "a" });
    const bad = verify(m, { "a.md": "a" }, { "a.md": "b" });
    const unknown = verify(m, { "a.md": "a" }, { "a.md": "a" }, { source: { kind: "installation", origin: "x" } });
    assert.equal(m.exitStatus(ok, { enforce: false }), 0);
    assert.equal(m.exitStatus(ok, { enforce: true }), 0);
    assert.equal(m.exitStatus(bad, { enforce: false }), 0, "a finding is not a veto");
    assert.equal(m.exitStatus(bad, { enforce: true }), 1, "a veto only when enforced");
    assert.equal(m.exitStatus(unknown, { enforce: false }), 2, "unknown is never clean");
    assert.equal(m.exitStatus(unknown, { enforce: true }), 2);
  });
});
