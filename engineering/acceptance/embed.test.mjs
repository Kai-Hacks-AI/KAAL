// Acceptance: Engineering -> Package -> Embed.
//
// Packs kaal-core as npm would publish it, inspects the actual tarball,
// installs it into a fresh, otherwise empty host outside this repository,
// and operates the Engine there through the installed package alone.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const PACKAGE = join(REPO, "packages", "kaal-core");
const work = mkdtempSync(join(tmpdir(), "kaal-acceptance-"));

const EXPECTED_TARBALL = [
  "package/LICENSE",
  "package/README.md",
  "package/dist/bootstrap.d.ts",
  "package/dist/bootstrap.js",
  "package/dist/cli.d.ts",
  "package/dist/cli.js",
  "package/dist/engine.d.ts",
  "package/dist/engine.js",
  "package/dist/index.d.ts",
  "package/dist/index.js",
  "package/dist/node.d.ts",
  "package/dist/node.js",
  "package/dist/payload.d.ts",
  "package/dist/payload.js",
  "package/dist/register.d.ts",
  "package/dist/register.js",
  "package/package.json",
  "package/payload/AGENTS.md",
  "package/payload/KAAL-KERNEL.md",
  "package/payload/core/KAAL-Definition.md",
  "package/payload/core/KAAL-Extension.md",
  "package/payload/core/KAAL-Skill.md",
  "package/payload/core/Node.md",
];

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
}

/** Run a command expected to fail; returns its stderr. */
function fails(cmd, args, cwd) {
  try {
    execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    assert.equal(e.status, 1, e.stderr);
    return e.stderr;
  }
  assert.fail(`${cmd} ${args.join(" ")} succeeded`);
}

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p), "utf8");
  }
  return out;
}

function packagedAgents() {
  return readFileSync(join(host, "node_modules", "kaal-core", "payload", "AGENTS.md"), "utf8");
}

function node(name, type, body) {
  return `---\nname: ${name}\n${type ? `type:\n  name: ${type.name}\n  id: ${type.id}\n` : ""}---\n\n${body}`;
}

let tarball;
let host;
let kaal;

before(() => {
  const out = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", work], PACKAGE));
  tarball = join(work, out[0].filename);
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  run("npm", ["install", "--offline", "--no-package-lock", tarball], host);
  kaal = join(host, "node_modules", ".bin", "kaal");
});

describe("package", () => {
  it("is a clean build packed into a tarball of exactly the intended contents", () => {
    const listed = run("tar", ["-tzf", tarball], work).split("\n").filter(Boolean).sort();
    assert.deepEqual(listed, EXPECTED_TARBALL);
  });

  it("carries its own explicit MIT license boundary", () => {
    const installed = join(host, "node_modules", "kaal-core");
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.equal(pkg.name, "kaal-core");
    assert.equal(pkg.license, "MIT");
    assert.match(readFileSync(join(installed, "LICENSE"), "utf8"), /^MIT License/);
    assert.equal(pkg.dependencies, undefined, "kaal-core has no runtime dependencies");
  });
});

