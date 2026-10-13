// Acceptance: kaal-engineer-skill, Engineering -> Package -> Embed.
//
// Installs kaal-core and kaal-engineer-skill from their packed tarballs into
// a fresh host outside this repository, as the repository's other acceptance
// does. Core alone admits the Engineer Skill Node into an Engine at an
// arbitrary location. The shipped Agent Skill's checker, which reads only the
// skill directory, runs from wherever a host might put it.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const work = mkdtempSync(join(tmpdir(), "kaal-engineer-skill-acceptance-"));

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: "utf8", env: { ...process.env, npm_config_audit: "false", npm_config_fund: "false" } });
}

/** Run a command expected to exit with `status`; returns its stderr. */
function fails(cmd, args, cwd, status = 1) {
  try {
    execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: "pipe" });
  } catch (e) {
    assert.equal(e.status, status, e.stderr);
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

let host;
let installed;
let kaal;
let checker;
let engine;

before(() => {
  const core = pack("kaal-core");
  const tarball = pack("kaal-engineer-skill");
  host = join(work, "host");
  mkdirSync(host);
  writeFileSync(join(host, "package.json"), JSON.stringify({ name: "fresh-host", version: "1.0.0", private: true }, null, 2));
  run("npm", ["install", "--offline", "--no-package-lock", core, tarball], host);
  installed = join(host, "node_modules", "kaal-engineer-skill");
  kaal = join(host, "node_modules", ".bin", "kaal");
  checker = join(host, "node_modules", ".bin", "kaal-engineer-skill");
  engine = join(work, "elsewhere", "EngineX");
});

describe("embedding into an Engine", () => {
  it("is admitted as a Skill by Core alone", () => {
    assert.match(run(kaal, ["init", "--engine", engine], host), /bootstrapped/);
    assert.match(run(kaal, ["register", "skill", "kaal-engineer-skill", join(installed, "payload"), "--engine", engine], host), /^registered skill kaal-engineer-skill/);
    const [kind, id, name] = run(kaal, ["list", "--engine", engine], host).trim().split("\t");
    assert.deepEqual([kind, name], ["skill", "Engineer Skill"]);
    assert.equal(run(kaal, ["identify", join(installed, "payload", "Engineer-Skill.md")], host).split("\t")[0], id);
    assert.match(run(kaal, ["verify", "--engine", engine], host), /ok: 5 Nodes admitted/);
  });

  it("leaves Core untouched", () => {
    assert.deepEqual(tree(join(host, "node_modules", "kaal-core", "payload")), tree(join(REPO, "packages", "kaal-core", "payload")));
  });
});

describe("the shipped Agent Skill", () => {
  it("passes its own check, installed and from any location outside a repository", () => {
    assert.match(run(checker, [join(installed, "skills", "kaal-engineer-skill")], host), /^ok/);
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

  it("reports each finding by its kind", () => {
    const skill = (label, frontmatter, body = "# Body\n") => {
      const dir = join(work, "fixtures", label, "kaal-thing");
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "SKILL.md"), `---\n${frontmatter}---\n\n${body}`);
      return dir;
    };
    const description = "description: Does the thing. Use when the thing is needed.\n";
    assert.match(run(checker, [skill("good", `name: kaal-thing\n${description}`)], host), /^ok/);
    assert.match(fails(checker, [skill("uppercase", `name: Kaal-Thing\n${description}`)], host), /^standard: name Kaal-Thing is not 1-64 lowercase/m);
    assert.match(fails(checker, [skill("mismatch", `name: kaal-other\n${description}`)], host), /^standard: name kaal-other does not match its parent directory name kaal-thing/m);
    assert.match(fails(checker, [skill("unknown-field", `name: kaal-thing\n${description}version: "1"\n`)], host), /^standard: frontmatter field version is not in the standard/m);
    assert.match(fails(checker, [skill("broken-reference", `name: kaal-thing\n${description}`, "Run scripts/go.sh.\n")], host), /^kaal: SKILL\.md references scripts\/go\.sh/m);
    assert.match(fails(checker, [skill("folded", "name: kaal-thing\ndescription: >\n  folded\n")], host, 3), /^unsupported: /m);
  });
});
