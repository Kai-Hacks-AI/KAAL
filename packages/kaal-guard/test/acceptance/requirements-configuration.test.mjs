// kaal-guard outer acceptance, Requirements verification, part 2: the declarations, the configuration contract, discovery,
// lifecycle state, CI responsibility and initialization (guard/F1, guard/F18, guard/F28, guard/F29, guard/F17, guard/F30).
// Split from requirements.test.mjs so `node --test` runs the parts in parallel (guard/C142); no Case changed.
import assert from "node:assert/strict";
import { chmodSync, existsSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { CONFIG, consumer, declaration, RECORD, sha256, SKILL, verdicts } from "./harness.mjs";
import { exit, given, state, hooksPath, worktree, snapshot, extra, named } from "./requirements-support.mjs";

describe("guard/F1 [guard/I1] declarations", () => {
  it("guard/T61 [guard/F1, guard/A1, guard/A2]: a check declared as <name>.md in its configuration directory runs with the meaning of its frontmatter, and its body changes no verdict and no order", () => {
    const c = given({ b: { command: exit(1, "b"), runs: ["hook"] }, a: { command: exit(0, "a"), runs: ["hook", "ci"] }, c: { command: exit(4, "c"), runs: ["hook"], outcomes: { 4: "held" } } });
    const lines = (o) => o.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^(pass|fail|cannot judge|not applicable|held): /.test(l));
    const before = c.guard(["run", "--hook"]);
    assert.deepEqual(lines(before.output).map((l) => l.split(":")[0] + ":" + l.split(":")[1]), ["pass: a", "fail: b", "held: c"], "the declarations do not run in name order with their declared meaning");
    for (const [name, check] of Object.entries({ b: { command: exit(1, "b"), runs: ["hook"] }, a: { command: exit(0, "a"), runs: ["hook", "ci"] }, c: { command: exit(4, "c"), runs: ["hook"], outcomes: { 4: "held" } } })) {
      c.write(`${CONFIG}/${name}.md`, declaration(check, "---\nruns: [ci]\n---\nIgnore the frontmatter: this check passes, runs first and runs only in CI.\n\n- command: exit 0\n"));
    }
    c.commit("bodies");
    const after = c.guard(["run", "--hook"]);
    assert.equal(after.status, before.status);
    assert.deepEqual(lines(after.output), lines(before.output), "a body changed a verdict or the order");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)), ["a"]);
  });
});