describe("embedding into a fresh host", () => {
  let skillType;
  let extensionType;

  it("materializes .kaal/ from the package payload", () => {
    assert.deepEqual(readdirSync(host).sort(), ["node_modules", "package.json"]);
    assert.match(run(kaal, ["init"], host), /bootstrapped/);
    const engine = tree(join(host, ".kaal"));
    const carried = tree(join(host, "node_modules", "kaal-core", "payload"));
    assert.deepEqual(engine, carried);
    assert.deepEqual(Object.keys(engine), ["AGENTS.md", "KAAL-KERNEL.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/Node.md"]);
    assert.match(run(kaal, ["init"], host), /already holds the foundation/);
  });

  it("installs the Agent entry point inside the Engine, naming no Engine location", () => {
    const agents = readFileSync(join(host, ".kaal", "AGENTS.md"), "utf8");
    assert.equal(agents, packagedAgents());
    assert.match(agents, /KAAL-KERNEL\.md/);
    assert.doesNotMatch(agents, /\.kaal|myKAAL/);
    assert.match(fails(kaal, ["identify", ".kaal/AGENTS.md"], host), /not in Form/);
  });

  it("verifies the installed Engine with deterministic identities", () => {
    assert.match(run(kaal, ["verify"], host), /ok: 4 Nodes admitted/);
    const ids = run(kaal, ["identify", ...["Node", "KAAL-Definition", "KAAL-Skill", "KAAL-Extension"].map((n) => `.kaal/core/${n}.md`)], host);
    const packaged = run(process.execPath, ["--input-type=module", "-e", "import { foundation } from 'kaal-core'; const f = foundation(); for (const r of [f.node, f.definition, f.skill, f.extension]) console.log(r.id);"], host);
    assert.deepEqual(ids.split("\n").filter(Boolean).map((l) => l.split("\t")[0]), packaged.split("\n").filter(Boolean));
    const line = (name) => run(kaal, ["resolve", name], host).trim().split("\t");
    skillType = { name: "KAAL Skill", id: line("KAAL Skill")[0] };
    extensionType = { name: "KAAL Extension", id: line("KAAL Extension")[0] };
    assert.equal(line("KAAL Skill")[2], `KAAL Definition ${line("KAAL Definition")[0]}`);
  });

  it("registers a Skill and an Extension and lists the capabilities", () => {
    const skill = join(work, "contrib-skill");
    mkdirSync(skill);
    writeFileSync(join(skill, "Greeting.md"), node("Greeting", skillType, "Greet people warmly.\n"));
    const ext = join(work, "contrib-ext");
    mkdirSync(ext);
    writeFileSync(join(ext, "Clock.md"), node("Clock", extensionType, "Tell the time.\n"));
    assert.match(run(kaal, ["register", "skill", "kaal-greeting", skill], host), /^registered skill kaal-greeting/);
    assert.match(run(kaal, ["register", "extension", "kaal-clock", ext], host), /^registered extension kaal-clock/);
    const listed = run(kaal, ["list"], host).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.map(([kind, , name]) => `${kind} ${name}`), ["skill Greeting", "extension Clock"]);
    assert.match(run(kaal, ["verify"], host), /ok: 6 Nodes admitted/);
  });

  it("refuses an invalid contribution atomically", () => {
    const bad = join(work, "contrib-bad");
    mkdirSync(bad);
    writeFileSync(join(bad, "Good.md"), node("Good", skillType, "fine\n"));
    writeFileSync(join(bad, "Dangling.md"), node("Dangling", { name: "Ghost", id: "4".repeat(64) }, "points nowhere\n"));
    const before = tree(join(host, ".kaal"));
    assert.match(fails(kaal, ["register", "skill", "kaal-bad", bad], host), /Dangling\.md is not admitted/);
    assert.deepEqual(tree(join(host, ".kaal")), before);
    assert.deepEqual(readdirSync(join(host, ".kaal", "skills")), ["kaal-greeting"]);
    // Delivery metadata is not a Node: Core does not read it as a dependency declaration, it refuses it.
    const packaged = join(work, "contrib-packaged");
    mkdirSync(packaged);
    writeFileSync(join(packaged, "Good.md"), node("Good", skillType, "fine\n"));
    writeFileSync(join(packaged, "package.json"), JSON.stringify({ name: "kaal-good", dependencies: { "kaal-other": "1.0.0" } }));
    assert.match(fails(kaal, ["register", "skill", "kaal-good", packaged], host), /package\.json is not a Markdown file/);
    assert.deepEqual(tree(join(host, ".kaal")), before);
  });

  it("keeps identity, resolution and discovery when the Engine is rearranged, and init leaves it alone", () => {
    const engine = join(host, ".kaal");
    const id = (file) => run(kaal, ["identify", file], host).split("\t")[0];
    const greetingId = id(".kaal/skills/kaal-greeting/Greeting.md");
    const listed = run(kaal, ["list"], host);
    // Move and rename every file, bytes untouched; drop the packaged core/, skills/, extensions/ layout.
    const moves = Object.keys(tree(engine)).map((from, i) => ({ from, to: `rearranged/${i % 2 ? "odd" : "even"}/f${i}${from.endsWith(".md") ? ".md" : ".txt"}` }));
    for (const { from, to } of moves) {
      mkdirSync(dirname(join(engine, to)), { recursive: true });
      renameSync(join(engine, from), join(engine, to));
    }
    for (const top of ["core", "skills", "extensions"]) rmSync(join(engine, top), { recursive: true, force: true });
    const greetingAt = moves.find((m) => m.from === "skills/kaal-greeting/Greeting.md").to;
    assert.equal(id(`.kaal/${greetingAt}`), greetingId);
    assert.match(run(kaal, ["verify"], host), /ok: 6 Nodes admitted/);
    assert.equal(run(kaal, ["list"], host), listed);
    const [resolvedId, , type, paths] = run(kaal, ["resolve", "Greeting", greetingId], host).trim().split("\t");
    assert.equal(resolvedId, greetingId);
    assert.equal(type, `KAAL Skill ${skillType.id}`);
    assert.equal(paths, greetingAt);
    const before = tree(engine);
    assert.match(run(kaal, ["init"], host), /already holds the foundation/);
    assert.deepEqual(tree(engine), before);
  });

  it("refuses to init over an existing directory that is not a valid Engine", () => {
    const other = join(work, "other-host", ".kaal");
    mkdirSync(other, { recursive: true });
    writeFileSync(join(other, "notes.txt"), "not an Engine");
    assert.match(fails(kaal, ["init", "--engine", other], host), /not a valid Engine; nothing was written/);
    assert.deepEqual(tree(other), { "notes.txt": "not an Engine" });
  });

  it("operates without the engineering repository", () => {
    assert.ok(!lstatSync(join(host, "node_modules", "kaal-core")).isSymbolicLink(), "installed as a copy, not a link");
    for (const [path, text] of Object.entries(tree(join(host, "node_modules", "kaal-core")))) assert.ok(!text.includes(REPO), `${path} mentions ${REPO}`);
    // The same Core semantics wherever it is installed: move the whole host elsewhere and operate there.
    const moved = join(mkdtempSync(join(tmpdir(), "kaal-elsewhere-")), "relocated");
    cpSync(host, moved, { recursive: true, verbatimSymlinks: true });
    const there = join(moved, "node_modules", ".bin", "kaal");
    assert.match(run(there, ["verify"], moved), /ok: 6 Nodes admitted/);
    assert.equal(run(there, ["list"], moved), run(kaal, ["list"], host));
    const api = run(process.execPath, ["--input-type=module", "-e", "import { capabilities } from 'kaal-core'; console.log(JSON.stringify(capabilities('.kaal')));"], moved);
    assert.deepEqual(JSON.parse(api).skills.map((r) => r.name), ["Greeting"]);
  });

  it("exports the foundational Core payload", () => {
    const out = join(work, "exported");
    run(kaal, ["export", out], host);
    assert.deepEqual(tree(out), tree(join(host, "node_modules", "kaal-core", "payload")));
  });
});

