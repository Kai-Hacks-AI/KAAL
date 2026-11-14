// engineering/C15 planned Cases T268-T274: RED until collector-capability.mjs exists.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { collectorCapability, report } = await import("../../collector-capability.mjs");
const capabilities = new Set(["core", "change", "guard", "testing"]);

describe("engineering/C15: collector capability", () => {
  it("T268: a collector of an admitted Capability Node passes", () => {
    assert.equal(collectorCapability("kaal/core/x", { capabilities }).verdict, "PASS");
  });
  it("T269: a segment that names only a Skill Node is reported", () => {
    assert.equal(collectorCapability("kaal/release/x", { capabilities }).verdict, "FAIL");
  });
  it("T270: a Skill Node named Retro does not authorize kaal/retro/*", () => {
    assert.equal(collectorCapability("kaal/retro/x", { capabilities, skills: new Set(["retro"]) }).verdict, "FAIL");
  });
  it("T271: an unreadable or empty main gives UNKNOWN, which never passes", () => {
    assert.equal(collectorCapability("kaal/core/x", { capabilities: null }).verdict, "UNKNOWN");
    assert.equal(collectorCapability("kaal/core/x", { capabilities: new Set() }).verdict, "UNKNOWN");
  });
  it("T272: a Capability Node only in the pull request head does not count", () => {
    assert.equal(collectorCapability("kaal/atlas/x", { capabilities, head: new Set(["atlas"]) }).verdict, "FAIL");
  });
  it("T273: bootstrap: a new capability's collector passes only once its Node is on main", () => {
    assert.equal(collectorCapability("kaal/atlas/x", { capabilities }).verdict, "FAIL");
    assert.equal(collectorCapability("kaal/atlas/x", { capabilities: new Set([...capabilities, "atlas"]) }).verdict, "PASS");
    assert.equal(collectorCapability("kaal/core/register-atlas", { capabilities }).verdict, "PASS");
  });
  it("T274: legacy, flat and non-Node refs are exceptions and change no exit status", () => {
    const r = report(["kaal/core", "kaal/old/core", "kaal/engineering/x", "kaal/architecture/classify"], { capabilities });
    assert.equal(r.exceptions.length, 4);
    assert.equal(r.exitStatus, 0);
  });
});