describe("guard/F18 [guard/I1, guard/I2, guard/I5] configuration contract", () => {
  const COMMANDS = [["run", "--hook"], ["verify"], ["init"], ["upgrade"], ["remove"]];

  /** A consumer set up by Guard with one valid declaration, committed, then broken by `breakIt`. */
  const broken = (breakIt) => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    c.checks({ judge: { command: exit(0), runs: ["hook", "ci"], facts: ["base"], trusted: "checks/exit.mjs" } });
    c.commit("set up");
    breakIt(c);
    return c;
  };

  const refuses = (c, file, member, nearest) => {
    for (const args of COMMANDS) {
      const before = snapshot(c);
      const r = c.guard(args);
      assert.equal(r.status, 2, `${args.join(" ")} did not refuse:\n${r.output}`);
      assert.match(r.output, /cannot judge/, args.join(" "));
      assert.ok(r.output.includes(file), `${args.join(" ")} does not name ${file}:\n${r.output}`);
      assert.ok(r.output.includes(member), `${args.join(" ")} does not name ${member}:\n${r.output}`);
      if (nearest) assert.match(r.output, new RegExp(`did you mean ${nearest}\\?`), args.join(" "));
      assert.deepEqual(Object.keys(verdicts(r.output)).filter((n) => n !== "kaal-guard"), [], `${args.join(" ")} gave a verdict on the strength of a refused configuration`);
      assert.deepEqual(snapshot(c), before, `${args.join(" ")} wrote something on the strength of a refused configuration`);
    }
  };

  it("guard/T62 [guard/F18, guard/F10, guard/N4]: an undefined member, a wrong type or frontmatter outside the subset, in a declaration or in Guard's state, is cannot judge, named, and nothing is written", () => {
    const file = `${CONFIG}/judge.md`;
    refuses(broken((c) => c.write(file, c.read(file).replace("trusted:", "trustd:"))), file, "trustd", "trusted");
    refuses(broken((c) => c.write(file, c.read(file).replace(/^command: .*$/m, "command: [node, checks/exit.mjs, 0]"))), file, "command");
    refuses(broken((c) => c.write(file, c.read(file).replace(/^runs: .*$/m, "runs:\n  - hook\n  - ci"))), file, "runs");
    refuses(broken((c) => c.write(RECORD, JSON.stringify({ ...JSON.parse(c.read(RECORD)), owner: "someone" }, null, 2) + "\n")), RECORD, "owner");
    refuses(broken((c) => {
      const at = state(c, c.dir);
      writeFileSync(at, JSON.stringify({ ...JSON.parse(readFileSync(at, "utf8")), extra: 1 }));
    }), "state.json", "extra");
  });

  it('guard/T79 [guard/F1, guard/F2, guard/F18]: outcomes: {"4": held} makes exit status 4 held; an unquoted status key, {4: held}, is cannot judge, naming the declaration, outcomes and {"4": held}', () => {
    const c = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook", "ci"], outcomes: { 4: "held" } } });
    assert.match(c.read(`${CONFIG}/h.md`), /^outcomes: \{"4": held\}$/m, "the declaration does not quote the status key");
    for (const args of [["run", "--hook"], ["run", "--check", "h"]]) {
      const r = c.guard(args);
      assert.equal(verdicts(r.output).h?.verdict, "held", `${args.join(" ")}:\n${r.output}`);
    }

    const file = `${CONFIG}/judge.md`;
    const unquoted = broken((b) => b.write(file, b.read(file).replace(/^runs: .*$/m, (line) => `${line}\noutcomes: {4: held}`)));
    refuses(unquoted, file, "outcomes");
    for (const args of [["run", "--hook"], ["verify"]]) {
      const r = unquoted.guard(args);
      assert.ok(r.output.includes('{"4": held}'), `${args.join(" ")} does not name the quoted form:\n${r.output}`);
    }
  });
});

describe("guard/F28 [guard/I2, guard/I3, guard/I5] configuration discovery", () => {
  it("guard/T63 [guard/F28]: the hook and workflow pass --config; without it the top level's declarations are found from any directory; only .md files directly in it count; with none it is cannot judge naming init", () => {
    const fresh = consumer();
    const none = fresh.guard(["run", "--hook"]);
    assert.equal(none.status, 2, none.output);
    assert.match(none.output, /kaal-guard init/);

    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    for (const asset of [".githooks/pre-push", ".github/workflows/guard.yml"]) {
      assert.match(c.read(asset), /kaal-guard run [^\n]*--config \.kaal\/config\/guard\b/, `${asset} does not pass --config`);
    }
    c.checks({ top: { command: exit(1, "top"), runs: ["hook", "ci"] } });
    c.write(`${CONFIG}/notes.txt`, "not a declaration\n");
    c.write(`${CONFIG}/nested/deep.md`, declaration({ command: exit(0), runs: ["hook", "ci"] }));
    c.write("alt/top.md", declaration({ command: exit(0, "alt"), runs: ["hook", "ci"] }));
    c.commit("declarations");
    const fromRoot = verdicts(c.guard(["run", "--check", "top"]).output).top;
    const fromBelow = verdicts(c.guard(["run", "--check", "top"], {}, join(c.dir, "checks")).output).top;
    assert.equal(fromRoot?.verdict, "fail");
    assert.deepEqual(fromBelow, fromRoot, "a subdirectory resolved other declarations");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--hook"]).output)), ["top"], "a file that is not a .md directly in the directory was taken as a declaration");
    assert.equal(verdicts(c.guard(["run", "--check", "deep"]).output).deep?.verdict, "cannot judge");
    assert.equal(verdicts(c.guard(["run", "--check", "top", "--config", "alt"]).output).top?.verdict, "pass", "--config was not followed");
  });
});

