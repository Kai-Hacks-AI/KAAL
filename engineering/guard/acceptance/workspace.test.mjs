// Guard outer acceptance, Engineering part: the Test Cases that need KAAL's installed and built
// workspace (guard/C46). guard/T46 checks guard/A13 and guard/A16 with kaal-engineer-skill; guard/T83
// verifies guard/F25 and guard/A16 where Core's realization is used at delivery. The Guard lane runs
// this file only where npm ci has installed the workspace, never counting it as passed elsewhere
// (guard/C47). Planned in PLAN; DO and CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { CHECK_SKILL, deliver, DELIVER, REPO, run, SKILL, target } from "./delivery.mjs";

/** Core's Agent Realization as KAAL's workspace builds it (core/A6). */
const AGENT = join(REPO, "packages", "kaal-core", "dist", "agent.js");

/** Every file under `dir`, by path relative to it with forward slashes. */
function files(dir, prefix = "") {
  return readdirSync(join(dir, prefix), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(dir, `${prefix}${e.name}/`) : [`${prefix}${e.name}`],
  );
}

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

  it("guard/T83 [guard/I6, guard/F25, guard/A16]: where Core's realization is available at delivery, an External delivery also writes the further deployments Core computes for the passed declaration, lists Core's pointers in GUARD.md, and leaves no Core or Hosting element in the target", async () => {
    assert.ok(existsSync(AGENT), "blocked before behavioural assertion: Core's realization (kaal-core/agent) is not built in KAAL's workspace");
    const core = await import(pathToFileURL(AGENT).href);
    assert.ok(existsSync(DELIVER), "blocked before behavioural assertion: there is no External delivery tooling (engineering/guard/external/deliver.mjs)");
    const t = target();
    const providers = ["claude-code", "codex", "copilot"];
    const agents = join(t.dir, "..", "agents.json");
    writeFileSync(agents, JSON.stringify({ providers }));
    const d = deliver(t, "--agents", agents);
    assert.equal(d.status, 0, d.output);
    t.git("checkout", "-q", "guard");
    const canonical = join(t.dir, SKILL);
    assert.ok(existsSync(join(canonical, "SKILL.md")), `blocked before behavioural assertion: the delivery writes no Skill at ${SKILL}/`);

    // What Core computes for this declaration, from the Skill as delivered at its canonical location.
    const source = Object.fromEntries(files(canonical).map((f) => [f, readFileSync(join(canonical, f))]));
    const plan = core.realize({ skills: [{ name: "kaal-guard", files: source }], providers, record: {}, present: {} });
    assert.deepEqual(plan.unknown, [], "Core does not know a provider the delivery was given");
    const further = plan.write.filter((w) => !w.path.startsWith(`${SKILL}/`));
    assert.ok(further.length > 0, "Core computes no further deployment for the declaration, so this test proves nothing");
    for (const w of further) {
      assert.ok(existsSync(join(t.dir, w.path)), `the delivery did not write ${w.path}, which Core computes`);
      assert.deepEqual(readFileSync(join(t.dir, w.path)), Buffer.from(w.bytes), `${w.path} is not what Core computes`);
    }
    const guide = readFileSync(join(t.dir, "GUARD.md"), "utf8");
    for (const p of plan.pointers) assert.ok(guide.includes(p.target), `GUARD.md does not list Core's pointer for ${p.provider}`);

    // No Core or Hosting element reaches the target: no state, no declaration, no name.
    const changed = t.git("diff", "--name-only", "main", "guard").output.trim().split("\n").filter(Boolean);
    assert.deepEqual(changed.filter((p) => p.startsWith(".kaal/")), [], "the delivery left Core's declaration or state in the target");
    for (const p of changed) assert.doesNotMatch(readFileSync(join(t.dir, p), "utf8"), /kaal-core|kaal-hosting|kaal-graph/, `${p} names a Core or Hosting element`);
    assert.ok(!existsSync(join(t.dir, "node_modules")), "the delivery installed packages");
  });
});
