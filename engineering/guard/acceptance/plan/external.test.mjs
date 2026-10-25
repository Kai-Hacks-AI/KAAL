// Guard outer acceptance, Engineering part: External. T3 validates I6, verifies N5 and F8 for a
// target, and checks A10; guard/T56 verifies guard/F25 and guard/F26 for the delivered Skill. guard/T46 and
// guard/T83 need KAAL's installed workspace, so they are in workspace.test.mjs (guard/C46).
// KAAL Engineering delivers Guard naked into a fresh target as one Change. Planned in PLAN; DO and
// CHECK do not change it.
import assert from "node:assert/strict";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { deliver, DELIVER, HERE, own, run, SKILL, target } from "./delivery.mjs";

describe("guard/I6 External delivers Guard naked", () => {
  it("guard/T3 [guard/I6, guard/N5, guard/F8, guard/A10]: delivers one Change with working hooks and CI and local docs, and leaves nothing from KAAL", () => {
    assert.ok(existsSync(DELIVER), "blocked before behavioural assertion: there is no External delivery tooling (engineering/guard/external/deliver.mjs)");
    const t = target();
    const build = t.read(".github/workflows/build.yml");
    const before = t.read("package.json");
    const checks = join(t.dir, "..", "checks.json");
    writeFileSync(checks, JSON.stringify({ unit: { command: "npm test", runs: ["local", "ci"] } }));

    const d = run(HERE, process.execPath, [DELIVER, "--target", t.dir, "--checks", checks, "--branch", "guard"], t.env);
    assert.equal(d.status, 0, d.output);

    // One Change: a branch with one commit on main.
    assert.equal(t.git("rev-list", "--count", "main..guard").output.trim(), "1");
    const changed = t.git("diff", "--name-only", "main", "guard").output.trim().split("\n").filter(Boolean);
    assert.ok(changed.length > 0 && changed.length <= 5, `N5: the delivery is not a handful of files: ${changed}`);
    assert.ok(changed.includes(".githooks/pre-push"), "no hook delivered");
    assert.ok(changed.some((p) => p.startsWith(".github/workflows/")), "no CI delivered");
    assert.ok(changed.some((p) => /\.md$/i.test(p)), "no local docs delivered");

    // Naked: nothing from KAAL, and nothing of the target's overwritten.
    t.git("checkout", "-q", "guard");
    // The delivered Skill's own name, kaal-guard, and its canonical path are not KAAL elements (guard/F24, guard/F25).
    for (const p of changed) assert.doesNotMatch(own(t.read(p)), /kaal/i, `${p} mentions KAAL`);
    assert.equal(t.read("package.json"), before, "the delivery changed the target's dependencies");
    assert.equal(t.read(".github/workflows/build.yml"), build, "the delivery overwrote the target's workflow");
    assert.ok(!existsSync(join(t.dir, "node_modules")), "the delivery installed packages");

    // Working: the delivered hook blocks a failing check and lets a passing one through.
    t.git("config", "core.hooksPath", ".githooks");
    t.write("note.txt", "x\n");
    t.git("add", "-A");
    t.git("commit", "-q", "-m", "note");
    assert.notEqual(run(t.dir, "git", ["push", "origin", "guard"], { ...t.env, UNIT_STATUS: "1" }).status, 0, "the delivered hook let a failing check through");
    assert.equal(run(t.dir, "git", ["push", "origin", "guard"], { ...t.env, UNIT_STATUS: "0" }).status, 0, "the delivered hook blocked a passing check");
  });

  // Where Core is used at delivery, the deployments Core computes for the passed declaration are guard/T83's.
  it("guard/T56 [guard/I6, guard/F25, guard/F26, guard/A16]: an External delivery writes the Skill variant at the canonical location, names neither KAAL nor npm, its hook's reminder names the canonical path, and a target's existing Skill and instruction files are untouched", () => {
    assert.ok(existsSync(DELIVER), "blocked before behavioural assertion: there is no External delivery tooling (engineering/guard/external/deliver.mjs)");
    const t = target();
    const theirs = {
      "AGENTS.md": "# The target's agents\n",
      "CLAUDE.md": "# The target's Claude\n",
      ".claude/skills/mine/SKILL.md": "---\nname: mine\ndescription: the target's.\n---\n",
      ".agents/skills/other/SKILL.md": "---\nname: other\ndescription: the target's.\n---\n",
    };
    for (const [p, c] of Object.entries(theirs)) t.write(p, c);
    t.git("add", "-A");
    t.git("commit", "-q", "-m", "the target's own skills and instruction files");

    const d = deliver(t);
    assert.equal(d.status, 0, d.output);
    t.git("checkout", "-q", "guard");
    const changed = t.git("diff", "--name-only", "main", "guard").output.trim().split("\n").filter(Boolean);
    const skill = changed.filter((p) => p.startsWith(`${SKILL}/`));
    assert.ok(skill.includes(`${SKILL}/SKILL.md`), `the delivery wrote no Skill at ${SKILL}/`);
    assert.match(t.read(`${SKILL}/SKILL.md`), /^---\r?\nname: kaal-guard\r?\n(?:[^\n]*\n)*?description: \S/, "the delivered Skill does not begin with the standard's frontmatter");
    for (const p of skill) {
      assert.doesNotMatch(own(t.read(p)), /kaal/i, `${p} names a KAAL element`);
      assert.doesNotMatch(t.read(p), /\bnpm\b|\bnpx\b|@kaihacksai/, `${p} names npm or an npm package`);
    }
    assert.deepEqual(changed.filter((p) => !p.startsWith(`${SKILL}/`) && /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$|copilot-instructions|^\.(claude|cursor|codex|gemini)\//.test(p)), [], "the delivery wrote an instruction file or a supplier location");
    for (const [p, c] of Object.entries(theirs)) assert.equal(t.read(p), c, `the delivery changed the target's ${p}`);

    // The delivered hook's reminder names the canonical path when a check fails.
    t.git("config", "core.hooksPath", ".githooks");
    t.write("note.txt", "x\n");
    t.git("add", "-A");
    t.git("commit", "-q", "-m", "note");
    const push = run(t.dir, "git", ["push", "origin", "guard"], { ...t.env, UNIT_STATUS: "1" });
    assert.notEqual(push.status, 0, "the delivered hook let a failing check through");
    assert.match(push.output, new RegExp(SKILL.replaceAll(".", "\\.")), "the delivered hook's reminder does not name the canonical path");

    // A Skill already at the canonical location is kept and reported.
    const u = target();
    const mine = "---\nname: kaal-guard\ndescription: the target's own.\n---\n";
    u.write(`${SKILL}/SKILL.md`, mine);
    u.git("add", "-A");
    u.git("commit", "-q", "-m", "a Skill of the target's own");
    const kept = deliver(u);
    assert.equal(kept.status, 0, kept.output);
    u.git("checkout", "-q", "guard");
    assert.equal(u.read(`${SKILL}/SKILL.md`), mine, "the delivery overwrote the target's Skill");
    assert.match(kept.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "the delivery does not report the Skill it kept");
  });
});
