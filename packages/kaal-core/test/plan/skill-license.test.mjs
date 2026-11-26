// core/C151 planned outer tests: a Skill may bundle a license file. Immutable to DO and CHECK.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

async function skill() {
  return import("kaal-core/skill").catch((e) => assert.fail(`blocked before behavioural assertion: kaal-core exports no ./skill (${e.code ?? e.message})`));
}

describe("Skill license (core/C151)", () => {
  it("core/T125 [core/F117, core/A60]: a top-level LICENSE, LICENSE.md and LICENSE.txt are not layout findings, while a directory LICENSE/, license, LICENSES and LICENSE-notes still are", async () => {
    const { judgeLayout } = await skill();
    const found = (...paths) => judgeLayout(["SKILL.md", ...paths]).map((f) => f.path);
    assert.deepEqual(found("LICENSE", "LICENSE.md", "LICENSE.txt"), []);
    assert.deepEqual(found("LICENSE", "references/a.md", "scripts/x.mjs", "assets/y.png"), []);
    assert.deepEqual(found("LICENSE/terms.txt").length > 0, true, "a directory of that name is a finding");
    for (const bad of ["license", "LICENSES", "LICENSE-notes", "NOTICE"]) {
      assert.ok(found(bad).includes(bad), `${bad} is still a finding`);
    }
  });

  it("core/T126 [core/F118, core/A61]: the Definition states that a Skill may bundle a license file and that by default it is the package's license", () => {
    const text = readFileSync(new URL("../../payload/core/Skill-Standard.md", import.meta.url), "utf8");
    assert.ok(/LICENSE/.test(text), "the Definition names the license file");
    assert.ok(/default/i.test(text) && /package/i.test(text), "and states the default");
  });
});
