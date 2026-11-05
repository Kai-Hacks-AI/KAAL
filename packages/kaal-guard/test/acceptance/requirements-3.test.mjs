// Part 3 of 4 of the Requirements verification. guard/C142 moved these cases here from requirements.test.mjs, unchanged, so that node --test runs the four parts in parallel.
// kaal-guard outer acceptance, Requirements verification: each test (T…) names the Functional (F…)
// or Nonfunctional (N…) Requirement it verifies; each describe repeats that Requirement's own trace to
// Intent (I…), for reading only. N1 is
// these tests on Linux, macOS and Windows; N6 is verified by T30. Planned in PLAN; DO and CHECK do not change them.
import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { CONFIG, consumer, declaration, exec, NAME, PACKAGE, RECORD, sha256, SKILL, tree, verdicts } from "./harness.mjs";
import { exit, given, state, snapshot, LOUD, extra, named } from "./requirements-support.mjs";

// guard/T45–guard/T59 are planned in guard/C12 and written in guard/C13, before any code. They run like every
// other Test Case: until their Changes land they are RED, and that RED is their evidence.


describe("guard/F19 [guard/I7] Guard's Skill", () => {
  it("guard/T45 [guard/F19, guard/A13, guard/N11]: the packed package carries skills/kaal-guard/SKILL.md, named kaal-guard, with BASS sections and no script, and names no consumer", () => {
    const c = consumer();
    const { source, files } = c.skill();
    const text = readFileSync(join(source, "SKILL.md"), "utf8");
    const front = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
    assert.ok(front, "SKILL.md does not begin with the standard's frontmatter");
    assert.match(front[1], /^name: kaal-guard$/m, "the Skill is not named kaal-guard");
    assert.match(front[1], /^description: \S/m, "the Skill has no description");
    for (const section of ["Bare", "Agent", "Skill", "Script"]) assert.match(text, new RegExp(`^#{1,6} [^\\n]*\\b${section}\\b`, "m"), `the Skill has no ${section} section (BASS)`);
    // Script: none (guard/F19), and nothing in the Skill runs.
    assert.deepEqual(files.filter((f) => f.startsWith("scripts/") || /\.(mjs|cjs|js|sh|ps1|py)$/.test(f)), [], "the Skill carries a script");
    for (const f of files) {
      const body = readFileSync(join(source, f), "utf8");
      assert.doesNotMatch(body, /\bKAAL\b|Kai-Hacks-AI/, `${f} names a particular consumer`);
    }
    const manifest = JSON.parse(readFileSync(join(c.dir, "node_modules", ...NAME.split("/"), "package.json"), "utf8"));
    assert.deepEqual(Object.keys(manifest.dependencies ?? {}), [], "the Skill brought a runtime dependency (guard/N11)");
  });
});

