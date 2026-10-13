import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation, identify } from "kaal-core";
import { checkPackage, checkSkill } from "kaal-engineer-skill";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(PACKAGE, "skills", "kaal-engineer-skill", "scripts", "check-skill.mjs");
const work = mkdtempSync(join(tmpdir(), "kaal-engineer-skill-"));
let count = 0;

/** A skill directory named `name` holding SKILL.md with this frontmatter and body, plus extra files. */
function skill(name, frontmatter, body = "# Body\n", files = {}) {
  const dir = join(work, `s${count++}`, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "SKILL.md"), `---\n${frontmatter}---\n\n${body}`);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

const ok = (name = "my-skill", extra = "") => `name: ${name}\ndescription: Does a thing. Use when the thing is needed.\n${extra}`;
const problems = (dir) => checkSkill(dir).problems;
const fails = (dir, pattern) => assert.ok(problems(dir).some((p) => pattern.test(p)), `expected ${pattern} in ${JSON.stringify(problems(dir))}`);

describe("checkSkill: the Agent Skills standard", () => {
  it("accepts its own Agent Skill", () => {
    assert.deepEqual(checkSkill(join(PACKAGE, "skills", "kaal-engineer-skill")), { problems: [], warnings: [] });
  });

  it("accepts a minimal skill and one with every optional field", () => {
    assert.deepEqual(problems(skill("my-skill", ok())), []);
    const full = ok("pdf-tools", 'license: Apache-2.0\ncompatibility: Requires git and jq\nmetadata:\n  author: example-org\n  version: "1.0"\nallowed-tools: Bash(git:*) Read\n');
    assert.deepEqual(problems(skill("pdf-tools", full)), []);
  });

  it("requires SKILL.md and frontmatter", () => {
    const empty = join(work, "empty", "my-skill");
    mkdirSync(empty, { recursive: true });
    fails(empty, /SKILL\.md is missing/);
    const lower = join(work, "lower", "my-skill");
    mkdirSync(lower, { recursive: true });
    writeFileSync(join(lower, "skill.md"), `---\n${ok()}---\n`);
    fails(lower, /SKILL\.md is missing/);
    const bare = join(work, "bare", "my-skill");
    mkdirSync(bare, { recursive: true });
    writeFileSync(join(bare, "SKILL.md"), "# No frontmatter\n");
    fails(bare, /does not begin with YAML frontmatter/);
  });

  it("requires name and description", () => {
    fails(skill("my-skill", "description: Does a thing.\n"), /name is required/);
    fails(skill("my-skill", "name: my-skill\n"), /description is required/);
    fails(skill("my-skill", "name: my-skill\ndescription:\n"), /description is not a string of 1-1024/);
  });

  it("holds name to the grammar and to its directory", () => {
    for (const bad of ["My-Skill", "-skill", "skill-", "my--skill", "my_skill", "a".repeat(65)]) fails(skill("x", ok(bad)), /is not 1-64 lowercase letters/);
    assert.deepEqual(problems(skill("a".repeat(64), ok("a".repeat(64)))), []);
    fails(skill("other-name", ok("my-skill")), /does not match its directory name other-name/);
  });

  it("bounds description and compatibility by characters", () => {
    const d = (n) => `name: my-skill\ndescription: ${"é".repeat(n)}\n`;
    assert.deepEqual(problems(skill("my-skill", d(1024))), []);
    fails(skill("my-skill", d(1025)), /description is not a string of 1-1024/);
    assert.deepEqual(problems(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(500)}\n`))), []);
    fails(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(501)}\n`)), /compatibility is not a string of 1-500/);
  });

  it("refuses fields outside the standard", () => {
    fails(skill("my-skill", ok("my-skill", "version: 1.0.0\n")), /field version is not in the Agent Skills standard/);
    fails(skill("my-skill", ok("my-skill", "name: again\n")), /field name appears twice/);
  });

  it("holds metadata to a map of strings", () => {
    fails(skill("my-skill", ok("my-skill", "metadata: flat\n")), /metadata is not a map/);
    fails(skill("my-skill", ok("my-skill", "metadata:\n")), /metadata is not a map/);
    fails(skill("my-skill", ok("my-skill", "metadata:\n  version: 1.0\n")), /version: 1\.0 is not a string in YAML; quote it/);
    fails(skill("my-skill", ok("my-skill", "metadata:\n  beta: true\n")), /beta: true is not a string/);
    fails(skill("my-skill", ok("my-skill", "metadata:\n  a: x\n    b: y\n")), /line is not understood/);
  });

  it("reads plain YAML only, and refuses what real YAML would not read as written", () => {
    fails(skill("my-skill", "name: my-skill\ndescription: Engineer Skills: create and check them.\n"), /plain value containing ": "/);
    assert.deepEqual(problems(skill("my-skill", "name: my-skill\ndescription: \"Engineer Skills: create and check them.\"\n")), []);
    assert.deepEqual(problems(skill("my-skill", "name: 'my-skill'\ndescription: 'It''s quoted: fine.'\n")), []);
    fails(skill("my-skill", "name: my-skill\ndescription: >\n  folded text\n"), /outside the plain YAML/);
    fails(skill("my-skill", "name: my-skill\ndescription: [a, b]\n"), /outside the plain YAML/);
    fails(skill("my-skill", "name: my-skill\ndescription: 'unclosed\n"), /single-quoted value is not closed/);
  });

  it("accepts CRLF line endings", () => {
    const dir = join(work, "crlf", "my-skill");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\r\n${ok().replace(/\n/g, "\r\n")}---\r\n\r\n# Body\r\n`);
    assert.deepEqual(problems(dir), []);
  });

  it("only warns past 500 lines", () => {
    const long = checkSkill(skill("my-skill", ok(), "line\n".repeat(600)));
    assert.deepEqual(long.problems, []);
    assert.match(long.warnings[0], /recommends under 500/);
  });
});

