// Acceptance: kaal-engineer-skill, Engineering -> Package -> Embed.
//
// Installs kaal-core, kaal-graph, kaal-hosting and kaal-engineer-skill from
// the tarballs the Acceptance lane packed into a fresh host outside this
// repository, as the repository's other acceptance does. kaal-graph is
// installed from its tarball because it is not published, so the host holds
// it once Core depends on it for Node mechanics. Core alone admits the Engineer Skill Node into an
// Engine at an arbitrary location. The shipped Agent Skill's checker, which
// reads the skill through the installed kaal-hosting, runs from wherever in
// the host the skill is placed.
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const work = mkdtempSync(join(tmpdir(), "kaal-engineer-skill-acceptance-"));

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

function tree(dir) {
  const out = {};
  for (const p of readdirSync(dir, { recursive: true, encoding: "utf8" }).sort()) {
    if (statSync(join(dir, p)).isFile()) out[p.split("\\").join("/")] = readFileSync(join(dir, p), "utf8");
  }
  return out;
}

let host;
let installed;
let kaal;
let checker;
let engine;

before(async () => {
  // kaal-hosting has registry dependencies, so the cache is preferred but not required.
  host = await install(["kaal-core", "kaal-graph", "kaal-hosting", "kaal-engineer-skill"]);
  installed = join(host, "node_modules", "kaal-engineer-skill");
  kaal = join(host, "node_modules", ".bin", "kaal");
  checker = join(host, "node_modules", ".bin", "kaal-engineer-skill");
  engine = join(work, "elsewhere", "EngineX");
});

/** An Engine's state through Core's public contract: whether it verifies, and the ids it admits. */
async function state(dir) {
  const script = "import { verify } from 'kaal-core'; const v = await verify(process.argv[1]); console.log(JSON.stringify({ ok: v.ok, problems: v.problems, ids: v.engine.nodes.map((n) => n.id).sort() }));";
  return JSON.parse(await run(process.execPath, ["--input-type=module", "-e", script, dir], host));
}

/**
 * Register the shipped Engineer Skill into a fresh Engine, optionally after
 * `prepare` has changed that Engine, and check what Engineer Skill requires:
 * the Engine verifies before and after, registration admits exactly the
 * Skill's own Nodes, its Skill Node and BASS, and the Skill Node is a Skill,
 * typed by Core's KAAL Skill.
 */
async function embeds(dir, prepare) {
  assert.match(await run(kaal, ["init", "--engine", dir], host), /bootstrapped/);
  if (prepare) await prepare(dir);
  const before = await state(dir);
  assert.ok(before.ok, before.problems.join("\n"));
  assert.match(await run(kaal, ["register", "skill", "kaal-engineer-skill", join(installed, "payload"), "--engine", dir], host), /^registered skill kaal-engineer-skill/);
  const after = await state(dir);
  assert.ok(after.ok, after.problems.join("\n"));
  const id = (await run(kaal, ["identify", join(installed, "payload", "Engineer-Skill.md")], host)).split("\t")[0];
  const bass = (await run(kaal, ["identify", join(installed, "payload", "BASS.md")], host)).split("\t")[0];
  assert.deepEqual(after.ids, [...before.ids, id, bass].sort(), "registration admits exactly the Skill's own Nodes");
  const listed = (await run(kaal, ["list", "--engine", dir], host)).trim().split("\n").map((l) => l.split("\t"));
  assert.deepEqual(listed.filter(([, , name]) => name === "Engineer Skill"), [["skill", id, "Engineer Skill"]]);
  const [resolved, , type] = (await run(kaal, ["resolve", "Engineer Skill", id, "--engine", dir], host)).trim().split("\t");
  const skillType = (await run(kaal, ["resolve", "KAAL Skill", "--engine", dir], host)).split("\t")[0];
  assert.deepEqual([resolved, type], [id, `KAAL Skill ${skillType}`]);
}

describe("embedding into an Engine", () => {
  it("is admitted as a Skill by Core alone", async () => {
    await embeds(engine);
  });

  it("holds whatever else Core's foundation carries: an unrelated valid foundational Node changes nothing", async () => {
    await embeds(join(work, "elsewhere", "EngineY"), async (dir) => {
      const definition = (await run(kaal, ["resolve", "KAAL Definition", "--engine", dir], host)).split("\t")[0];
      writeFileSync(join(dir, "core", "KAAL-Unrelated.md"), `---\nname: KAAL Unrelated\ntype:\n  name: KAAL Definition\n  id: ${definition}\n---\n\n# KAAL Unrelated\n`);
    });
  });

  it("leaves Core untouched", () => {
    assert.deepEqual(tree(join(host, "node_modules", "kaal-core", "payload")), tree(join(REPO, "packages", "kaal-core", "payload")));
  });
});

describe("the shipped Agent Skill", () => {
  it("passes its own check, installed and wherever the host places it, outside a repository", async () => {
    assert.match(await run(checker, [join(installed, "skills", "kaal-engineer-skill")], host), /^ok/);
    for (const where of ["agent-skills", join("deep", "x", "skills")]) {
      const placed = join(host, where, "kaal-engineer-skill");
      mkdirSync(dirname(placed), { recursive: true });
      cpSync(join(installed, "skills", "kaal-engineer-skill"), placed, { recursive: true });
      assert.ok(!existsSync(join(host, ".git")));
      assert.match(await run(process.execPath, [join(placed, "scripts", "check-skill.mjs"), placed], dirname(placed)), /^ok/);
    }
  });

  it("reads through the installed kaal-hosting", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.deepEqual(pkg.dependencies, { commonmark: "0.31.2", "kaal-hosting": "0.0.1", yaml: "2.9.1" });
    assert.ok(existsSync(join(host, "node_modules", "kaal-hosting", "dist", "index.js")));
  });

  it("names no host skills location", () => {
    for (const [path, text] of Object.entries(tree(installed))) assert.doesNotMatch(text, /\.claude\/|\.agents\/|\.codex\/|\.cursor\//, path);
  });

  it("reports each finding by its kind", async () => {
    const skill = (label, frontmatter, body = "# Body\n") => {
      const dir = join(work, "fixtures", label, "kaal-thing");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "SKILL.md"), `---\n${frontmatter}---\n\n${body}`);
      return dir;
    };
    const description = "description: Does the thing. Use when the thing is needed.\n";
    assert.match(await run(checker, [skill("good", `name: kaal-thing\n${description}`)], host), /^ok/);
    assert.match(await fails(checker, [skill("uppercase", `name: Kaal-Thing\n${description}`)], host), /^standard: name Kaal-Thing is not 1-64 lowercase/m);
    assert.match(await fails(checker, [skill("mismatch", `name: kaal-other\n${description}`)], host), /^standard: name kaal-other does not match its parent directory name kaal-thing/m);
    assert.match(await fails(checker, [skill("unknown-field", `name: kaal-thing\n${description}version: "1"\n`)], host), /^standard: frontmatter field version is not in the standard/m);
    assert.match(await fails(checker, [skill("broken-reference", `name: kaal-thing\n${description}`, "Run scripts/go.sh.\n")], host), /^kaal: SKILL\.md references scripts\/go\.sh/m);
    assert.match(await run(checker, [skill("folded", "name: kaal-thing\ndescription: >\n  folded\n")], host), /^ok/);
    assert.match(await fails(checker, [skill("invalid-yaml", "name: kaal-thing\ndescription: Does: the thing\n")], host), /^standard: frontmatter is not valid YAML/m);
  });
});
