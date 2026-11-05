// Part 4 of 4 of the Requirements verification. guard/C142 moved these cases here from requirements.test.mjs, unchanged, so that node --test runs the four parts in parallel.
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
import { exit, given, snapshot, named, link, cannotJudge } from "./requirements-support.mjs";

// guard/T84–guard/T92 are planned in guard/C61, from the 0.0.2 release review, and written in guard/C63, before
// any correction. Each is registered in red.json until its Change (guard/C64–guard/C68): its RED is the
// evidence that establishes its suspected Defect, and a GREEN would refute it.


describe("guard/F28 [guard/I2, guard/I3, guard/I5] declarations that are not regular files", () => {
  it("guard/T84 [guard/F28, guard/F10, guard/D6]: a declaration that is a symbolic link, and a directory named <name>.md, in the configuration directory each make run --hook, run --ci and run --check cannot judge, naming the entry; neither is skipped", () => {
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
  it("guard/T85 [guard/F27, guard/F29, guard/F12, guard/D7]: in a clone with core.autocrlf=true, the hook, the workflow and the Skill Guard installed and committed keep the bytes Guard wrote: the hook runs under sh, and upgrade and remove treat each file as Guard's unmodified file", () => {
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

  it("guard/T86 [guard/F4, guard/F27, guard/D8]: where core.fileMode is false, init --hook reports git add --chmod=+x .githooks/pre-push, and after the consumer runs it a fresh clone with core.fileMode=true runs the hook on push", () => {
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
  it("guard/T87 [guard/F5, guard/N1, guard/D9]: the workflow init --ci installs pins actions/checkout and actions/setup-node by commit SHA, uses Node 24, and has no ${{ expression in any run: line", () => {
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
  it("guard/T88 [guard/F8, guard/F13, guard/D10]: after the registered hook is deleted, init --hook reinstalls it and reports it reinstalled, and a push runs it; after the registered Skill is deleted, upgrade reinstalls it", () => {
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
  it("guard/T89 [guard/F10, guard/F17, guard/N4, guard/D11]: with a directory, and with a dangling link, named .github/workflows/x.yml, verify and init --ci are cannot judge (exit 2), naming the entry, and print no stack trace", () => {
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
  it("guard/T90 [guard/F8, guard/D12]: remove --config <dir>, for an empty directory inside and outside the repository, leaves that directory in place; plain remove after a bare init deletes the empty default .kaal/config/guard/", () => {
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
  it("guard/T91 [guard/F2, guard/F18, guard/D13]: a held status written 04, +4 or above 255 is refused as cannot judge, naming held and 4 to 255, and 4 names exit 4 as held", () => {
    for (const item of ["04", "+4", "256"]) {
      const c = given({ h: { command: exit(0), runs: ["hook", "ci"] } });
      const file = `${CONFIG}/h.md`;
      c.write(file, c.read(file).replace(/^runs: .*$/m, (line) => `${line}\nheld: [${item}]`));
      for (const args of [["run", "--check", "h"], ["run", "--hook"], ["verify"]]) {
        const r = c.guard(args);
        cannotJudge(r, file, `${item}: ${args.join(" ")}`, "h");
        assert.ok(r.output.includes("held"), `${item}: ${args.join(" ")} does not name held:\n${r.output}`);
      }
    }
    const held = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook"], held: [4] } });
    assert.equal(verdicts(held.guard(["run", "--check", "h"]).output).h?.verdict, "held");
  });

  it("guard/T125 [guard/F2, guard/F18]: a held status 0 or 3, a status Guard reserves for its own verdicts, is refused as cannot judge, naming 4 to 255", () => {
    for (const status of [0, 3]) {
      const c = given({ h: { command: exit(0), runs: ["hook", "ci"], held: [status] } });
      for (const args of [["run", "--check", "h"], ["run", "--hook"], ["verify"]]) {
        const r = c.guard(args);
        cannotJudge(r, `${CONFIG}/h.md`, `${status}: ${args.join(" ")}`, "h");
        assert.ok(r.output.includes("4 to 255"), `${status}: ${args.join(" ")} does not name 4 to 255:\n${r.output}`);
      }
    }
  });

  it("guard/T128 [guard/F1, guard/F2, guard/F18, guard/F42]: outcomes is refused as cannot judge, naming held and the exact line to write, in every form; held: [4] is accepted and gives held on exit 4; a declaration with both, or a duplicate or non-integer status, is refused", () => {
    const file = `${CONFIG}/h.md`;
    const write = (c, line) => c.write(file, c.read(file).replace(/^runs: .*$/m, (l) => `${l}\n${line}`));
    const refused = (line, said, why) => {
      const c = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook", "ci"] } });
      write(c, line);
      for (const args of [["run", "--check", "h"], ["run", "--hook"], ["verify"]]) {
        const r = c.guard(args);
        cannotJudge(r, file, `${why}: ${args.join(" ")}`, "h");
        assert.ok(r.output.includes(said), `${why}: ${args.join(" ")} does not say ${said}:\n${r.output}`);
      }
    };
    refused('outcomes: {"4": held}', "held: [4]", "outcomes as written by 0.0.4");
    refused('outcomes: {"4": held, "7": held}', "held: [4, 7]", "outcomes with two statuses");
    refused('outcomes: {"4": ignored}', "held: [4]", "outcomes with another value");
    refused('outcomes: {4: held}', "held: [4]", "outcomes with an unquoted key");
    refused('outcomes: {"4": held}\nheld: [4]', "delete the outcomes line", "outcomes and held that agree");
    refused("held: [4, 4]", "names a status twice", "a duplicate status");
    refused('held: ["4"]', "not an integer", "a string status");
    refused("held: [4.5]", "held", "a fractional status");
    refused("held: [-1]", "4 to 255", "a negative status");
    refused("held: []", "list of integers", "an empty list");
    const ok = given({ h: { command: exit(4, "held by the Owner"), runs: ["hook", "ci"], held: [4] } });
    for (const args of [["run", "--hook"], ["run", "--check", "h"]]) assert.equal(verdicts(ok.guard(args).output).h?.verdict, "held", args.join(" "));
    const unlisted = given({ h: { command: exit(5, "five"), runs: ["hook"], held: [4] } });
    assert.equal(verdicts(unlisted.guard(["run", "--check", "h"]).output).h?.verdict, "cannot judge", "a status not listed is not held");
  });
});

describe("guard/N1 [guard/I5] Git prerequisite", () => {
  it("guard/T92 [guard/N1, guard/D14]: with a git that reports version 2.25, every command is cannot judge (exit 2), names Git 2.26, and changes nothing", () => {
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

describe("guard/N15 [guard/I1, guard/I5] no credential left behind", () => {
  it("guard/T119 [guard/N15, guard/F29]: every checkout in the installed workflow sets persist-credentials: false, and the installed workflow is catalogued beside every content published from 0.0.2 on", () => {
    const c = consumer();
    assert.equal(c.guard(["init", "--ci"]).status, 0);
    const workflow = c.read(".github/workflows/guard.yml");
    const steps = workflow.split(/\n(?=\s*- )/).filter((step) => /uses:\s*actions\/checkout@/.test(step));
    assert.ok(steps.length > 0, "the installed workflow has no checkout step");
    for (const step of steps) assert.match(step, /^\s*persist-credentials:\s*false\s*$/m, `a checkout step keeps the run's credential:\n${step}`);
    const catalogued = c.catalogue()[".github/workflows/guard.yml"] ?? [];
    assert.ok(catalogued.includes(sha256(Buffer.from(workflow))), "the installed workflow is not catalogued content");
    // The workflow's published contents from 0.0.2 on (0.0.1 has no catalogue; guard/I5): 0.0.2, then 0.0.3 and 0.0.4.
    for (const earlier of ["832be35f6d149493adfcb171fc159d707f762915f2e2cd57a159b2aeb8e14acf", "3635321ec5949c64b7a03206f5958a65d1351662b43baeb4efccb75131c59070"])
      assert.ok(catalogued.includes(earlier), `the catalogue no longer holds the earlier workflow content ${earlier}`);
  });
});

describe("guard/F41 [guard/I5] the version and the usage", () => {
  it("guard/T122 [guard/F41]: kaal-guard --version prints the installed version and kaal-guard --help prints the usage, each with exit 0, in a directory that is not a repository, which stays unchanged", () => {
    const c = consumer();
    const outside = mkdtempSync(join(tmpdir(), "kaal-guard-outside-"));
    try {
      writeFileSync(join(outside, "keep.txt"), "kept\n");
      const version = c.guard(["--version"], {}, outside);
      assert.equal(version.status, 0, `--version exited ${version.status}: ${version.output}`);
      assert.equal(version.stdout.trim(), c.version(), "--version does not print the installed version alone");
      const help = c.guard(["--help"], {}, outside);
      assert.equal(help.status, 0, `--help exited ${help.status}: ${help.output}`);
      assert.match(help.stdout, /^usage: kaal-guard run /m, "--help does not print the usage");
      for (const command of ["verify", "init", "remove", "upgrade"]) assert.match(help.stdout, new RegExp(`kaal-guard .*\\b${command}\\b`), `the usage does not name ${command}`);
      assert.deepEqual(readdirSync(outside), ["keep.txt"], "--version or --help wrote into the directory");
      assert.equal(readFileSync(join(outside, "keep.txt"), "utf8"), "kept\n");
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });
});

describe("guard/F42 [guard/I5] upgrade refuses a source version the release does not declare", () => {
  /** The source versions guard/F42 declares in the package's docs/requirements.md. */
  const declared = () => {
    const text = readFileSync(join(PACKAGE, "docs", "requirements.md"), "utf8");
    const at = text.indexOf("**guard/F42 ");
    const rows = text.slice(at).split("\n").filter((l) => /^\| `\d+\.\d+\.\d+` \|/.test(l));
    return rows.map((l) => l.match(/^\| `([^`]+)`/)[1]);
  };
  /** An initialized, committed consumer whose record names `versions` (one per asset, in the record's order, the last repeated). */
  const recorded = (versions) => {
    const c = consumer();
    c.checks({ unit: { command: exit(0), runs: ["ci"] } });
    assert.equal(c.guard(["init", "--hook", "--ci"]).status, 0, "init");
    const record = JSON.parse(c.read(RECORD));
    const paths = Object.keys(record.assets);
    paths.forEach((path, i) => { record.assets[path].version = versions[Math.min(i, versions.length - 1)]; });
    c.write(RECORD, `${JSON.stringify(record, null, 2)}\n`);
    c.commit("record");
    return c;
  };

  it("guard/T139 [guard/F42, guard/F18]: upgrade is cannot judge before it writes anything when the record names an earlier version the release does not declare, naming the version, the declared sources and a next step; a declared source, a later version and a mix of declared sources are moved, and a mix with an undeclared one is refused whole", () => {
    const sources = declared();
    assert.ok(sources.length >= 3, `guard/F42 declares ${sources.join(", ") || "no"} sources`);
    for (const version of ["0.0.1", "0.0.3.1", "0.0.0"]) {
      const c = recorded([version]);
      const before = { record: c.read(RECORD), status: c.git("status", "--porcelain").stdout };
      const up = c.guard(["upgrade"]);
      assert.equal(up.status, 2, `upgrade from a record naming ${version} was not cannot judge:\n${up.output}`);
      assert.match(up.output, /cannot judge/, up.output);
      assert.ok(up.output.includes(version), `the refusal does not name ${version}:\n${up.output}`);
      for (const source of sources) assert.ok(up.output.includes(source), `the refusal does not name the declared source ${source}:\n${up.output}`);
      assert.match(up.output, /^\s+do: /m, "the refusal does not say what to do next");
      assert.equal(c.read(RECORD), before.record, `the refused upgrade from ${version} rewrote the record`);
      assert.equal(c.git("status", "--porcelain").stdout, before.status, `the refused upgrade from ${version} wrote something`);
    }
    for (const version of sources) {
      const up = recorded([version]).guard(["upgrade"]);
      assert.equal(up.status, 0, `upgrade from the declared source ${version}:\n${up.output}`);
    }
    const rollback = recorded(["9.9.9"]).guard(["upgrade"]);
    assert.equal(rollback.status, 0, `a record naming a later version is a rollback and proceeds:\n${rollback.output}`);
    const mixed = recorded([sources[0], sources[1]]).guard(["upgrade"]);
    assert.equal(mixed.status, 0, `a mix of declared sources:\n${mixed.output}`);
    const bad = recorded([sources[0], "0.0.1"]);
    const record = bad.read(RECORD);
    const refused = bad.guard(["upgrade"]);
    assert.equal(refused.status, 2, `a mix with an undeclared version was not refused:\n${refused.output}`);
    assert.equal(bad.read(RECORD), record, "the refused mixed upgrade rewrote the record");
    assert.equal(bad.git("status", "--porcelain").stdout, "", "the refused mixed upgrade wrote something");
  });
});