describe("checkSkill: references resolve inside the skill", () => {
  it("accepts links and paths to files it carries, and ignores URLs and anchors", () => {
    const body = "See [the guide](references/guide.md#setup) and run `node scripts/run.mjs`.\nSpec: [spec](https://agentskills.io/specification), [top](#body).\n";
    assert.deepEqual(problems(skill("my-skill", ok(), body, { "references/guide.md": "g", "scripts/run.mjs": "r" })), []);
  });

  it("refuses a missing file, a path leaving the skill, and a link escaping it", () => {
    fails(skill("my-skill", ok(), "See [guide](references/guide.md).\n"), /references references\/guide\.md, which does not exist/);
    fails(skill("my-skill", ok(), "Run scripts/missing.sh first.\n"), /scripts\/missing\.sh, which does not exist/);
    fails(skill("my-skill", ok(), "See [up](../README.md).\n"), /\.\.\/README\.md, which is not inside/);
    fails(skill("my-skill", ok(), "See [abs](/etc/hosts).\n"), /\/etc\/hosts, which is not inside/);
    const dir = skill("my-skill", ok(), "See [linked](references/outside.md).\n");
    writeFileSync(join(work, "outside.md"), "outside");
    mkdirSync(join(dir, "references"));
    symlinkSync(join(work, "outside.md"), join(dir, "references", "outside.md"));
    fails(dir, /resolves outside the skill directory through a link/);
  });
});

/** A package directory with this package.json, Agent Skills and payload Nodes. */
function pkg(manifest, { skills = {}, payload = {} } = {}) {
  const dir = join(work, `p${count++}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ version: "0.0.1", files: ["payload", "skills"], ...manifest }));
  for (const [name, frontmatter] of Object.entries(skills)) {
    mkdirSync(join(dir, "skills", name), { recursive: true });
    writeFileSync(join(dir, "skills", name, "SKILL.md"), `---\n${frontmatter}---\n\n# Body\n`);
  }
  for (const [path, text] of Object.entries(payload)) {
    mkdirSync(dirname(join(dir, "payload", path)), { recursive: true });
    writeFileSync(join(dir, "payload", path), text);
  }
  return dir;
}

