// Acceptance: kaal-engineer-skill, Engineering -> Package -> Embed.
//
// Packs kaal-core and kaal-engineer-skill as npm would publish them, installs
// both tarballs into a fresh host outside this repository, registers the
// Engineer Skill through Core into an Engine at an arbitrary location, and
// runs the shipped Agent Skill's checker from wherever a host might put it.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-engineer-skill-acceptance-"));

const EXPECTED_TARBALL = [
  "package/LICENSE",
  "package/README.md",
  "package/package.json",
  "package/payload/Engineer-Skill.md",
  "package/skills/kaal-engineer-skill/SKILL.md",
  "package/skills/kaal-engineer-skill/references/agent-skills.md",
  "package/skills/kaal-engineer-skill/references/kaal-skill.md",
  "package/skills/kaal-engineer-skill/scripts/check-skill.mjs",
];

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
}

/** Run a command expected to exit 1; returns its stderr. */
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

function pack(name) {
  const out = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", work], join(REPO, "packages", name)));
  return join(work, out[0].filename);
}

let tarball;
let host;
let installed;
let kaal;
let checker;
let engine;

before(() => {
  const core = pack("kaal-core");
  tarball = pack("kaal-engineer-skill");
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  run("npm", ["install", "--offline", "--no-package-lock", core, tarball], host);
  installed = join(host, "node_modules", "kaal-engineer-skill");
  kaal = join(host, "node_modules", ".bin", "kaal");
  checker = join(host, "node_modules", ".bin", "kaal-engineer-skill");
  engine = join(work, "elsewhere", "EngineX");
});

describe("package", () => {
  it("ships exactly its KAAL contribution and its Agent Skill", () => {
    const listed = run("tar", ["-tzf", tarball], work).split("\n").filter(Boolean).sort();
    assert.deepEqual(listed, EXPECTED_TARBALL);
  });

  it("carries its own MIT license boundary and no runtime dependencies", () => {
    const pkg = JSON.parse(readFileSync(join(installed, "package.json"), "utf8"));
    assert.equal(pkg.license, "MIT");
    assert.match(readFileSync(join(installed, "LICENSE"), "utf8"), /^MIT License/);
    assert.equal(pkg.dependencies, undefined);
  });
});

describe("embedding into an Engine", () => {
  it("registers the Engineer Skill through Core alone", () => {
    assert.match(run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.equal(run(kaal, ["list", "--engine", engine], host), "");
    assert.match(run(kaal, ["register", "skill", "kaal-engineer-skill", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-engineer-skill/);
    const listed = run(kaal, ["list", "--engine", engine], host).trim().split("\t");
    assert.deepEqual([listed[0], listed[2]], ["skill", "Engineer Skill"]);
    const [id, name, type] = run(kaal, ["identify", join(installed, "payload", "Engineer-Skill.md")], host).trim().split("\t");
    assert.equal(listed[1], id);
    assert.equal(name, "Engineer Skill");
    assert.equal(type, `KAAL Skill ${run(kaal, ["resolve", "KAAL Skill", "--engine", engine], host).split("\t")[0]}`);
    assert.match(run(kaal, ["verify", "--engine", engine], host), /ok: 5 Nodes admitted/);
  });

  it("leaves Core untouched", () => {
    assert.deepEqual(tree(join(host, "node_modules", "kaal-core", "payload")), tree(join(REPO, "packages", "kaal-core", "payload")));
  });
});

describe("the shipped checker", () => {
  it("passes the installed package against itself, against a fresh and against an existing Engine", () => {
    assert.match(run(checker, ["--package", installed], host), /^ok/);
    assert.match(run(checker, ["--package", installed, "--engine", engine], host), /^ok/);
    assert.match(run(checker, [join(installed, "skills", "kaal-engineer-skill")], host), /^ok/);
  });

  it("works from wherever a host keeps skills, outside any repository", () => {
    for (const where of ["agent-skills", join("deep", "x", "skills")]) {
      const placed = join(mkdtempSync(join(tmpdir(), "kaal-host-skills-")), where, "kaal-engineer-skill");
      mkdirSync(dirname(placed), { recursive: true });
      cpSync(join(installed, "skills", "kaal-engineer-skill"), placed, { recursive: true });
      assert.ok(!existsSync(join(placed, "..", "..", ".git")));
      assert.match(run(process.execPath, [join(placed, "scripts", "check-skill.mjs"), placed], dirname(placed)), /^ok/);
    }
  });

  it("names no host skills location", () => {
    for (const [path, text] of Object.entries(tree(installed))) assert.doesNotMatch(text, /\.claude\/|\.agents\/|\.codex\/|\.cursor\//, path);
  });

  it("refuses non-conformant Skill packages, each by its problem", () => {
    const skillType = run(kaal, ["resolve", "KAAL Skill", "--engine", engine], host).split("\t")[0];
    const goodNode = `---\nname: Thing\ntype:\n  name: KAAL Skill\n  id: ${skillType}\n---\n\n# Thing\n`;
    const fixture = (label, { name = "kaal-thing", files = ["payload", "skills"], skill = "kaal-thing", manifest, node = goodNode } = {}) => {
      const dir = join(work, "fixtures", label);
      mkdirSync(join(dir, "payload"), { recursive: true });
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name, version: "0.0.1", files }));
      writeFileSync(join(dir, "payload", "Thing.md"), node);
      mkdirSync(join(dir, "skills", skill), { recursive: true });
      if (manifest !== null) writeFileSync(join(dir, "skills", skill, "SKILL.md"), manifest ?? `---\nname: ${skill}\ndescription: Does the thing. Use when the thing is needed.\n---\n\nSee [guide](references/guide.md) when needed.\n`);
      if (manifest === undefined) {
        mkdirSync(join(dir, "skills", skill, "references"));
        writeFileSync(join(dir, "skills", skill, "references", "guide.md"), "guide");
      }
      return dir;
    };
    const check = (dir) => fails(checker, ["--package", dir], host);
    const description = "description: Does the thing.\n";

    assert.match(run(checker, ["--package", fixture("good")], host), /^ok/);
    assert.match(check(fixture("uppercase", { manifest: `---\nname: Kaal-Thing\n${description}---\n` })), /name Kaal-Thing is not 1-64 lowercase/);
    assert.match(check(fixture("mismatch", { manifest: `---\nname: kaal-other\n${description}---\n` })), /name kaal-other does not match its directory name kaal-thing/);
    assert.match(check(fixture("long-description", { manifest: `---\nname: kaal-thing\ndescription: ${"d".repeat(1025)}\n---\n` })), /description is not a string of 1-1024/);
    assert.match(check(fixture("unknown-field", { manifest: `---\nname: kaal-thing\n${description}version: "1"\n---\n` })), /field version is not in the Agent Skills standard/);
    assert.match(check(fixture("no-manifest", { manifest: null })), /does not ship its Agent Skill, skills\/kaal-thing\/SKILL\.md/);
    assert.match(check(fixture("broken-reference", { manifest: `---\nname: kaal-thing\n${description}---\n\nRun scripts/go.sh.\n` })), /scripts\/go\.sh, which does not exist/);
    assert.match(check(fixture("not-shipped", { files: ["payload"] })), /does not ship its Agent Skill/);
    assert.match(check(fixture("core-refuses", { node: goodNode.replace(skillType, "0".repeat(64)) })), /kaal-core refuses the contribution/);
  });
});
