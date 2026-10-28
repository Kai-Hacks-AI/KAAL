// Acceptance: Engineering -> Package -> Embed.
//
// Inspects the kaal-core tarball the Acceptance lane packed as npm would
// publish it, installs it with its runtime dependencies kaal-foundation,
// kaal-graph and kaal-hosting, packed the same way, into a fresh, otherwise empty host outside this repository, and
// operates the Engine there through the installed packages alone.
import assert from "node:assert/strict";
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-acceptance-"));

const EXPECTED_TARBALL = [
  "package/LICENSE",
  "package/README.md",
  "package/dist/agent.d.ts",
  "package/dist/agent.js",
  "package/dist/bootstrap.d.ts",
  "package/dist/bootstrap.js",
  "package/dist/cli.d.ts",
  "package/dist/cli.js",
  "package/dist/engine.d.ts",
  "package/dist/engine.js",
  "package/dist/frontmatter.d.ts",
  "package/dist/frontmatter.js",
  "package/dist/index.d.ts",
  "package/dist/index.js",
  "package/dist/installation.d.ts",
  "package/dist/installation.js",
  "package/dist/lifecycle.d.ts",
  "package/dist/lifecycle.js",
  "package/dist/node.d.ts",
  "package/dist/node.js",
  "package/dist/payload.d.ts",
  "package/dist/payload.js",
  "package/dist/realization.d.ts",
  "package/dist/realization.js",
  "package/dist/records.d.ts",
  "package/dist/records.js",
  "package/dist/register.d.ts",
  "package/dist/register.js",
  "package/installation.kaal.json",
  "package/package.json",
  "package/payload/AGENTS.md",
  "package/payload/KAAL-KERNEL.md",
  "package/payload/core/Agent-Realization.md",
  "package/payload/core/CASE.md",
  "package/payload/core/Installation-Contract.md",
  "package/payload/core/KAAL-Agent.md",
  "package/payload/core/KAAL-Capability.md",
  "package/payload/core/KAAL-Definition.md",
  "package/payload/core/KAAL-Extension.md",
  "package/payload/core/KAAL-Skill.md",
  "package/payload/core/LOVE.md",
  "package/payload/core/Node.md",
];

// Commands run through Hosting, which owns how the host realizes them.
async function run(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd, env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r.stdout;
}

/** Run a command expected to fail; returns its stderr. */
async function fails(cmd, args, cwd) {
  const r = await execute(cmd, args, { cwd });
  assert.equal(r.status, 1, `${cmd} ${args.join(" ")} should fail\n${r.stderr}`);
  return r.stderr;
}

/** The names of the files in a .tgz, read from its bytes. */
function tarEntries(path) {
  const tar = gunzipSync(readFileSync(path));
  const names = [];
  for (let at = 0; at + 512 <= tar.length; ) {
    const header = tar.subarray(at, at + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0[\s\S]*$/, "");
    const prefix = field(345, 155);
    if (["0", ""].includes(field(156, 1))) names.push(prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    at += 512 + Math.ceil(parseInt(field(124, 12).trim() || "0", 8) / 512) * 512;
  }
  return names;
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

before(async () => {
  tarball = JSON.parse(readFileSync(join(process.env.KAAL_ACCEPTANCE_RUN, "manifest.json"), "utf8"))["kaal-core"].tarball;
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "@kaihacksai/kaal-foundation", "kaal-graph", "kaal-hosting"]);
  kaal = join(host, "node_modules", ".bin", "kaal");
});

