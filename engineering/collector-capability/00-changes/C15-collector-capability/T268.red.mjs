// engineering/C15 planned Cases T268-T272: RED until collector-capability.mjs exists.
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { collectorCapability } = await import("../../collector-capability.mjs");
const names = new Set(["release", "review", "core"]);

describe("engineering/C15: collector capability", () => {
  it("T268: a collector of an admitted Node name passes", () => {
    assert.equal(collectorCapability("kaal/release/x", { names }).verdict, "PASS");
  });
  it("T269: a segment with no admitted Node fails", () => {
    assert.equal(collectorCapability("kaal/retro/x", { names }).verdict, "FAIL");
  });
  it("T270: an unreadable main gives UNKNOWN, which never passes", () => {
    assert.equal(collectorCapability("kaal/release/x", { names: null }).verdict, "UNKNOWN");
  });
  it("T271: a Node only in the pull request head does not count", () => {
    assert.equal(collectorCapability("kaal/retro/x", { names, head: new Set(["retro"]) }).verdict, "FAIL");
  });
  it("T272: flat and old refs are outside the form", () => {
    assert.equal(collectorCapability("kaal/core", { names }).verdict, "FAIL");
    assert.equal(collectorCapability("kaal/old/core", { names }).verdict, "FAIL");
  });
});