describe("Engine location", () => {
  let skillType;
  let defaultEngine;

  before(() => {
    skillType = { name: "KAAL Skill", id: run(kaal, ["resolve", "KAAL Skill"], host).split("\t")[0] };
    defaultEngine = tree(join(host, ".kaal"));
  });

  function contribution(dir, name) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.md`), node(name, skillType, `${name} behaviour.\n`));
    return dir;
  }

  /** init, verify, register, list, resolve and a refused register, all against one explicit Engine. */
  function operate(engineArg, engineDir, cwd) {
    assert.ok(!existsSync(engineDir));
    assert.match(run(kaal, ["init", "--engine", engineArg], cwd), /bootstrapped/);
    assert.deepEqual(Object.keys(tree(engineDir)), ["AGENTS.md", "KAAL-KERNEL.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/Node.md"]);
    assert.equal(readFileSync(join(engineDir, "AGENTS.md"), "utf8"), packagedAgents());
    assert.match(run(kaal, ["verify", "--engine", engineArg], cwd), /ok: 4 Nodes admitted/);
    assert.equal(run(kaal, ["list", "--engine", engineArg], cwd), "");
    const source = contribution(join(work, `contrib-${basename(engineDir)}`), "Located");
    assert.match(run(kaal, ["register", "skill", "located", source, "--engine", engineArg], cwd), /^registered skill located/);
    assert.match(run(kaal, ["list", "--engine", engineArg], cwd), /^skill\t[0-9a-f]{64}\tLocated\n$/);
    assert.match(run(kaal, ["resolve", "Located", "--engine", engineArg], cwd), /\tKAAL Skill /);
    const before = tree(engineDir);
    const bad = join(work, `bad-${basename(engineDir)}`);
    mkdirSync(bad);
    writeFileSync(join(bad, "Ghost.md"), node("Ghost", { name: "Nothing", id: "5".repeat(64) }, "x\n"));
    assert.match(fails(kaal, ["register", "skill", "ghost", bad, "--engine", engineArg], cwd), /not admitted/);
    assert.deepEqual(tree(engineDir), before);
    assert.match(run(kaal, ["init", "--engine", engineArg], cwd), /already holds the foundation/);
    assert.deepEqual(tree(engineDir), before);
    assert.match(run(kaal, ["verify", "--engine", engineArg], cwd), /ok: 5 Nodes admitted/);
    // The default Engine was never touched.
    assert.deepEqual(tree(join(host, ".kaal")), defaultEngine);
  }

  it("operates an Engine at a relative path under any name", () => {
    operate("./myKAAL", join(host, "myKAAL"), host);
  });

  it("operates an Engine at an absolute path outside the host", () => {
    const dir = join(work, "external", "engine-abs");
    operate(dir, dir, host);
  });

  it("operates an Engine at a relative path outside the host", () => {
    operate("../external-rel/E", join(work, "external-rel", "E"), host);
  });

  it("refuses ambiguous or unknown location options", () => {
    assert.match(fails(kaal, ["verify", "--engine"], host), /--engine needs a directory/);
    assert.match(fails(kaal, ["verify", "--engine", "a", "--engine", "b"], host), /unknown or repeated option --engine/);
    assert.match(fails(kaal, ["init", "--host", work], host), /unknown or repeated option --host/);
    assert.ok(!existsSync(join(work, ".kaal")));
    assert.deepEqual(tree(join(host, ".kaal")), defaultEngine);
  });
});

describe("this repository's own Engine", () => {
  const engine = join(REPO, ".kaal");

  it("is a real Engine deployed by kaal init, verified by the packaged kaal", () => {
    assert.match(run(kaal, ["verify", "--engine", engine], host), /^ok: /);
    assert.match(run(kaal, ["init", "--engine", engine], host), /already holds the foundation/);
  });

  it("is what the root AGENTS.md points to", () => {
    assert.match(readFileSync(join(REPO, "AGENTS.md"), "utf8"), /`\.kaal\/`\. Start with its `AGENTS\.md`/);
    assert.equal(readFileSync(join(engine, "AGENTS.md"), "utf8"), packagedAgents());
  });
});