describe("package", () => {
  it("is a tarball of exactly the intended contents", () => {
    const listed = tarEntries(tarball).sort();
    assert.deepEqual(listed, EXPECTED_TARBALL);
  });

  it("carries its own explicit MIT license boundary", async () => {
    const installed = join(host, "node_modules", "kaal-core");
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.equal(pkg.name, "kaal-core");
    assert.equal(pkg.license, "MIT");
    assert.match(readFileSync(join(installed, "LICENSE"), "utf8"), /^MIT License/);
  });

  it("depends at runtime on kaal-foundation, kaal-graph and kaal-hosting, none of which depends on kaal-core", () => {
    const core = JSON.parse(readFileSync(join(host, "node_modules", "kaal-core", "package.json"), "utf8"));
    assert.deepEqual(core.dependencies, { "@kaihacksai/kaal-foundation": "0.0.1", "kaal-graph": "0.0.1", "kaal-hosting": "0.0.1" });
    for (const dependency of ["@kaihacksai/kaal-foundation", "kaal-graph", "kaal-hosting"]) {
      const pkg = JSON.parse(readFileSync(join(host, "node_modules", dependency, "package.json"), "utf8"));
      for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) assert.equal(pkg[field]?.["kaal-core"], undefined, `${dependency} ${field}`);
    }
    assert.ok(!existsSync(join(host, "node_modules", "kaal-core", "node_modules")), "one kaal-foundation, one kaal-graph and one kaal-hosting, not copies inside kaal-core");
  });
});

