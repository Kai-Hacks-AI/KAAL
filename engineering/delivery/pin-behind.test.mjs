// Cases for the interim pin-behind rule of the acceptance lane (foundation/C19). Run: node --test engineering/delivery/pin-behind.test.mjs
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { reclassify } from "./pin-behind.mjs";

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
});