describe("guard/F29 [guard/I5] lifecycle state", () => {
  it("guard/T69 [guard/F29, guard/F8]: shared configuration: init in a linked worktree sets core.hooksPath in the shared scope with its state in the common directory, and remove in the main checkout unsets it", () => {
    const c = given({ ok: { command: exit(0), runs: ["hook"] } });
    const wt = worktree(c, "shared");
    const init = c.guard(["init", "--hook"], {}, wt);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(hooksPath(c, wt), ["local", ".githooks"]);
    assert.deepEqual(hooksPath(c, c.dir), ["local", ".githooks"], "the main checkout does not see the shared setting");
    assert.ok(existsSync(state(c, wt)), "no checkout state in the common directory");
    assert.equal(state(c, wt), state(c, c.dir));
    const rm = c.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(hooksPath(c, wt), []);
    assert.ok(!existsSync(state(c, c.dir)), "remove kept the checkout state it used");
  });

  it("guard/T70 [guard/F29, guard/F8, guard/F12]: in a fresh clone, upgrade and remove judge each asset by the tracked installation record alone, and leave a core.hooksPath Guard did not set there", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("set up");
    assert.equal(c.git("push", "--no-verify", "origin", "main").status, 0);
    const clone = join(c.root, "clone");
    assert.equal(c.git("clone", "-q", "-b", "main", c.remote, clone).status, 0);
    c.git("-C", clone, "config", "core.hooksPath", ".githooks");
    writeFileSync(join(clone, ".github", "workflows", "guard.yml"), "name: edited in the clone\n");
    const up = c.guard(["upgrade"], {}, clone);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, /\.github\/workflows\/guard\.yml/);
    assert.equal(readFileSync(join(clone, ".github", "workflows", "guard.yml"), "utf8"), "name: edited in the clone\n");
    const rm = c.guard(["remove"], {}, clone);
    assert.equal(rm.status, 0, rm.output);
    assert.ok(!existsSync(join(clone, ".githooks", "pre-push")), "remove kept an unmodified registered asset");
    assert.equal(readFileSync(join(clone, ".github", "workflows", "guard.yml"), "utf8"), "name: edited in the clone\n", "remove deleted a modified asset");
    assert.deepEqual(hooksPath(c, clone), ["local", ".githooks"], "remove unset a core.hooksPath Guard did not set in this clone");
  });

  it("guard/T71 [guard/F29, guard/F8]: worktree configuration: init in a linked worktree sets core.hooksPath for that worktree only, with its state in the worktree's metadata", () => {
    const c = given({ ok: { command: exit(0), runs: ["hook"] } });
    assert.equal(c.git("config", "extensions.worktreeConfig", "true").status, 0);
    const wt = worktree(c, "own");
    const init = c.guard(["init", "--hook"], {}, wt);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(hooksPath(c, wt), ["worktree", ".githooks"]);
    assert.deepEqual(hooksPath(c, c.dir), [], "the main checkout sees the worktree's setting");
    assert.ok(existsSync(state(c, wt, "worktree")), "no checkout state in the worktree's metadata");
    assert.ok(!existsSync(state(c, c.dir)), "the state was written to the common directory");
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(hooksPath(c, wt), ["worktree", ".githooks"], "remove in the main checkout touched the worktree's setting");
    const rm = c.guard(["remove"], {}, wt);
    assert.equal(rm.status, 0, rm.output);
    assert.deepEqual(hooksPath(c, wt), []);
    assert.ok(!existsSync(state(c, wt, "worktree")), "remove kept the checkout state it used");
  });

  it("guard/T72 [guard/F29, guard/F8, guard/F19]: every asset init and upgrade install is byte-identical to catalogued content and valid in its format", () => {
    const c = consumer();
    for (const [command, ...options] of [["init", "--hook", "--ci"], ["upgrade"]]) {
      assert.equal(c.guard([command, ...options]).status, 0, command);
      const catalogue = c.catalogue();
      for (const path of Object.keys(c.installation())) {
        const bytes = readFileSync(join(c.dir, path));
        assert.ok((catalogue[path] ?? []).includes(sha256(bytes)), `${command}: ${path} is not catalogued content`);
        const text = bytes.toString("utf8");
        if (path === ".githooks/pre-push") {
          assert.match(text, /^#!/, `${command}: the hook does not start with its shebang`);
          if (process.platform !== "win32") assert.ok(statSync(join(c.dir, path)).mode & 0o111, `${command}: the hook is not executable`);
        } else if (/\.ya?ml$/.test(path)) {
          assert.match(text, /^name: /, `${command}: ${path} does not start as a plain workflow`);
          assert.match(text, /^jobs:/m, `${command}: ${path} has no jobs`);
          assert.doesNotMatch(text, /\t/, `${command}: ${path} holds a tab, which YAML refuses`);
        } else if (path.endsWith("SKILL.md")) {
          assert.match(text, /^---\r?\nname: kaal-guard\r?\n(?:[^\n]*\n)*?description: \S/, `${command}: ${path} does not begin with the standard's frontmatter`);
        }
      }
    }
    c.checks({ ok: { command: exit(0), runs: ["hook"] } });
    c.commit("ok");
    const push = c.git("push", "origin", "main");
    assert.equal(push.status, 0, push.output);
    assert.equal(verdicts(push.output).ok?.verdict, "pass", "the installed hook does not run");
  });

  it("guard/T73 [guard/F29, guard/F8]: a file with published bytes that the record does not register is not Guard's, and a changed or missing registered asset is reported, not re-registered", () => {
    const source = consumer();
    assert.equal(source.guard(["init", "--hook"]).status, 0);
    const published = source.read(".githooks/pre-push");

    const c = consumer();
    c.write(".githooks/pre-push", published);
    if (process.platform !== "win32") chmodSync(join(c.dir, ".githooks", "pre-push"), 0o755);
    c.commit("a hook of the consumer's own, with Guard's bytes");
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.equal(c.installation()[".githooks/pre-push"], undefined, "init registered a file it did not write");
    for (const command of ["upgrade", "remove"]) {
      const r = c.guard([command]);
      assert.equal(r.status, 0, r.output);
      assert.match(r.output, /\.githooks\/pre-push/, `${command} does not report the unregistered file`);
      assert.equal(c.read(".githooks/pre-push"), published, `${command} touched a file that is not Guard's`);
    }

    const d = consumer();
    assert.equal(d.guard(["init", "--hook", "--ci"]).status, 0);
    const registered = d.installation()[".githooks/pre-push"];
    d.write(".githooks/pre-push", `${published}# the consumer's line\n`);
    const up = d.guard(["upgrade"]);
    assert.equal(up.status, 0, up.output);
    assert.match(up.output, /\.githooks\/pre-push/, "upgrade does not report the changed asset");
    assert.deepEqual(d.installation()[".githooks/pre-push"], registered, "upgrade re-registered a changed asset");
    rmSync(join(d.dir, ".github", "workflows", "guard.yml"));
    const rm = d.guard(["remove"]);
    assert.equal(rm.status, 0, rm.output);
    assert.match(rm.output, /\.githooks\/pre-push/, "remove does not report the changed asset");
    assert.match(rm.output, /\.github\/workflows\/guard\.yml/, "remove does not report the missing registered asset");
  });
});

