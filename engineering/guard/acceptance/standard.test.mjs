// Guard outer acceptance, Engineering part: Guard is on par with the capability standard (guard/G61, guard/C143).
// The claim, the Node file and the contract are repository data of the capability, not shipped, so the publisher checks them.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../../../packages/kaal-guard");
const CONTRACT_FORMAT = "20c46d8e84ac4502d3b4a2b497f75f8bd999fb826ee5f85b6912b77afaaefa5b";

describe("guard/G61 capability standard", () => {
  it("guard/T213 [guard/G61]: Guard owns its tree, names its Installation Contract instance as Core's capabilities do, and is defined as a capability (its assets move under .kaal/ with the deployment, a later Change)", () => {
    for (const f of ["ownership.kaal.json", "installation.kaal.json", "capability/Guard.md"]) assert.ok(existsSync(join(PACKAGE, f)), `${f} is absent`);
    assert.ok(!existsSync(join(PACKAGE, "contract.json")), "contract.json is still there beside installation.kaal.json");
    const node = readFileSync(join(PACKAGE, "capability/Guard.md"));
    const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(node.toString("utf8"))?.[1] ?? "";
    assert.match(front, /^name: Guard$/m);
    assert.match(front, /^type:\r?\n  name: KAAL Capability$/m);
    const own = JSON.parse(readFileSync(join(PACKAGE, "ownership.kaal.json"), "utf8"));
    assert.deepEqual(own.owner, { kind: "capability", name: "Guard", id: createHash("sha256").update(node).digest("hex") });
    assert.deepEqual(own.paths, ["packages/kaal-guard/"]);
    const c = JSON.parse(readFileSync(join(PACKAGE, "installation.kaal.json"), "utf8"));
    assert.equal(c.format?.id, CONTRACT_FORMAT, "the contract is not an instance of the Installation Contract");
  });
});
