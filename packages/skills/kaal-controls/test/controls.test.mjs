// The package's deterministic contracts: the payload is one Node, typed by
// Core as a KAAL Skill, and Core admits it into a fresh Engine. What the
// Node and the Agent Skill mean is validated by reading them, not here.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { bootstrap, capabilities, foundation, identify, readContribution, registerSkill, verify } from "kaal-core";

const PAYLOAD = fileURLToPath(new URL("../payload/", import.meta.url));

describe("payload", () => {
  it("is one Skill Node, typed by Core", () => {
    assert.deepEqual(identify(readFileSync(join(PAYLOAD, "Controls.md"))).type, foundation().skill);
  });

  it("registers into a fresh Engine", async () => {
    const dir = mkdtempSync(join(tmpdir(), "kaal-controls-"));
    await bootstrap(dir);
    const contribution = await readContribution(PAYLOAD);
    assert.deepEqual(Object.keys(contribution), ["Controls.md"]);
    await registerSkill(dir, "kaal-controls", contribution);
    assert.deepEqual((await capabilities(dir)).skills.map((r) => r.name), ["Controls"]);
    const verification = await verify(dir);
    assert.deepEqual([verification.ok, verification.problems], [true, []]);
  });
});
