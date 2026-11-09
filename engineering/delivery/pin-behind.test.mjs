// Cases for the interim pin-behind rule of the acceptance lane (foundation/C19). Run: node --test engineering/delivery/pin-behind.test.mjs
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reclassify, settle } from "./pin-behind.mjs";

const F = "@kaihacksai/kaal-foundation";
const REG = "https://registry.npmjs.org/@kaihacksai/kaal-foundation/-/kaal-foundation-0.0.1.tgz";
const manifest = { [F]: { tarball: "/run/f.tgz", sha256: "a", integrity: "sha512-packed", version: "0.0.2" } };
const records = [{ scenario: "/s/embed.test.mjs", host: "/h1", consumed: {} }];
const top = { name: F, version: "0.0.2", integrity: "sha512-packed", resolved: "file:/run/f.tgz" };
const held = (extra) => ({ [`node_modules/${F}`]: top, ...extra });
const nestedOld = (consumer, v = "0.0.1", more = {}) => ({ [`node_modules/${consumer}/node_modules/${F}`]: { name: F, version: v, integrity: "sha512-registry", resolved: REG, ...more } });
const text = (name = F, resolved = REG) => `/h1 holds ${name} from ${resolved}, not the packed tarball`;
const failureFor = (evidence) => ({ kind: "verified failure", subject: "/s/embed.test.mjs", evidence });
const run = (holds, findings) => reclassify({ manifest, records, findings, holds: { "/h1": holds } });
const kinds = (out) => out.map((f) => f.kind);

