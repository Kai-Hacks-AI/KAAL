// Lane discovery: the comprehensive lane runs every uncovered `test:*` script of a workspace with no
// arguments. `package-only.mjs` needs a packed manifest and a fresh consumer directory, so it is run by
// path (see docs/testing.md) and must not be a `test:*` script.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { suites } from "../../../../engineering/lanes/suites.mjs";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

describe("lane discovery", () => {
  it("does not offer kaal-change's package-only probe to the lane's automatic suite discovery", async () => {
    const discovered = (await suites(ROOT))
      .filter((s) => s.location === "packages/kaal-change" && s.status === undefined)
      .map((s) => s.script);
    assert.ok(discovered.includes("test:publisher"), "the lane still discovers kaal-change's other suites");
    assert.equal(discovered.includes("test:package-only"), false, `lane would run these with no arguments: ${discovered.join(", ")}`);
  });
});
