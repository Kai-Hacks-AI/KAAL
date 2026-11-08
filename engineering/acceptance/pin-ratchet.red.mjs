// Engineering RED Case for foundation/C19 (pin ratchet) against engineering/acceptance/embed.test.mjs.
// Static: the Cases read the source of the single-copy assertion; they run nothing.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const embed = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "embed.test.mjs"), "utf8");
const nestedGuard = /assert\.ok\(!existsSync\(join\(host, "node_modules", "kaal-core", "node_modules"\)\)/;

describe("foundation/C19 pin ratchet in the acceptance checks", () => {
  it("T1 (RED until the fix): a nested older Foundation under a consumer is a pin-behind report, not an unconditional failure", () => {
    assert.doesNotMatch(embed, nestedGuard, "embed.test.mjs still fails every nested copy under kaal-core");
    assert.match(embed, /pin-behind/, "the older-pin case is reported as pin-behind");
  });
  it("T2 (control): a duplicate of the same version stays a hard failure", () => {
    assert.match(embed, /one kaal-foundation, one kaal-hosting and one yaml|same version|duplicate/i);
  });
  it("T3 (control): the host holds no kaal-graph", () => {
    assert.match(embed, /the host holds no \$\{graph\}/);
  });
});