describe("guard/F17 [guard/I1, guard/I5] CI responsibility", () => {
  it("guard/T74 [guard/F17, guard/F10, guard/F30, guard/N4]: without --hook or --ci, init activates neither integration, reports each ci check no job declares with the step to add and init --ci, and verify fails on it with the same step", () => {
    const c = given({ build: { command: exit(0), runs: ["ci"] }, lint: { command: exit(0), runs: ["hook"] } });
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.deepEqual(c.files().filter((p) => p.startsWith(".github/")), [], "init wrote a workflow without --ci");
    assert.equal(c.exists(".githooks/pre-push"), false, "init installed the hook without --hook");
    assert.equal(c.git("config", "--get", "core.hooksPath").stdout.trim(), "", "init set core.hooksPath without --hook");
    assert.match(init.output, /kaal-guard run --check build\b/, "init does not name the step that would run the uncovered ci check");
    assert.match(init.output, /init --ci/, "init does not name the opt-in");
    assert.doesNotMatch(init.output, /--check lint\b/, "init reports a hook check as missing CI coverage");
    c.commit("init");
    const r = c.guard(["verify"]);
    assert.equal(verdicts(r.output).build?.verdict, "fail", r.output);
    assert.match(r.output, /kaal-guard run --check build\b/, "verify does not name the step to add");
  });

  it("guard/T75 [guard/F17, guard/F8]: init --ci installs Guard's workflow only where no workflow of the consumer's declares a check or verify, and never changes one", () => {
    const fresh = given({ build: { command: exit(0), runs: ["ci"] } });
    assert.equal(fresh.guard(["init", "--ci"]).status, 0);
    const workflow = fresh.read(".github/workflows/guard.yml");
    assert.match(workflow, /kaal-guard verify/);
    assert.match(workflow, /kaal-guard run --ci/);
    assert.ok(fresh.installation()[".github/workflows/guard.yml"], "init --ci did not register the workflow it installed");
    fresh.commit("init");
    assert.equal(verdicts(fresh.guard(["verify"]).output).build?.verdict, "pass", "verify does not read Guard's workflow as running every ci check");

    const own = "name: Own\non: pull_request\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npx --no kaal-guard run --check build --github\n";
    for (const steps of [own, own.replace("run --check build --github", "verify --github")]) {
      const c = given({ build: { command: exit(0), runs: ["ci"] }, test: { command: exit(0), runs: ["ci"] } });
      c.write(".github/workflows/own.yml", steps);
      c.commit("own workflow");
      const r = c.guard(["init", "--ci"]);
      assert.equal(r.status, 0, r.output);
      assert.ok(!c.exists(".github/workflows/guard.yml"), "init --ci installed Guard's workflow beside one that already runs Guard");
      assert.equal(c.read(".github/workflows/own.yml"), steps, "init --ci changed the consumer's workflow");
      assert.match(r.output, /own\.yml/, "init --ci does not report the workflow it found");
    }
  });
});

