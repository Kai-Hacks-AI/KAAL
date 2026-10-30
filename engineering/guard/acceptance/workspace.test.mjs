// Guard outer acceptance, Engineering part: the Test Case that needs KAAL's installed and built
// workspace (guard/C46). guard/T46 checks guard/A13 and guard/A16 with kaal-engineer-skill. guard/T83,
// External's, is in external-workspace.test.mjs (guard/C129). The Guard lane runs
// this file only where npm ci has installed the workspace, never counting it as passed elsewhere
// (guard/C47). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { CHECK_SKILL, deliver, REPO, run, SKILL, target } from "./delivery.mjs";

describe("guard/F25 and guard/A16 [guard/I6, guard/I7] the Skill, judged with KAAL's workspace", () => {
  it("guard/T46 [guard/F19, guard/A13, guard/A16]: kaal-engineer-skill finds no standard or KAAL violation in the Embed Skill or the External variant", () => {
    // The checker judges its own Skill first: where it cannot (no installed and built workspace), the test is
    // blocked, never passed. The Guard lane runs this file only where the workspace is installed (guard/C47).
    const self = run(REPO, process.execPath, [CHECK_SKILL, dirname(dirname(CHECK_SKILL))]);
    assert.equal(self.status, 0, `blocked before behavioural assertion: kaal-engineer-skill cannot judge a Skill here (npm ci and the workspace build): ${self.output}`);
    const embed = join(REPO, "packages", "kaal-guard", "skills", "kaal-guard");
    assert.ok(existsSync(join(embed, "SKILL.md")), "blocked before behavioural assertion: kaal-guard has no skills/kaal-guard/SKILL.md");
    const e = run(REPO, process.execPath, [CHECK_SKILL, embed]);
    assert.equal(e.status, 0, `the Embed Skill: ${e.output}`);
    const t = target();
    const d = deliver(t);
    assert.equal(d.status, 0, d.output);
    t.git("checkout", "-q", "guard");
    assert.ok(existsSync(join(t.dir, SKILL, "SKILL.md")), `blocked before behavioural assertion: the delivery writes no Skill at ${SKILL}/`);
    const x = run(REPO, process.execPath, [CHECK_SKILL, join(t.dir, SKILL)]);
    assert.equal(x.status, 0, `the External variant: ${x.output}`);
  });

});
