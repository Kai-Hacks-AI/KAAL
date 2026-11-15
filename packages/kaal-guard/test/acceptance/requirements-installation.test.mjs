// kaal-guard outer acceptance, Requirements verification, part 3: the Skill, reminders, standalone installation, agent files,
// the prerequisites, and the later corrections (guard/F19 to guard/F27, guard/N1, guard/F2).
// Split from requirements.test.mjs so `node --test` runs the parts in parallel (guard/C142); no Case changed.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";
import { CONFIG, consumer, declaration, exec, HOSTING, NAME, RECORD, sha256, SKILL, verdicts } from "./harness.mjs";
import { exit, given, state, hooksPath, snapshot, LOUD, extra, named, link, cannotJudge } from "./requirements-support.mjs";

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
    assert.deepEqual(Object.keys(manifest.dependencies ?? {}), [HOSTING.name], "the Skill brought a runtime dependency beyond the declared Hosting (guard/N11)");
  });
});

describe("guard/F21 and guard/F22 [guard/I7, guard/I1, guard/I2] reminder, unchanged verdicts", () => {
  /** A consumer with one check that runs LOUD with the given exit status, for the hook and CI. */
  const loud = (status, outcomes) => {
    const c = consumer();
    c.write("checks/loud.mjs", LOUD);
    c.checks({ x: { command: `node checks/loud.mjs ${status}`, runs: ["hook", "ci"], ...(outcomes ? { outcomes } : {}) } });
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
    c.checks({ p: { command: "node checks/loud.mjs 0", runs: ["hook"] }, na: { command: "node checks/loud.mjs 3", runs: ["hook"] }, h: { command: "node checks/loud.mjs 4", runs: ["hook"], outcomes: { 4: "held" } } });
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

// guard/T84–guard/T92 are planned in guard/C61, from the 0.0.2 release review, and written in guard/C63, before

describe("guard/F28 [guard/I2, guard/I3, guard/I5] declarations that are not regular files", () => {
  it("guard/T84 [guard/F28, guard/F10]: a declaration that is a symbolic link, and a directory named <name>.md, in the configuration directory each make run --hook, run --ci and run --check cannot judge, naming the entry; neither is skipped", () => {
    const entries = {
      "linked.md": (c) => {
        c.write("elsewhere/linked.md", declaration({ command: exit(1, "the linked check fails"), runs: ["hook", "ci"] }));
        return link(c, join("..", "..", "..", "elsewhere", "linked.md"), `${CONFIG}/linked.md`);
      },
      "folder.md": (c) => (mkdirSync(join(c.dir, CONFIG, "folder.md")), writeFileSync(join(c.dir, CONFIG, "folder.md", "inside.txt"), "not a declaration\n"), true),
    };
    for (const [entry, make] of Object.entries(entries)) {
      const c = given({ ok: { command: exit(0), runs: ["hook", "ci"] } });
      if (!make(c)) continue;
      c.commit(entry);
      for (const args of [["run", "--hook"], ["run", "--ci"], ["run", "--check", "ok"]]) cannotJudge(c.guard(args), entry, `${entry}: ${args.join(" ")}`);
    }
  });
});

describe("guard/F27 and guard/F29 [guard/I5] Guard's bytes and mode in every clone", () => {
  it("guard/T85 [guard/F27, guard/F29, guard/F12]: in a clone with core.autocrlf=true, the hook, the workflow and the Skill Guard installed and committed keep the bytes Guard wrote: the hook runs under sh, and upgrade and remove treat each file as Guard's unmodified file", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.commit("Guard installed");
    assert.equal(c.git("push", "-q", "--no-verify", "origin", "main").status, 0);
    const clone = join(c.root, "crlf");
    const cloned = c.git("-c", "core.autocrlf=true", "clone", "-q", "-b", "main", "--config", "core.autocrlf=true", c.remote, clone);
    assert.equal(cloned.status, 0, cloned.output);
    assert.equal(c.git("-C", clone, "config", "--get", "core.autocrlf").stdout.trim(), "true");

    const assets = c.installation();
    for (const [path, { sha256: hash }] of Object.entries(assets)) {
      const bytes = readFileSync(join(clone, path));
      assert.ok(!bytes.includes("\r\n"), `the clone rewrote ${path} with CRLF line endings`);
      assert.equal(sha256(bytes), hash, `${path} in the clone is not the bytes Guard wrote`);
    }
    const sh = exec(clone, "sh", ["-n", ".githooks/pre-push"]);
    if (sh.status !== null) assert.equal(sh.status, 0, `the cloned hook does not parse under sh:\n${sh.output}`);

    const up = c.guard(["upgrade"], {}, clone);
    assert.equal(up.status, 0, up.output);
    for (const path of Object.keys(assets)) assert.ok(!up.output.includes(`kept ${path}`), `upgrade in the clone calls ${path} modified:\n${up.output}`);
    const rm = c.guard(["remove"], {}, clone);
    assert.equal(rm.status, 0, rm.output);
    for (const path of Object.keys(assets)) assert.ok(!existsSync(join(clone, path)), `remove in the clone kept ${path}:\n${rm.output}`);
  });

  it("guard/T86 [guard/F4, guard/F27]: where core.fileMode is false, init --hook reports git add --chmod=+x .githooks/pre-push, and after the consumer runs it a fresh clone with core.fileMode=true runs the hook on push", () => {
    const COMMAND = "git add --chmod=+x .githooks/pre-push";
    const c = consumer();
    assert.equal(c.git("config", "core.fileMode", "false").status, 0);
    const init = c.guard(["init", "--hook"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(init.output.includes(COMMAND), `init --hook does not report ${COMMAND}:\n${init.output}`);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    assert.equal(c.git("add", "-A").status, 0);
    assert.equal(c.git(...COMMAND.split(" ").slice(1)).status, 0, `${COMMAND} failed`);
    c.commit("Guard installed, hook recorded executable");
    assert.equal(c.git("push", "-q", "--no-verify", "origin", "main").status, 0);

    // A fresh clone that honours the mode Git recorded: with the consumer's own dependencies installed and the
    // hook enabled as the consumer would, a push there runs Guard's hook. Without the recorded mode Git skips it.
    const clone = join(c.root, "modes");
    const cloned = c.git("clone", "-q", "-b", "main", "--config", "core.fileMode=true", c.remote, clone);
    assert.equal(cloned.status, 0, cloned.output);
    assert.match(c.git("-C", clone, "ls-files", "-s", ".githooks/pre-push").stdout, /^100755 /, "the hook is not recorded executable");
    const installed = exec(clone, "npm", ["ci", "--no-audit", "--no-fund", "--offline"], c.env);
    assert.equal(installed.status, 0, `npm ci in the clone: ${installed.output}`);
    for (const [k, v] of [["user.name", "Consumer"], ["user.email", "consumer@example.invalid"], ["commit.gpgsign", "false"], ["core.hooksPath", ".githooks"]]) {
      assert.equal(c.git("-C", clone, "config", k, v).status, 0, `git config ${k} in the clone`);
    }
    assert.equal(c.git("-C", clone, "commit", "-q", "--allow-empty", "-m", "from the clone").status, 0);
    const push = c.git("-C", clone, "push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", `a push from the fresh clone did not run Guard's hook:\n${push.output}`);
  });
});

describe("guard/F5 [guard/I2, guard/I3] Guard's workflow", () => {
  it("guard/T87 [guard/F5, guard/N1]: the workflow init --ci installs pins actions/checkout and actions/setup-node by commit SHA, uses Node 24, and has no ${{ expression in any run: line", () => {
    const c = given({ build: { command: exit(0), runs: ["ci"] } });
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    const lines = c.read(".github/workflows/guard.yml").split(/\r?\n/);
    const uses = lines.filter((l) => /^\s*-?\s*uses:/.test(l));
    for (const action of ["actions/checkout", "actions/setup-node"]) assert.ok(uses.some((l) => l.includes(`${action}@`)), `the workflow does not use ${action}`);
    for (const l of uses) assert.match(l, /uses: [\w.-]+\/[\w.-]+@[0-9a-f]{40}(\s|$)/, `not pinned by commit SHA: ${l.trim()}`);
    const versions = lines.filter((l) => /^\s*node-version:/.test(l));
    assert.ok(versions.length > 0, "the workflow names no node-version");
    for (const l of versions) assert.match(l, /node-version: ["']?24["']?\s*$/, `not Node 24: ${l.trim()}`);
    // A run: line, and every line of its block scalar, is shell: no GitHub expression may reach it.
    lines.forEach((l, i) => {
      const m = /^(\s*)(?:- )?run:/.exec(l);
      if (!m) return;
      const indent = m[1].length + (l.trimStart().startsWith("- ") ? 2 : 0);
      const block = [l];
      for (let j = i + 1; j < lines.length && (lines[j].trim() === "" || lines[j].search(/\S/) > indent); j++) block.push(lines[j]);
      for (const b of block) assert.ok(!b.includes("${{"), `a GitHub expression in a run: line: ${b.trim()}`);
    });
  });
});

describe("guard/F8 and guard/F13 [guard/I5] a missing registered asset", () => {
  it("guard/T88 [guard/F8, guard/F13]: after the registered hook is deleted, init --hook reinstalls it and reports it reinstalled, and a push runs it; after the registered Skill is deleted, upgrade reinstalls it", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.commit("Guard installed");
    rmSync(join(c.dir, ".githooks", "pre-push"));
    c.commit("hook lost");
    const init = c.guard(["init", "--hook"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(c.exists(".githooks/pre-push"), `init --hook did not reinstall the registered hook:\n${init.output}`);
    assert.match(init.output, /reinstalled[^\n]*\.githooks\/pre-push|\.githooks\/pre-push[^\n]*reinstalled/, `init --hook does not report the hook reinstalled:\n${init.output}`);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("hook back");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", `the reinstalled hook did not run:\n${push.output}`);

    const skill = `${SKILL}/SKILL.md`;
    assert.ok(c.installation()[skill], "init did not register the Skill");
    rmSync(join(c.dir, skill));
    const up = c.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.ok(c.exists(skill), `upgrade did not reinstall the registered Skill:\n${up.output}`);
    assert.match(up.output, /reinstalled/, `upgrade does not report the Skill reinstalled:\n${up.output}`);
  });
});

describe("guard/F10 and guard/F17 [guard/I2, guard/I5] unreadable workflows", () => {
  it("guard/T89 [guard/F10, guard/F17, guard/N4]: with a directory, and with a dangling link, named .github/workflows/x.yml, verify and init --ci are cannot judge (exit 2), naming the entry, and print no stack trace", () => {
    const entry = ".github/workflows/x.yml";
    const entries = {
      directory: (c) => (mkdirSync(join(c.dir, entry), { recursive: true }), writeFileSync(join(c.dir, entry, "inside.txt"), "not a workflow\n"), true),
      "dangling link": (c) => (mkdirSync(join(c.dir, ".github", "workflows"), { recursive: true }), link(c, "missing.yml", entry)),
    };
    for (const [kind, make] of Object.entries(entries)) {
      const c = given({ build: { command: exit(0), runs: ["ci"] } });
      assert.equal(c.guard(["init"]).status, 0);
      if (!make(c)) continue;
      cannotJudge(c.guard(["verify"]), "x.yml", `${kind}: verify`, "build");
      cannotJudge(c.guard(["init", "--ci"]), "x.yml", `${kind}: init --ci`);
      assert.ok(!c.exists(".github/workflows/guard.yml"), `${kind}: init --ci installed a workflow beside one it cannot read`);
    }
  });
});

describe("guard/F8 [guard/I5] remove and the configuration directory", () => {
  it("guard/T90 [guard/F8]: remove --config <dir>, for an empty directory inside and outside the repository, leaves that directory in place; plain remove after a bare init deletes the empty default .kaal/config/guard/", () => {
    const c = consumer();
    const inside = join(c.dir, "empty-config");
    const outside = join(c.root, "outside-config");
    for (const dir of [inside, outside]) {
      mkdirSync(dir);
      assert.equal(c.guard(["init"]).status, 0);
      const r = c.guard(["remove", "--config", dir]);
      assert.ok(existsSync(dir), `remove --config deleted ${dir}:\n${r.output}`);
    }

    const d = consumer();
    assert.equal(d.guard(["init"]).status, 0);
    assert.ok(d.exists(CONFIG), "a bare init did not create the default configuration directory");
    const rm = d.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.ok(!d.exists(CONFIG), "remove kept the empty default configuration directory");
  });
});

describe("guard/F2 [guard/I2] named outcomes", () => {
  it('guard/T91 [guard/F2, guard/F18]: an outcomes key "04", "+4" or "256" is refused as cannot judge, naming the canonical form, and "4" names exit 4 as held', () => {
    for (const [key, canonical] of [["04", '"4"'], ["+4", '"4"'], ["256", '"255"']]) {
      const c = given({ h: { command: exit(0), runs: ["hook", "ci"], outcomes: { [key]: "held" } } });
      for (const args of [["run", "--check", "h"], ["run", "--hook"], ["verify"]]) {
        const r = c.guard(args);
        cannotJudge(r, `${CONFIG}/h.md`, `"${key}": ${args.join(" ")}`, "h");
        assert.ok(r.output.includes(canonical), `"${key}": ${args.join(" ")} does not name ${canonical}:\n${r.output}`);
      }
    }
    const held = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook"], outcomes: { 4: "held" } } });
    assert.equal(verdicts(held.guard(["run", "--check", "h"]).output).h?.verdict, "held");
  });
});

describe("guard/N1 [guard/I5] Git prerequisite", () => {
  it("guard/T92 [guard/N1]: with a git that reports version 2.25, every command is cannot judge (exit 2), names Git 2.26, and changes nothing", () => {
    const c = given({ x: { command: exit(0), runs: ["hook", "ci"] } });
    // An older Git, as the running command sees it: like guard/T59's Node, the preload replaces only what
    // `git --version` reports through Node's child_process, on every host, and every other Git call is the real one.
    const preload = join(c.root, "git225.mjs");
    writeFileSync(preload, [
      'import { createRequire, syncBuiltinESMExports } from "node:module";',
      'const cp = createRequire(import.meta.url)("node:child_process");',
      'const asked = (file, args) => /(^|[\\\\/])git(\\.exe)?$/i.test(String(file)) && Array.isArray(args) && ["--version", "version"].includes(args[0]);',
      'const text = (options) => Boolean(options?.encoding) && options.encoding !== "buffer";',
      'const REPORT = "git version 2.25.0\\n";',
      'const { spawnSync, execFileSync } = cp;',
      'cp.spawnSync = (file, args, options) => (asked(file, args) ? { pid: 0, status: 0, signal: null, stdout: text(options) ? REPORT : Buffer.from(REPORT), stderr: text(options) ? "" : Buffer.alloc(0) } : spawnSync(file, args, options));',
      'cp.execFileSync = (file, args, options) => (asked(file, args) ? (text(options) ? REPORT : Buffer.from(REPORT)) : execFileSync(file, args, options));',
      "syncBuiltinESMExports();",
      "",
    ].join("\n"));
    const old = { NODE_OPTIONS: `--import="${pathToFileURL(preload).href}"` };
    const seen = exec(c.dir, process.execPath, ["--input-type=module", "-e", 'import { spawnSync } from "node:child_process"; process.stdout.write(spawnSync("git", ["--version"], { encoding: "utf8" }).stdout);'], old);
    assert.equal(seen.stdout.trim(), "git version 2.25.0", `the preload does not stand in for git --version: ${seen.output}`);
    for (const args of [["run", "--hook"], ["run", "--check", "x"], ["verify"], ["init"], ["init", "--hook"], ["upgrade"], ["remove"]]) {
      const before = snapshot(c);
      const r = c.guard(args, old);
      assert.equal(r.status, 2, `${args.join(" ")} on Git 2.25: ${r.output}`);
      assert.match(r.output, /cannot judge/, `${args.join(" ")} on Git 2.25 is not cannot judge`);
      assert.match(r.output, /Git 2\.26/, `${args.join(" ")} on Git 2.25 does not name Git 2.26 as the next step`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} on Git 2.25 changed something`);
    }
  });
});