const node = (name, type) => `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n# ${name}\n\n${name} behaviour.\n`;
const skillNode = (name = "Thing") => node(name, foundation().skill);
const packageProblems = async (dir) => (await checkPackage(dir)).problems;
async function packageFails(dir, pattern) {
  const found = await packageProblems(dir);
  assert.ok(found.some((p) => pattern.test(p)), `expected ${pattern} in ${JSON.stringify(found)}`);
}

describe("checkPackage: the package as npm ships it", () => {
  it("accepts this package, and its Node is typed by Core's KAAL Skill", async () => {
    assert.deepEqual(await checkPackage(PACKAGE), { problems: [], warnings: [] });
    const { readFileSync } = await import("node:fs");
    const id = identify(readFileSync(join(PACKAGE, "payload", "Engineer-Skill.md")));
    assert.equal(id.name, "Engineer Skill");
    assert.deepEqual(id.type, foundation().skill);
  });

  it("accepts a well-formed Skill package", async () => {
    assert.deepEqual(await packageProblems(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": skillNode() } })), []);
  });

  it("refuses a package name that cannot be the capability", async () => {
    await packageFails(pkg({ name: "@scope/kaal-thing" }), /is not a capability name/);
    await packageFails(pkg({ name: "Kaal-Thing" }), /is not a capability name/);
  });

  it("checks what is shipped, not what is on disk", async () => {
    await packageFails(pkg({ name: "kaal-thing", files: ["payload"] }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": skillNode() } }), /does not ship its Agent Skill/);
    await packageFails(pkg({ name: "kaal-thing", files: ["skills"] }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": skillNode() } }), /does not ship its KAAL contribution/);
  });

  it("requires exactly one Agent Skill, named as the package", async () => {
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-other": ok("kaal-other") }, payload: { "Thing.md": skillNode() } }), /exactly one Agent Skill, skills\/kaal-thing\/ \(shipped: skills\/kaal-other\)/);
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": ok("kaal-thing"), "kaal-more": ok("kaal-more") }, payload: { "Thing.md": skillNode() } }), /exactly one Agent Skill/);
  });

  it("reports the shipped Agent Skill's problems", async () => {
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": "name: kaal-thing\n" }, payload: { "Thing.md": skillNode() } }), /^skills\/kaal-thing: description is required/);
  });

  it("leaves validity of the contribution to Core", async () => {
    const dangling = node("Thing", { name: "Ghost", id: "4".repeat(64) });
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": dangling } }), /kaal-core refuses the contribution in payload\/: Thing\.md is not admitted/);
    const extension = node("Thing", foundation().extension);
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": extension } }), /kaal-core refuses/);
    await packageFails(pkg({ name: "kaal-thing" }, { skills: { "kaal-thing": ok("kaal-thing") }, payload: { "Thing.md": skillNode(), "notes.txt": "x" } }), /notes\.txt is not a Markdown file/);
  });
});

describe("the command", () => {
  const run = (...args) => {
    try {
      return { status: 0, stdout: execFileSync(process.execPath, [SCRIPT, ...args], { encoding: "utf8", stdio: "pipe" }) };
    } catch (e) {
      return { status: e.status, stderr: e.stderr };
    }
  };

  it("exits 0, 1 or 2", () => {
    assert.equal(run(join(PACKAGE, "skills", "kaal-engineer-skill")).status, 0);
    const bad = run(skill("my-skill", "name: my-skill\n"));
    assert.equal(bad.status, 1);
    assert.match(bad.stderr, /description is required/);
    assert.equal(run().status, 2);
    assert.equal(run("a", "b").status, 2);
    assert.equal(run("--package").status, 2);
    assert.equal(run("--package", PACKAGE, "--other", "x").status, 2);
  });

  it("checks a package, optionally against an existing Engine", () => {
    assert.equal(run("--package", PACKAGE).status, 0);
    const engine = join(work, "engine");
    execFileSync(process.execPath, [join(PACKAGE, "..", "kaal-core", "dist", "cli.js"), "init", "--engine", engine]);
    assert.equal(run("--package", PACKAGE, "--engine", engine).status, 0);
    assert.match(run("--package", PACKAGE, "--engine", join(work, "nowhere")).stderr, /is not a directory/);
  });
});