describe("embedding into a fresh host", () => {
  let skillType;
  let extensionType;

  it("materializes .kaal/ from the package payload", async () => {
    assert.deepEqual(readdirSync(host).sort(), ["node_modules", "package.json"]);
    assert.match(await run(kaal, ["init"], host), /bootstrapped/);
    const { "state/core/installation.json": recorded, ...engine } = tree(join(host, ".kaal"));
    const carried = tree(join(host, "node_modules", "kaal-core", "payload"));
    assert.deepEqual(engine, carried);
    assert.deepEqual(Object.keys(JSON.parse(recorded).assets).sort(), Object.keys(carried).map((p) => `.kaal/${p}`).sort(), "init records every file it wrote in Core's record");
    assert.deepEqual(Object.keys(engine), ["AGENTS.md", "KAAL-KERNEL.md", "core/Agent-Realization.md", "core/CASE.md", "core/Installation-Contract.md", "core/KAAL-Agent.md", "core/KAAL-Capability.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/LOVE.md", "core/Node.md"]);
    assert.match(await run(kaal, ["init"], host), /already holds the foundation/);
  });

  it("installs the Agent entry point inside the Engine, naming no Engine location", async () => {
    const agents = readFileSync(join(host, ".kaal", "AGENTS.md"), "utf8");
    assert.equal(agents, packagedAgents());
    assert.match(agents, /KAAL-KERNEL\.md/);
    assert.doesNotMatch(agents, /\.kaal|myKAAL/);
    assert.match(await fails(kaal, ["identify", ".kaal/AGENTS.md"], host), /not in Form/);
  });

  it("verifies the installed Engine with deterministic identities", async () => {
    assert.match(await run(kaal, ["verify"], host), /ok: 10 Nodes admitted/);
    const ids = await run(kaal, ["identify", ...["Node", "KAAL-Definition", "KAAL-Capability", "KAAL-Agent", "KAAL-Skill", "KAAL-Extension"].map((n) => `.kaal/core/${n}.md`)], host);
    const packaged = await run(process.execPath, ["--input-type=module", "-e", "import { foundation } from 'kaal-core'; const f = foundation(); for (const r of [f.node, f.definition, f.capability, f.agent, f.skill, f.extension]) console.log(r.id);"], host);
    assert.deepEqual(ids.split("\n").filter(Boolean).map((l) => l.split("\t")[0]), packaged.split("\n").filter(Boolean));
    const line = async (name) => (await run(kaal, ["resolve", name], host)).trim().split("\t");
    skillType = { name: "KAAL Skill", id: (await line("KAAL Skill"))[0] };
    extensionType = { name: "KAAL Extension", id: (await line("KAAL Extension"))[0] };
    assert.equal((await line("KAAL Skill"))[2], `KAAL Definition ${(await line("KAAL Definition"))[0]}`);
  });

  it("registers a Skill and an Extension and lists the capabilities", async () => {
    const skill = join(work, "contrib-skill");
    mkdirSync(skill);
    writeFileSync(join(skill, "Greeting.md"), node("Greeting", skillType, "Greet people warmly.\n"));
    const ext = join(work, "contrib-ext");
    mkdirSync(ext);
    writeFileSync(join(ext, "Clock.md"), node("Clock", extensionType, "Tell the time.\n"));
    assert.match(await run(kaal, ["register", "skill", "kaal-greeting", skill], host), /^registered skill kaal-greeting/);
    assert.match(await run(kaal, ["register", "extension", "kaal-clock", ext], host), /^registered extension kaal-clock/);
    const listed = (await run(kaal, ["list"], host)).trim().split("\n").map((l) => l.split("\t"));
    assert.deepEqual(listed.map(([kind, , name]) => `${kind} ${name}`), ["skill Greeting", "extension Clock"]);
    assert.match(await run(kaal, ["verify"], host), /ok: 12 Nodes admitted/);
  });

  it("refuses an invalid contribution atomically", async () => {
    const bad = join(work, "contrib-bad");
    mkdirSync(bad);
    writeFileSync(join(bad, "Good.md"), node("Good", skillType, "fine\n"));
    writeFileSync(join(bad, "Dangling.md"), node("Dangling", { name: "Ghost", id: "4".repeat(64) }, "points nowhere\n"));
    const before = tree(join(host, ".kaal"));
    assert.match(await fails(kaal, ["register", "skill", "kaal-bad", bad], host), /Dangling\.md is not admitted/);
    assert.deepEqual(tree(join(host, ".kaal")), before);
    assert.deepEqual(readdirSync(join(host, ".kaal", "skills")), ["kaal-greeting"]);
    // Delivery metadata is not a Node: Core does not read it as a dependency declaration, it refuses it.
    const packaged = join(work, "contrib-packaged");
    mkdirSync(packaged);
    writeFileSync(join(packaged, "Good.md"), node("Good", skillType, "fine\n"));
    writeFileSync(join(packaged, "package.json"), JSON.stringify({ name: "kaal-good", dependencies: { "kaal-other": "1.0.0" } }));
    assert.match(await fails(kaal, ["register", "skill", "kaal-good", packaged], host), /package\.json is not a Markdown file/);
    assert.deepEqual(tree(join(host, ".kaal")), before);
  });

  // A host can only hold the contributions its file system can express; each
  // case below is checked wherever the host holds both names as written, and
  // reported as not expressible elsewhere. Hosting refuses the same paths in
  // memory on every host, in its own conformance suite.
  const collisions = [
    ["case", ["Greeting.md", "greeting.md"], /COLLISION|same name where case/],
    ["Unicode normalization", ["Caf\u00e9.md", "Cafe\u0301.md"], /same name where case or Unicode/],
    ["a name Windows cannot hold", ["CON.md"], /not a portable name/],
  ];
  for (const [label, names, refused] of collisions) {
    it(`refuses a contribution not portable to every host: ${label}`, async (t) => {
      const dir = mkdtempSync(join(work, "contrib-unportable-"));
      try {
        names.forEach((name, i) => writeFileSync(join(dir, name), node(`Unportable ${i}`, skillType, `${label}\n`)));
      } catch {
        return t.skip(`this host cannot write ${names.join(" and ")}`);
      }
      if (readdirSync(dir).sort().join("|") !== [...names].sort().join("|")) return t.skip(`this host cannot hold ${names.join(" and ")} as written`);
      const before = tree(join(host, ".kaal"));
      assert.match(await fails(kaal, ["register", "skill", "kaal-unportable", dir], host), refused);
      assert.deepEqual(tree(join(host, ".kaal")), before);
      assert.ok(!existsSync(join(host, ".kaal", "skills", "kaal-unportable")));
    });
  }

  it("keeps identity, resolution and discovery when the Engine is rearranged, and init leaves it alone", async () => {
    const engine = join(host, ".kaal");
    const id = async (file) => (await run(kaal, ["identify", file], host)).split("\t")[0];
    const greetingId = await id(".kaal/skills/kaal-greeting/Greeting.md");
    const listed = await run(kaal, ["list"], host);
    // Move and rename every file, bytes untouched; drop the packaged core/, skills/, extensions/ layout.
    const moves = Object.keys(tree(engine)).map((from, i) => ({ from, to: `rearranged/${i % 2 ? "odd" : "even"}/f${i}${from.endsWith(".md") ? ".md" : ".txt"}` }));
    for (const { from, to } of moves) {
      mkdirSync(dirname(join(engine, to)), { recursive: true });
      renameSync(join(engine, from), join(engine, to));
    }
    for (const top of ["core", "skills", "extensions"]) rmSync(join(engine, top), { recursive: true, force: true });
    const greetingAt = moves.find((m) => m.from === "skills/kaal-greeting/Greeting.md").to;
    assert.equal(await id(`.kaal/${greetingAt}`), greetingId);
    assert.match(await run(kaal, ["verify"], host), /ok: 12 Nodes admitted/);
    assert.equal(await run(kaal, ["list"], host), listed);
    const [resolvedId, , type, paths] = (await run(kaal, ["resolve", "Greeting", greetingId], host)).trim().split("\t");
    assert.equal(resolvedId, greetingId);
    assert.equal(type, `KAAL Skill ${skillType.id}`);
    assert.equal(paths, greetingAt);
    const before = tree(engine);
    assert.match(await run(kaal, ["init"], host), /already holds the foundation/);
    assert.deepEqual(tree(engine), before);
  });

  it("refuses to init over an existing directory that is not a valid Engine", async () => {
    const other = join(work, "other-host", ".kaal");
    mkdirSync(other, { recursive: true });
    writeFileSync(join(other, "notes.txt"), "not an Engine");
    assert.match(await fails(kaal, ["init", "--engine", other], host), /not a valid Engine; nothing was written/);
    assert.deepEqual(tree(other), { "notes.txt": "not an Engine" });
  });

  it("operates without the engineering repository", async () => {
    assert.ok(!lstatSync(join(host, "node_modules", "kaal-core")).isSymbolicLink(), "installed as a copy, not a link");
    for (const [path, text] of Object.entries(tree(join(host, "node_modules", "kaal-core")))) assert.ok(!text.includes(REPO), `${path} mentions ${REPO}`);
    // The same Core semantics wherever it is installed: move the whole host elsewhere and operate there.
    const moved = join(mkdtempSync(join(tmpdir(), "kaal-elsewhere-")), "relocated");
    cpSync(host, moved, { recursive: true, verbatimSymlinks: true });
    const there = join(moved, "node_modules", ".bin", "kaal");
    assert.match(await run(there, ["verify"], moved), /ok: 12 Nodes admitted/);
    assert.equal(await run(there, ["list"], moved), await run(kaal, ["list"], host));
    const api = await run(process.execPath, ["--input-type=module", "-e", "import { capabilities } from 'kaal-core'; console.log(JSON.stringify(await capabilities('.kaal')));"], moved);
    assert.deepEqual(JSON.parse(api).skills.map((r) => r.name), ["Greeting"]);
  });

  it("exports the foundational Core payload", async () => {
    const out = join(work, "exported");
    await run(kaal, ["export", out], host);
    assert.deepEqual(tree(out), tree(join(host, "node_modules", "kaal-core", "payload")));
  });
});

