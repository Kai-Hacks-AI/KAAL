import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { identify } from "@kaihacksai/kaal-graph";
import { CLAIM_FILE, readClaim } from "kaal-testing/attribution";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));

describe("Graph's own claim", () => {
  it("names Graph's Skill Node by its kind and exact name and id, and claims Graph's tree", () => {
    const node = identify(readFileSync(join(PACKAGE, "payload", "Graph.md")));
    assert.equal(node.type.name, "KAAL Skill");
    const { claim, finding } = readClaim(`packages/skills/kaal-graph/${CLAIM_FILE}`, readFileSync(join(PACKAGE, CLAIM_FILE)));
    assert.equal(finding, undefined);
    assert.deepEqual(claim.owner, { kind: "skill", name: node.name, id: node.id });
    assert.deepEqual(claim.paths, ["packages/skills/kaal-graph/"]);
  });
});