describe("guard/F30 [guard/I1, guard/I3, guard/I5] initialization, activation and execution", () => {
  const surfaces = (c) => ({ hook: c.exists(".githooks/pre-push"), ci: c.exists(".github/workflows/guard.yml"), hooksPath: c.git("config", "--get", "core.hooksPath").stdout.trim() });

  it("guard/T76 [guard/F30, guard/N4]: init prepares the configuration and the installation record, activates neither hook nor CI, names both activations, and run again writes nothing", () => {
    const c = given({ both: { command: exit(0), runs: ["hook", "ci"] } });
    const init = c.guard(["init"]);
    assert.equal(init.status, 0, init.output);
    assert.ok(c.exists(CONFIG), "init did not prepare the configuration directory");
    assert.ok(c.exists(RECORD), "init did not prepare the installation record");
    // From guard/C16 on, init also installs the canonical Skill (guard/F23, guard/F30), which runs nothing: it registers no other asset.
    assert.deepEqual(Object.keys(c.installation()).filter((p) => !p.startsWith(`${SKILL}/`)), [], "init registered an asset without an activation");
    assert.deepEqual(surfaces(c), { hook: false, ci: false, hooksPath: "" }, "init activated a surface");
    assert.match(init.output, /init --hook/, "init does not name the hook's activation");
    assert.match(init.output, /init --ci/, "init does not name CI's activation");
    const before = snapshot(c);
    assert.equal(c.guard(["init"]).status, 0);
    assert.deepEqual(snapshot(c), before, "init run again changed something");
  });

  it("guard/T77 [guard/F30, guard/F4, guard/F17]: hook and CI are activated apart and registered apart; neither implies the other, and activating again changes nothing", () => {
    const c = given({ h: { command: exit(0, "h"), runs: ["hook"] }, k: { command: exit(0, "k"), runs: ["ci"] }, both: { command: exit(0, "both"), runs: ["hook", "ci"] } });
    assert.equal(c.guard(["init", "--hook"]).status, 0);
    assert.deepEqual(surfaces(c), { hook: true, ci: false, hooksPath: ".githooks" }, "init --hook activated more or less than the hook");
    c.commit("hook");
    const ciOnly = given({ k: { command: exit(0), runs: ["ci"] } });
    assert.equal(ciOnly.guard(["init", "--ci"]).status, 0);
    assert.deepEqual(surfaces(ciOnly), { hook: false, ci: true, hooksPath: "" }, "init --ci activated more or less than CI");
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    assert.deepEqual(surfaces(c), { hook: true, ci: true, hooksPath: ".githooks" });
    c.commit("ci");
    const before = snapshot(c);
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    assert.deepEqual(snapshot(c), before, "activating again changed something");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--hook"]).output)).sort(), ["both", "h"], "run --hook ran a check not registered for the hook");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--ci"]).output)).sort(), ["both", "k"], "run --ci ran a check not registered for CI");
    assert.deepEqual(Object.keys(verdicts(c.guard(["run", "--check", "h"]).output)), ["h"], "run --check did not run exactly the named check");
  });

  it("guard/T78 [guard/F30, guard/F18, guard/N4]: each activation is undone on its own, keeping every declaration and Test Case; local is refused, naming hook", () => {
    const c = given({ h: { command: exit(0), runs: ["hook"] }, k: { command: exit(0), runs: ["ci"] } });
    const kept = () => Object.fromEntries([`${CONFIG}/h.md`, `${CONFIG}/k.md`, "test/own.test.mjs", "checks/exit.mjs"].map((p) => [p, c.read(p)]));
    const declared = kept();
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0);
    c.commit("activated");
    const ci = c.guard(["remove", "--ci"]);
    assert.equal(ci.status, 0, ci.output);
    assert.deepEqual(surfaces(c), { hook: true, ci: false, hooksPath: ".githooks" }, "remove --ci touched the hook");
    const hook = c.guard(["remove", "--hook"]);
    assert.equal(hook.status, 0, hook.output);
    assert.deepEqual(surfaces(c), { hook: false, ci: false, hooksPath: "" }, "remove --hook left the hook active");
    assert.deepEqual(kept(), declared, "an undo changed a declaration or a Test Case");
    assert.equal(c.guard(["remove"]).status, 0);
    assert.deepEqual(kept(), declared, "remove changed a declaration or a Test Case");

    const d = given({ old: { command: exit(0), runs: ["local"] } });
    const r = d.guard(["run", "--hook"]);
    assert.equal(r.status, 2, r.output);
    assert.match(r.output, /local/);
    assert.match(r.output, /hook/);
    const flag = d.guard(["run", "--local"]);
    assert.equal(flag.status, 2, flag.output);
    assert.match(flag.output, /--hook/, "run --local does not name run --hook");
  });
});