describe("Engine location", () => {
  let skillType;
  let defaultEngine;

  before(async () => {
    skillType = { name: "KAAL Skill", id: (await run(kaal, ["resolve", "KAAL Skill"], host)).split("\t")[0] };
    defaultEngine = tree(join(host, ".kaal"));
  });

  function contribution(dir, name) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${name}.md`), node(name, skillType, `${name} behaviour.\n`));
    return dir;
  }

  /** init, verify, register, list, resolve and a refused register, all against one explicit Engine. */
  async function operate(engineArg, engineDir, cwd) {
    assert.ok(!existsSync(engineDir));
    assert.match(await run(kaal, ["init", "--engine", engineArg], cwd), /bootstrapped/);
    assert.deepEqual(Object.keys(tree(engineDir)), ["AGENTS.md", "KAAL-KERNEL.md", "core/Agent-Realization.md", "core/CASE.md", "core/Installation-Contract.md", "core/KAAL-Agent.md", "core/KAAL-Capability.md", "core/KAAL-Definition.md", "core/KAAL-Extension.md", "core/KAAL-Skill.md", "core/LOVE.md", "core/Node.md"]);
    assert.equal(readFileSync(join(engineDir, "AGENTS.md"), "utf8"), packagedAgents());
    assert.match(await run(kaal, ["verify", "--engine", engineArg], cwd), /ok: 10 Nodes admitted/);
    assert.equal(await run(kaal, ["list", "--engine", engineArg], cwd), "");
    const source = contribution(join(work, `contrib-${basename(engineDir)}`), "Located");
    assert.match(await run(kaal, ["register", "skill", "located", source, "--engine", engineArg], cwd), /^registered skill located/);
    assert.match(await run(kaal, ["list", "--engine", engineArg], cwd), /^skill\t[0-9a-f]{64}\tLocated\n$/);
    assert.match(await run(kaal, ["resolve", "Located", "--engine", engineArg], cwd), /\tKAAL Skill /);
    const before = tree(engineDir);
    const bad = join(work, `bad-${basename(engineDir)}`);
    mkdirSync(bad);
    writeFileSync(join(bad, "Ghost.md"), node("Ghost", { name: "Nothing", id: "5".repeat(64) }, "x\n"));
    assert.match(await fails(kaal, ["register", "skill", "ghost", bad, "--engine", engineArg], cwd), /not admitted/);
    assert.deepEqual(tree(engineDir), before);
    assert.match(await run(kaal, ["init", "--engine", engineArg], cwd), /already holds the foundation/);
    assert.deepEqual(tree(engineDir), before);
    assert.match(await run(kaal, ["verify", "--engine", engineArg], cwd), /ok: 11 Nodes admitted/);
    // The default Engine was never touched.
    assert.deepEqual(tree(join(host, ".kaal")), defaultEngine);
  }

  it("operates an Engine at a relative path under any name", async () => {
    await operate("./myKAAL", join(host, "myKAAL"), host);
  });

  it("operates an Engine at an absolute path outside the host", async () => {
    const dir = join(work, "external", "engine-abs");
    await operate(dir, dir, host);
  });

  it("operates an Engine at a relative path outside the host", async () => {
    await operate("../external-rel/E", join(dirname(host), "external-rel", "E"), host);
  });

  it("initializes the current directory in place when it is empty", async () => {
    const dir = join(work, "here");
    mkdirSync(dir);
    const ino = statSync(dir).ino;
    assert.match(await run(kaal, ["init", "--engine", "."], dir), /bootstrapped/);
    assert.equal(statSync(dir).ino, ino);
    assert.match(await run(kaal, ["verify", "--engine", "."], dir), /^ok: 10 Nodes admitted/);
    assert.deepEqual(tree(dir), tree(join(host, "node_modules", "kaal-core", "payload")));
  });

  it("refuses ambiguous or unknown location options", async () => {
    assert.match(await fails(kaal, ["verify", "--engine"], host), /--engine needs a directory/);
    assert.match(await fails(kaal, ["verify", "--engine", "a", "--engine", "b"], host), /unknown or repeated option --engine/);
    assert.match(await fails(kaal, ["init", "--host", work], host), /unknown or repeated option --host/);
    assert.ok(!existsSync(join(work, ".kaal")));
    assert.deepEqual(tree(join(host, ".kaal")), defaultEngine);
  });
});

describe("this repository's own Engine", () => {
  const engine = join(REPO, ".kaal");

  it("is a real Engine deployed by kaal init, verified by the packaged kaal", async () => {
    assert.match(await run(kaal, ["verify", "--engine", engine], host), /^ok: /);
    assert.match(await run(kaal, ["init", "--engine", engine], host), /already holds the foundation/);
  });

  it("is what the root AGENTS.md points to", async () => {
    // The pointer's contract is the paths it names (code spans and link targets), not its prose.
    const root = readFileSync(join(REPO, "AGENTS.md"), "utf8");
    const named = [...root.matchAll(/`([^`]+)`|\]\(([^)]+)\)/g)].map((m) => resolve(REPO, m[1] ?? m[2]));
    assert.ok(named.includes(engine), "names the Engine directory");
    assert.ok(named.includes(join(engine, "AGENTS.md")), "names the Engine's AGENTS.md as the entry point");
    assert.equal(readFileSync(join(engine, "AGENTS.md"), "utf8"), packagedAgents());
    // A pointer, not a second authority: it repeats none of the Engine's own notes.
    for (const line of packagedAgents().split("\n").filter((l) => l.startsWith("- "))) assert.ok(!root.includes(line), `repeats: ${line}`);
  });
});
