// Delivered Intent loop (core/F70): what a consumer installs kaal-core for, checked against the
// installed copy. It runs in the verifier's scratch directory, writes nowhere else, and removes what it wrote (core/N23).
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { bootstrap, verify } from "kaal-core";
import { assemble } from "kaal-core/registration";

const scratch = () => join(process.cwd(), `engine-${randomUUID()}`);

describe("kaal-core Intent loop", () => {
  it("bootstraps an Engine that verifies, and leaves an existing one unchanged [core/I9, core/I12]", async () => {
    const dir = scratch();
    try {
      const written = await bootstrap(dir);
      assert.ok(written.length > 0, "the Engine is materialized from the payload");
      const v = await verify(dir);
      assert.equal(v.ok, true, v.problems.join("\n"));
      assert.ok(v.engine.nodes.length >= 6, "the foundational Nodes are admitted");
      assert.deepEqual(await bootstrap(dir), [], "a verified Engine is recognized and nothing is written");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("assembles registrations one way, reports what it cannot judge, and needs no Graph [core/I16, core/I18, core/I24]", () => {
    const r = assemble([
      { holder: "kaal-requirements", scope: "requirements", kinds: { F: { traces: [] } } },
      { holder: "kaal-testing", scope: "testing", kinds: { T: { traces: "any" } } },
      {
        holder: "acme",
        scope: "acme",
        instances: [
          { id: "REQ-1", kind: { scope: "requirements", kind: "F" }, traces: [] },
          { id: "case 1", kind: { scope: "testing", kind: "T" }, traces: ["REQ-1"] },
        ],
      },
    ]);
    assert.deepEqual(r.findings, []);
    assert.deepEqual(r.untraced, [{ scope: "acme", id: "REQ-1" }], "an untraced instance is reported, never failed");
    assert.equal(r.cycles, null, "without Graph, cycles are unavailable, not empty");
    assert.equal(r.reach("acme", "case 1"), null, "and so is reach");
  });
});
