// Defect (Codex review on #938, confirmed): the comprehensive lane runs every uncovered `test:*`
// script of a workspace with no arguments. `test:package-only` needs a packed manifest and a fresh
// consumer directory, so the lane would run it without them and fail on its usage assertion.
// This is a known-RED Defect Case. It is not part of any gating test script. It is run by hand until
// the fixing Change turns it GREEN and moves it into the package's gating tests.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { suites } from "../../../../engineering/lanes/suites.mjs";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

describe("Defect: the lane discovers an argument-required probe", () => {
  it("does not offer kaal-change's package-only probe to the lane's automatic suite discovery", async () => {
    const discovered = (await suites(ROOT))
      .filter((s) => s.location === "packages/kaal-change" && s.status === undefined)
      .map((s) => s.script);
    assert.ok(discovered.includes("test:publisher"), "the lane still discovers kaal-change's other suites");
    assert.equal(discovered.includes("test:package-only"), false, `lane would run these with no arguments: ${discovered.join(", ")}`);
  });
});
