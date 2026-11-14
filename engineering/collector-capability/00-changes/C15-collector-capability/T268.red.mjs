// engineering/C15 planned Cases T268-T276: RED until collector-capability.mjs exists.
// Evidence shape (read from main, never the head):
//   registrations: the scope claims of Core's `assemble()` over main's Registrations, [{ scope, holder }], with
//                  `collisions`: the scopes Core reports as claimed by several holders; null when unreadable.
//   capabilities:  the names of the KAAL Capability Nodes Core admits on main (kind-specific).
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { collectorCapability, report } = await import("../../collector-capability.mjs");
const capabilities = new Set(["Core", "Change", "Guard", "Testing"]);
const evidence = (claims, extra = {}) => ({ registrations: { claims, collisions: [] }, capabilities, ...extra });
const claims = [{ scope: "core", holder: "Core" }, { scope: "testing", holder: "Testing" }, { scope: "release", holder: "Release" }];

describe("engineering/C15: collector capability from Core's registered scope", () => {
  it("T268: a segment that is a registered scope held by an admitted Capability passes", () => {
    assert.equal(collectorCapability("kaal/core/x", evidence(claims)).verdict, "PASS");
  });
  it("T269: a registered scope whose holder is not an admitted Capability (a Skill) fails", () => {
    assert.equal(collectorCapability("kaal/release/x", evidence(claims)).verdict, "FAIL");
  });
  it("T270: an admitted Capability Node name without a registered scope never passes, whatever its spelling", () => {
    assert.notEqual(collectorCapability("kaal/guard/x", evidence(claims)).verdict, "PASS");
    assert.equal(collectorCapability("kaal/guard/x", evidence(claims)).verdict, "FAIL");
  });
  it("T271: absent Registration evidence gives UNKNOWN, which never passes", () => {
    assert.equal(collectorCapability("kaal/core/x", { registrations: null, capabilities }).verdict, "UNKNOWN");
    assert.equal(collectorCapability("kaal/core/x", evidence([])).verdict, "UNKNOWN");
    assert.equal(collectorCapability("kaal/core/x", { registrations: { claims, collisions: [] }, capabilities: null }).verdict, "UNKNOWN");
  });
  it("T272: a Registration or Capability Node only in the pull request head does not count", () => {
    assert.equal(collectorCapability("kaal/atlas/x", evidence(claims, { head: { claims: [{ scope: "atlas", holder: "Atlas" }], capabilities: new Set(["Atlas"]) } })).verdict, "FAIL");
  });
  it("T273: bootstrap: a new capability's collector passes only once its Registration and Node are on main", () => {
    assert.equal(collectorCapability("kaal/atlas/x", evidence(claims)).verdict, "FAIL");
    const later = [...claims, { scope: "atlas", holder: "Atlas" }];
    assert.equal(collectorCapability("kaal/atlas/x", { registrations: { claims: later, collisions: [] }, capabilities: new Set([...capabilities, "Atlas"]) }).verdict, "PASS");
    assert.equal(collectorCapability("kaal/core/register-atlas", evidence(claims)).verdict, "PASS");
  });
  it("T274: legacy, flat and non-Node refs are migration findings, never authorized, and change no exit status", () => {
    const r = report(["kaal/core", "kaal/old/core", "kaal/engineering/x", "kaal/architecture/classify"], evidence(claims));
    assert.equal(r.findings.length, 4);
    assert.ok(r.findings.every((f) => f.authorized === false));
    assert.equal(r.exitStatus, 0);
  });
  it("T275: a scope held by a Skill, not a Capability, fails even when registered", () => {
    assert.equal(collectorCapability("kaal/release/x", evidence([{ scope: "release", holder: "Release" }])).verdict, "FAIL");
  });
  it("T276: a scope Core reports as claimed by several holders gives UNKNOWN, never PASS", () => {
    const e = { registrations: { claims: [{ scope: "core", holder: "Core" }, { scope: "core", holder: "Change" }], collisions: ["core"] }, capabilities };
    assert.equal(collectorCapability("kaal/core/x", e).verdict, "UNKNOWN");
  });
});