describe("guard/F21 and guard/F22 [guard/I7, guard/I1, guard/I2] reminder, unchanged verdicts", () => {
  /** A consumer with one check that runs LOUD with the given exit status, for the hook and CI. */
  const loud = (status, outcomes) => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ x: { command: `node checks/loud.mjs ${status}`, runs: ["hook", "ci"], ...(outcomes ? { held: Object.keys(outcomes).map(Number) } : {}) } });
    c.commit("loud");
    return c;
  };

  it("guard/T47 [guard/F21, guard/F22]: a failing and a cannot-judge local run keep their exit statuses, verdict lines and the check's own stdout and stderr byte for byte, and add exactly one reminder line naming an existing Skill path", () => {
    // No Skill is deployed here, so the reminder names the package's copy (guard/F21).
    for (const [status, verdict] of [[1, "fail"], [2, "cannot judge"]]) {
      const c = loud(status);
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, status, `${verdict}: the exit status changed`);
      assert.equal(verdicts(r.stdout).x?.verdict, verdict, `${verdict}: the verdict changed`);
      const lines = r.stdout.split(/\r?\n/).filter((l) => l.trim());
      assert.match(lines[lines.findIndex((l) => verdicts(l).x) + 1] ?? "", /^\s+do: \S/, `${verdict}: the do: line moved or vanished`);
      assert.equal(r.stderr, "the check's stdout\nthe check's stderr\n", `${verdict}: the check's own output did not reach the terminal byte for byte`);
      const reminder = extra(r.stdout);
      assert.equal(reminder.length, 1, `${verdict}: not exactly one reminder line: ${JSON.stringify(reminder)}`);
      assert.equal(lines.at(-1), reminder[0], `${verdict}: the reminder does not follow the verdict lines`);
      const skill = named(c, reminder[0]);
      assert.ok(skill.exists, `${verdict}: the reminder names ${skill.path}, which does not exist`);
    }
    const both = consumer();
    both.write("checks/loud.mjs", LOUD);
    both.checks({ f: { command: "node checks/loud.mjs 1", runs: ["hook"] }, cj: { command: "node checks/loud.mjs 2", runs: ["hook"] } });
    both.commit("both");
    assert.equal(extra(both.guard(["run", "--hook"]).stdout).length, 1, "a run with a fail and a cannot judge does not add exactly one reminder line");
  });

  // It holds before the reminder exists, and it keeps holding once the reminder and the Skill are there.
  it("guard/T48 [guard/F21]: a run of only pass, not applicable or held adds no reminder", () => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ p: { command: "node checks/loud.mjs 0", runs: ["hook"] }, na: { command: "node checks/loud.mjs 3", runs: ["hook"] }, h: { command: "node checks/loud.mjs 4", runs: ["hook"], held: [4] } });
    c.commit("quiet");
    for (const step of ["before init", "after init"]) {
      if (step === "after init") assert.equal(c.guard(["init"]).status, 0, "init");
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, 0, r.output);
      assert.deepEqual(Object.fromEntries(Object.entries(verdicts(r.stdout)).map(([k, v]) => [k, v.verdict])), { p: "pass", na: "not applicable", h: "held" }, step);
      assert.deepEqual(extra(r.stdout), [], `${step}: a run with no fail and no cannot judge added a line`);
      assert.doesNotMatch(r.output, /skills[\\/]kaal-guard/, `${step}: a run with no fail and no cannot judge names the Skill`);
    }
  });

  // Planned in guard/C46: guard/T47 sees no deployed Skill, so only this test sees the reminder name the deployed one.
  it("guard/T82 [guard/F21, guard/F23, guard/A15]: after a standalone init deploys the Skill, a failing and a cannot-judge local run's reminder names the deployed .agents/skills/kaal-guard/SKILL.md, not the package's copy, and with --github so do the annotations and the step summary", () => {
    for (const [status, verdict] of [[1, "fail"], [2, "cannot judge"]]) {
      const c = loud(status);
      c.skill();
      assert.equal(c.guard(["init"]).status, 0, `${verdict}: init`);
      assert.ok(existsSync(join(c.dir, SKILL, "SKILL.md")), `blocked before behavioural assertion: init deployed no Skill at ${SKILL}/`);
      const r = c.guard(["run", "--hook"]);
      assert.equal(r.status, status, `${verdict}: the exit status changed`);
      const reminder = extra(r.stdout);
      assert.equal(reminder.length, 1, `${verdict}: not exactly one reminder line: ${JSON.stringify(reminder)}`);
      const skill = named(c, reminder[0]);
      assert.equal(skill.inside, `${SKILL}/SKILL.md`, `${verdict}: the reminder names ${skill.path}, not the deployed ${SKILL}/SKILL.md`);
      assert.ok(skill.exists, `${verdict}: the reminder names ${skill.path}, which does not exist`);

      const summary = join(c.root, "summary.md");
      writeFileSync(summary, "");
      const g = c.guard(["run", "--check", "x", "--github"], { GITHUB_STEP_SUMMARY: summary });
      assert.equal(g.status, status, `${verdict}: the exit status changed with --github`);
      const deployed = new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`);
      const errors = g.stdout.split(/\r?\n/).filter((l) => l.startsWith("::error"));
      assert.ok(errors.length > 0, `${verdict}: no error annotation`);
      for (const l of errors) assert.match(l, deployed, `${verdict}: an annotation does not name the deployed Skill: ${l}`);
      assert.match(readFileSync(summary, "utf8"), deployed, `${verdict}: the step summary does not name the deployed Skill`);
    }
  });
});

describe("guard/F43 [guard/I7, guard/N4] an earlier opportunity, named in CI", () => {
  /** The lines a run adds about the pre-push hook, whatever else it prints; an annotation is a workflow command, not a line. */
  const hookLines = (text) => text.split(/\r?\n/).filter((l) => /pre-push hook/i.test(l) && !l.startsWith("::"));
  /** What the line must never claim: that the hook was missing, absent, not installed, skipped or did not run. */
  const CLAIM = /missing|absent|not installed|skipped|did not run|was not run|never ran/i;

  /** A consumer with one check, declared to run on the given surfaces, that exits with the given status. */
  const one = (runs, status, outcomes) => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ x: { command: `node checks/loud.mjs ${status}`, runs, ...(outcomes ? { held: Object.keys(outcomes).map(Number) } : {}) } });
    c.commit("one");
    return c;
  };

  it("guard/T135 [guard/F43, guard/F22]: in CI a failing check that runs in the hook and in CI gets one conditional line naming it, the hook, init --hook and the local rerun, in the output, the annotation and the step summary, and it never claims the hook was missing; other checks and verdicts get none, and nothing else changes", () => {
    const c = one(["hook", "ci"], 1);
    const summary = join(c.root, "summary.md");
    writeFileSync(summary, "");
    const r = c.guard(["run", "--ci", "--github"], { GITHUB_STEP_SUMMARY: summary });
    assert.equal(r.status, 1, "the exit status changed");
    assert.equal(verdicts(r.stdout).x?.verdict, "fail", "the verdict changed");
    const lines = hookLines(r.stdout);
    assert.equal(lines.length, 1, `not exactly one earlier-opportunity line: ${JSON.stringify(lines)}`);
    const [line] = lines;
    assert.match(line, /\bx\b/, "the line does not name the check");
    assert.match(line, /npx kaal-guard init --hook/, "the line does not give init --hook");
    assert.match(line, /npx kaal-guard run --check x\b/, "the line does not give the local rerun");
    assert.match(line, /\bif\b/i, "the line does not give the next step as a condition");
    assert.doesNotMatch(line, CLAIM, "the line claims the hook was missing or did not run");
    const all = r.stdout.split(/\r?\n/).filter((l) => l.trim());
    assert.ok(all.indexOf(line) > all.findIndex((l) => verdicts(l).x), "the line does not follow the verdict lines");
    const annotation = r.stdout.split(/\r?\n/).filter((l) => l.startsWith("::error") && l.includes("fail%3A x"));
    assert.equal(annotation.length, 1, "no error annotation for the failing check");
    assert.match(annotation[0], /pre-push hook/i, "the fail annotation does not carry the line");
    assert.doesNotMatch(annotation[0], CLAIM, "the annotation claims the hook was missing or did not run");
    const text = readFileSync(summary, "utf8");
    assert.equal(hookLines(text).length, 1, "the step summary does not carry the line exactly once");
    assert.doesNotMatch(hookLines(text)[0], CLAIM, "the summary claims the hook was missing or did not run");

    // Nothing but that line is added: the same check declared for CI only prints the same output otherwise.
    const only = one(["ci"], 1).guard(["run", "--ci", "--github"]);
    assert.equal(only.status, r.status, "the exit status differs from the ci-only check");
    assert.deepEqual(r.stdout.split(/\r?\n/).filter((l) => !/^kaal-guard: x also runs in the pre-push hook/.test(l)).map((l) => l.replace(/; kaal-guard: x also runs in the pre-push hook.*$/, "")), only.stdout.split(/\r?\n/), "the output other than the line differs from the ci-only check");

    // Negatives: the same ask, where no line belongs.
    const quiet = (c, args, step) => {
      const summary = join(c.root, "summary.md");
      writeFileSync(summary, "");
      const r = c.guard(args, { GITHUB_STEP_SUMMARY: summary });
      assert.deepEqual(hookLines(r.output), [], `${step}: an earlier-opportunity line appeared`);
      assert.deepEqual(hookLines(readFileSync(summary, "utf8")), [], `${step}: the step summary carries the line`);
      return r;
    };
    quiet(one(["ci"], 1), ["run", "--ci", "--github"], "a failing ci-only check");
    quiet(one(["hook", "ci"], 1), ["run", "--hook"], "the same failing check in the hook");
    quiet(one(["hook", "ci"], 1), ["run", "--check", "x"], "the same failing check run locally by name");
    quiet(one(["hook", "ci"], 0), ["run", "--ci", "--github"], "a pass");
    quiet(one(["hook", "ci"], 3), ["run", "--ci", "--github"], "a not applicable");
    quiet(one(["hook", "ci"], 4, { 4: "held" }), ["run", "--ci", "--github"], "a held");
    const cannot = quiet(one(["hook", "ci"], 2), ["run", "--ci", "--github"], "a cannot judge");
    assert.equal(cannot.status, 2, "a cannot judge changed its exit status");
  });
});

describe("guard/F23 [guard/I5, guard/I7] standalone installation", () => {
  /** What lies under .agents/ and the like: every file whose path starts with one of these. */
  const under = (c, ...prefixes) => c.files().filter((p) => prefixes.some((x) => p.startsWith(x)));

  it("guard/T50 [guard/F23, guard/F24, guard/N10, guard/A14]: standalone init in a fresh repository installs the Skill only at .agents/skills/kaal-guard/, byte-identical to its catalogued content and equal to the package's source", () => {
    const c = consumer();
    const { source, files } = c.skill();
    const before = c.files();
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    const written = c.files().filter((p) => !before.includes(p) && p !== RECORD);
    assert.deepEqual(written, files.map((f) => `${SKILL}/${f}`), "init installed the Skill elsewhere, in part, or beside other files");
    assert.match(c.read(`${SKILL}/SKILL.md`), /^---\r?\nname: kaal-guard\r?\n/, "the installed Skill is not a SKILL.md named kaal-guard (guard/F24)");
    const catalogue = c.catalogue();
    const assets = c.installation();
    for (const f of files) {
      const path = `${SKILL}/${f}`;
      const bytes = readFileSync(join(c.dir, path));
      assert.ok(bytes.equals(readFileSync(join(source, f))), `${path} differs from the package's source`);
      assert.ok((catalogue[path] ?? []).includes(sha256(bytes)), `${path} is not catalogued content`);
      assert.deepEqual(assets[path], { sha256: sha256(bytes), version: c.version() }, `${path} is not registered with its SHA-256 and version`);
    }
  });

  it("guard/T51 [guard/F23, guard/F8, guard/A14]: init keeps a pre-existing .agents/skills/kaal-guard/SKILL.md, reports it, and installs no other Skill file", () => {
    const c = consumer();
    c.skill();
    const mine = "---\nname: kaal-guard\ndescription: the consumer's own.\n---\n\nMine.\n";
    c.write(`${SKILL}/SKILL.md`, mine);
    c.commit("a Skill of the consumer's own");
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.equal(c.read(`${SKILL}/SKILL.md`), mine, "init overwrote the consumer's SKILL.md");
    assert.match(init.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "init does not report the kept SKILL.md");
    assert.deepEqual(under(c, ".agents/"), [`${SKILL}/SKILL.md`], "init installed part of the Skill beside the consumer's");
    assert.deepEqual(Object.keys(c.installation()).filter((p) => p.startsWith(".agents/")), [], "init registered a Skill file it did not write");
  });

  it("guard/T52 [guard/F23, guard/F12, guard/A14]: upgrade moves unmodified Skill files forward and keeps a modified one; remove deletes only unmodified Skill files and the directories it emptied, and leaves other skills in .agents/skills/ untouched", () => {
    const c = consumer();
    const { source, files } = c.skill();
    c.write(".agents/skills/other/SKILL.md", "---\nname: other\ndescription: another skill.\n---\n");
    c.commit("another skill");
    assert.equal(c.guard(["init"]).status, 0, "init");
    c.commit("guard");
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    for (const f of files) assert.ok(readFileSync(join(c.dir, SKILL, f)).equals(readFileSync(join(source, f))), `upgrade left ${SKILL}/${f} behind the installed version's source`);
    const edited = `${c.read(`${SKILL}/SKILL.md`)}\nThe consumer's line.\n`;
    c.write(`${SKILL}/SKILL.md`, edited);
    assert.equal(c.guard(["upgrade"]).status, 0, "upgrade");
    assert.equal(c.read(`${SKILL}/SKILL.md`), edited, "upgrade overwrote a modified Skill file");
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(under(c, ".agents/"), [`${SKILL}/SKILL.md`, ".agents/skills/other/SKILL.md"], "remove did not delete exactly the unmodified Skill files");
    assert.equal(c.read(".agents/skills/other/SKILL.md"), "---\nname: other\ndescription: another skill.\n---\n", "remove touched another skill");

    const d = consumer();
    d.write(".agents/skills/other/SKILL.md", "---\nname: other\ndescription: another skill.\n---\n");
    assert.equal(d.guard(["init"]).status, 0, "init");
    assert.equal(d.guard(["remove"]).status, 0, "remove");
    assert.ok(!d.exists(SKILL), `remove left ${SKILL}/, which it emptied`);
    assert.ok(d.exists(".agents/skills/other/SKILL.md"), "remove deleted a directory it did not empty");
  });

  it("guard/T57 [guard/F23, guard/F8]: a modified deployment is kept and reported while the others move forward, and remove leaves it", () => {
    const c = consumer();
    const { source, files } = c.skill();
    assert.equal(c.guard(["init"]).status, 0, "init");
    c.commit("guard");
    const registered = c.installation()[`${SKILL}/SKILL.md`];
    const edited = `${c.read(`${SKILL}/SKILL.md`)}\nThe consumer's line.\n`;
    c.write(`${SKILL}/SKILL.md`, edited);
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "upgrade does not report the modified deployment");
    assert.deepEqual(c.installation()[`${SKILL}/SKILL.md`], registered, "upgrade re-registered the modified deployment");
    for (const f of files.filter((f) => f !== "SKILL.md")) assert.ok(readFileSync(join(c.dir, SKILL, f)).equals(readFileSync(join(source, f))), `upgrade did not move ${SKILL}/${f} forward`);
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.equal(c.read(`${SKILL}/SKILL.md`), edited, "remove deleted the modified deployment");
    assert.match(rm.output, new RegExp(`${SKILL.replaceAll(".", "\\.")}/SKILL\\.md`), "remove does not report the modified deployment it kept");
  });

  it("guard/T53 [guard/F23, guard/N10, guard/N12, guard/A14]: the standalone lifecycle writes no supplier-specific location, even where such directories exist, and its report names the canonical path", () => {
    const c = consumer();
    c.skill();
    const suppliers = [".claude/skills/", ".github/skills/", ".cursor/", ".codex/", ".gemini/"];
    c.write(".claude/skills/mine/SKILL.md", "---\nname: mine\ndescription: the consumer's.\n---\n");
    c.write(".github/skills/mine/SKILL.md", "---\nname: mine\ndescription: the consumer's.\n---\n");
    c.commit("supplier locations of the consumer's own");
    const theirs = Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)]));
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.match(init.output, new RegExp(SKILL.replaceAll(".", "\\.")), "init does not name the canonical path");
    for (const command of ["upgrade", "remove"]) {
      assert.equal(c.guard([command]).status, 0, command);
      assert.deepEqual(Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)])), theirs, `${command} wrote a supplier-specific location`);
    }
    mkdirSync(join(c.dir, ".claude", "skills"), { recursive: true });
    assert.equal(c.guard(["init"]).status, 0, "init");
    assert.deepEqual(Object.fromEntries(under(c, ...suppliers).map((p) => [p, c.read(p)])), theirs, "init wrote a supplier-specific location");
  });
});

