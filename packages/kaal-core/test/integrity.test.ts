// core/C53 Code tests for the installation integrity verdict, beyond the planned core/T110 to core/T119.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import { exitStatus, expectedSet, observationScope, verifyInstallation, type Digests, type Evidence, type Observed, type Source } from "../dist/integrity.js";

const sha = (t: string) => createHash("sha256").update(t).digest("hex");
const digests = (files: Record<string, string>): Digests => Object.fromEntries(Object.entries(files).map(([p, t]) => [p, sha(t)]));
const tree = (d: Digests) => sha(Object.keys(d).sort().map((p) => `${p}\0${d[p]}\n`).join(""));
const entity = { kind: "capability", name: "x" };
const source = (kind: string, files: Record<string, string>): Source => {
  const d = digests(files);
  return { kind, origin: kind, manifest: { ...entity, version: "1.0.0", assets: Object.keys(d) }, files: d, treeDigest: tree(d) };
};
const evidence = (files: Record<string, string>): Evidence => ({ establisher: { role: "gate", id: "g" }, sources: [source("package", files)] });
const observed = (files: Record<string, string>, scope: string[] = ["."]): Observed => {
  const d = digests(files);
  return { scope, files: d, treeDigest: tree(d), complete: true };
};
const verdict = (e: Evidence | undefined, o: Observed | undefined, extra = {}) => verifyInstallation({ entity, version: "1.0.0", comparison: "engineering", evidence: e, observed: o, ...extra });

describe("installation integrity (core/C53)", () => {
  it("an unknown comparison is unknown, never aligned", () => {
    const r = verifyInstallation({ entity, version: "1.0.0", comparison: "nonsense" as never, evidence: evidence({ a: "a" }), observed: observed({ a: "a" }) });
    assert.deepEqual([r.status, r.reason], ["unknown", "unavailable"]);
  });
  it("a selected set that no variant names is unknown, not a verdict against the base", () => {
    const e: Evidence = { ...evidence({ a: "a" }), variants: { external: { suppliedBy: { owner: "x", path: "p/" }, sources: [source("package", { a: "b" })] } } };
    const r = verdict(e, observed({ a: "a" }), { ownership: { owner: "x", paths: ["p/"] }, selected: "other" });
    assert.equal(r.status, "unknown");
  });
  it("a variant without sources is unknown", () => {
    const e: Evidence = { ...evidence({ a: "a" }), variants: { v: { suppliedBy: { owner: "x", path: "p/" }, sources: [] } } };
    assert.equal(verdict(e, observed({ a: "a" }), { ownership: { owner: "x", paths: ["p/"] } }).status, "unknown");
  });
  it("a missing or malformed observed inventory is unknown (inventory)", () => {
    const e = evidence({ a: "a" });
    assert.equal(verdict(e, undefined).reason, "inventory");
    assert.equal(verdict(e, { scope: ["."], files: null, treeDigest: "" } as never).reason, "inventory");
  });
  it("completeness is stated, never inferred", () => {
    const o = observed({ a: "a" });
    const { complete: _omitted, ...silent } = o;
    assert.equal(verdict(evidence({ a: "a" }), silent as never).reason, "inventory");
    assert.equal(verdict(evidence({ a: "a" }), o).status, "aligned");
  });
  it("exit defaults to no enforcement", () => {
    assert.equal(exitStatus({ status: "differs" }), 0);
    assert.equal(exitStatus({ status: "unknown" }), 2);
  });
  it("the expected set and scope come from the contract, leaving out surface-gated assets", () => {
    const contract = { assets: [
      { source: "s/a", target: "t/a", kind: "file" },
      { source: "s/d", target: "t/d", kind: "directory" },
      { source: "s/h", target: "h", kind: "file", surface: "hook" },
    ] };
    const read = (p: string) => p;
    const set = expectedSet({ contract, read, list: (p) => (p === "s/d" ? ["x", "y/z"] : undefined) });
    assert.deepEqual(Object.keys(set ?? {}), ["t/a", "t/d/x", "t/d/y/z"]);
    assert.equal(set?.["t/d/y/z"], sha("s/d/y/z"));
    assert.deepEqual(observationScope({ contract }), ["t/a", "t/d/"]);
    assert.equal(expectedSet({ contract, read, list: () => undefined }), null, "an unavailable enumeration is not an empty directory");
    assert.deepEqual(Object.keys(expectedSet({ contract, read, list: () => [] }) ?? {}), ["t/a"], "an enumerated empty directory is verified empty");
  });
});
