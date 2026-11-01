// Graph's Agent Skill conforms to the Engineer Skill, a repository tool that does not ship
// (graph/F7). The Skill itself ships, and the embedded cases check what it delivers.
import assert from "node:assert/strict";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { checkSkill } from "kaal-engineer-skill";
import { read } from "@kaihacksai/kaal-hosting";

const SKILL = join(fileURLToPath(new URL("../../", import.meta.url)), "skills", "kaal-graph");

describe("the package", () => {
  it("has an Agent Skill that conforms", async () => {
    assert.deepEqual(checkSkill("kaal-graph", await read(SKILL)), { standard: [], kaal: [], warnings: [] });
  });
});