describe("guard/F26 [guard/I1, guard/I7] agent instruction files", () => {
  it("guard/T54 [guard/F26]: init, upgrade and remove create, edit and remove no AGENTS.md, CLAUDE.md or other instruction file; init reports the canonical path and how an agent reaches it, and proposes no supplier-specific pointer", () => {
    const instructions = ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md", "GEMINI.md"];
    const fresh = consumer();
    fresh.skill();
    const init = fresh.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(instructions.filter((p) => fresh.exists(p)), [], "init created an instruction file");
    assert.match(init.output, new RegExp(SKILL.replaceAll(".", "\\.")), "init does not report the canonical path");
    assert.match(init.output, /reminder/i, "init does not say that an agent reaches the Skill through the reminder");
    assert.doesNotMatch(init.output, /CLAUDE\.md|\.claude[\\/]|copilot-instructions/, "init proposes a supplier-specific pointer");

    const c = consumer();
    for (const p of instructions) c.write(p, `# ${p}, the consumer's own\n`);
    c.commit("instruction files of the consumer's own");
    for (const command of ["init", "upgrade", "remove"]) {
      assert.equal(c.guard([command]).status, 0, command);
      for (const p of instructions) assert.equal(c.exists(p) ? c.read(p) : null, `# ${p}, the consumer's own\n`, `${command} changed ${p}`);
    }
  });
});