describe("acceptance lane: nested strictly older copy is pin-behind", () => {
  it("a nested, strictly older, plain x.y.z copy becomes a non-failing pin-behind", () => {
    const out = run(held(nestedOld("kaal-core")), [failureFor(text())]);
    assert.deepEqual(kinds(out), ["pin-behind"]);
    assert.equal(out[0].subject, "/s/embed.test.mjs");
    assert.match(out[0].evidence, /pin-behind: .*kaal-core.*@kaihacksai\/kaal-foundation@0\.0\.1.*packed 0\.0\.2/);
  });
  it("a top-level copy with other bytes stays a verified failure", () => {
    const holds = { [`node_modules/${F}`]: { name: F, version: "0.0.1", integrity: "sha512-registry", resolved: REG } };
    assert.deepEqual(kinds(run(holds, [failureFor(text())])), ["verified failure"]);
  });
  it("a nested copy of the same version with other bytes stays a verified failure", () => {
    assert.deepEqual(kinds(run(held(nestedOld("kaal-core", "0.0.2")), [failureFor(text())])), ["verified failure"]);
  });
  it("a nested newer copy stays a verified failure", () => {
    assert.deepEqual(kinds(run(held(nestedOld("kaal-core", "0.0.3")), [failureFor(text())])), ["verified failure"]);
  });
  it("a held version that is not plain x.y.z or is missing stays a verified failure", () => {
    for (const version of ["0.0.1-beta.1", "0.0", "latest", null]) {
      assert.deepEqual(kinds(run(held(nestedOld("kaal-core", version)), [failureFor(text())])), ["verified failure"], String(version));
    }
  });
  it("a missing packed version (old manifest) fails closed", () => {
    const m = { [F]: { tarball: "/run/f.tgz", sha256: "a", integrity: "sha512-packed" } };
    const out = reclassify({ manifest: m, records, findings: [failureFor(text())], holds: { "/h1": held(nestedOld("kaal-core")) } });
    assert.deepEqual(kinds(out), ["verified failure"]);
  });
  it("only the nested copies are reclassified when a top-level one with the same text also fails", () => {
    const holds = {
      [`node_modules/${F}`]: { name: F, version: "0.0.1", integrity: "sha512-registry", resolved: REG },
      ...nestedOld("kaal-core"), ...nestedOld("kaal-change"), ...nestedOld("kaal-testing"),
    };
    const out = run(holds, [failureFor(text()), failureFor(text()), failureFor(text()), failureFor(text())]);
    assert.deepEqual(kinds(out).sort(), ["pin-behind", "pin-behind", "pin-behind", "verified failure"]);
  });
  it("other findings, unknowns and unreadable hosts are untouched", () => {
    const unknown = { kind: "unknown", subject: "installation hosts", evidence: "x" };
    const other = failureFor("installed foo, which this run did not pack");
    const out = run(held(nestedOld("kaal-core")), [other, unknown, failureFor(text())]);
    assert.deepEqual(out.map((f) => f.kind), ["verified failure", "unknown", "pin-behind"]);
    assert.deepEqual(reclassify({ manifest, records, findings: [failureFor(text())], holds: { "/h1": { unreadable: "ENOENT" } } }).map((f) => f.kind), ["verified failure"]);
  });
  it("a nested older copy of a package that was not packed is not Testing's finding and is left alone", () => {
    const out = run({ "node_modules/kaal-core/node_modules/yaml": { name: "yaml", version: "1.0.0", integrity: "x", resolved: "r" } }, []);
    assert.deepEqual(out, []);
  });

  // Identity: the verdict follows the installed path, never the position of a finding (CPO review of #1289).
  const permutations = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r])));
  const topHeld = { name: F, version: "0.0.1", integrity: "sha512-registry", resolved: REG };
  const mixed = () => ({ [`node_modules/${F}`]: topHeld, ...nestedOld("kaal-core"), ...nestedOld("kaal-change"), ...nestedOld("kaal-testing") });
  it("explicit attribution: the top-level copy keeps its failure and each nested copy is pin-behind, in every order of findings", () => {
    const four = [0, 1, 2, 3].map(() => failureFor(text()));
    for (const order of permutations(four)) {
      const out = run(mixed(), order);
      const failures = out.filter((f) => f.kind === "verified failure");
      const behind = out.filter((f) => f.kind === "pin-behind");
      assert.equal(failures.length, 1);
      assert.match(failures[0].evidence, /\[at node_modules\/@kaihacksai\/kaal-foundation\]$/);
      assert.equal(behind.length, 3);
      for (const consumer of ["kaal-core", "kaal-change", "kaal-testing"]) assert.equal(behind.filter((f) => f.evidence.includes(`[at node_modules/${consumer}/node_modules/${F}]`)).length, 1);
    }
  });
  it("explicit attribution does not depend on the order of the held entries either", () => {
    const entries = Object.entries(mixed());
    for (const order of permutations(entries)) {
      const out = run(Object.fromEntries(order), [0, 1, 2, 3].map(() => failureFor(text())));
      assert.deepEqual(out.map((f) => f.kind).sort(), ["pin-behind", "pin-behind", "pin-behind", "verified failure"]);
      assert.match(out.find((f) => f.kind === "verified failure").evidence, /\[at node_modules\/@kaihacksai\/kaal-foundation\]$/);
    }
  });
  it("when Testing's holds findings do not match the install record, nothing is excused and a failure is added", () => {
    const out = run(held(nestedOld("kaal-core")), [failureFor(text()), failureFor(text())]);
    assert.equal(out.filter((f) => f.kind === "pin-behind").length, 0);
    assert.ok(out.filter((f) => f.kind === "verified failure").length >= 2);
    assert.ok(out.some((f) => /attribution failed/.test(f.evidence)));
    const none = run(held(nestedOld("kaal-core")), []);
    assert.equal(none.filter((f) => f.kind === "pin-behind").length, 0);
    assert.ok(none.some((f) => f.kind === "verified failure" && /attribution failed/.test(f.evidence)));
  });
  it("an independent Testing failure keeps the run failing whatever else is reclassified", () => {
    const runnerFailure = failureFor("the scenarios failed (node --test exited 1)");
    const out = run(held(nestedOld("kaal-core")), [runnerFailure, failureFor(text())]);
    assert.deepEqual(out.map((f) => f.kind), ["verified failure", "pin-behind"]);
    assert.equal(settle({ manifest, records, findings: [runnerFailure, failureFor(text())], holds: { "/h1": held(nestedOld("kaal-core")) }, packaging: [] }).passed, false);
    assert.equal(settle({ manifest, records, findings: [failureFor(text())], holds: { "/h1": held(nestedOld("kaal-core")) }, packaging: [] }).passed, true);
    assert.equal(settle({ manifest, records, findings: [failureFor(text())], holds: { "/h1": held(nestedOld("kaal-core")) }, packaging: [failureFor("dist/ changed")] }).passed, false);
  });
});