describe("guard/N1 [guard/I5] runtime prerequisite", () => {
  it("guard/T59 [guard/N1, guard/F27]: the package declares Node >=24; on an older Node every command exits as cannot judge, naming Node 24 as the next step, and the README states the prerequisite", () => {
    const c = given({ x: { command: exit(0), runs: ["hook", "ci"] } });
    const installed = join(c.dir, "node_modules", ...NAME.split("/"));
    assert.equal(JSON.parse(readFileSync(join(installed, "package.json"), "utf8")).engines?.node, ">=24", "the package does not declare Node >=24");
    assert.match(readFileSync(join(installed, "README.md"), "utf8"), /Node(?:\.js)? 24\b/, "the README does not state Node 24");
    assert.match(readFileSync(join(installed, "contract.json"), "utf8"), /\b24\b/, "the contract does not state the runtime prerequisite");
    // An older Node, as the running command sees it: the preload replaces only the reported version.
    const preload = join(c.root, "node20.mjs");
    writeFileSync(preload, `Object.defineProperty(process, "versions", { value: { ...process.versions, node: "20.11.0" } });\nObject.defineProperty(process, "version", { value: "v20.11.0" });\n`);
    const old = { NODE_OPTIONS: `--import="${pathToFileURL(preload).href}"` };
    for (const args of [["run", "--hook"], ["run", "--check", "x"], ["verify"], ["init"], ["upgrade"], ["remove"]]) {
      const before = snapshot(c);
      const r = c.guard(args, old);
      assert.equal(r.status, 2, `${args.join(" ")} on Node 20: ${r.output}`);
      assert.match(r.output, /cannot judge/, `${args.join(" ")} on Node 20 is not cannot judge`);
      assert.match(r.output, /Node(?:\.js)? 24/, `${args.join(" ")} on Node 20 does not name Node 24 as the next step`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} on Node 20 changed something`);
    }
  });
});
