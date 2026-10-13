import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation, identify } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OWN = join(PACKAGE, "skills", "kaal-engineer-skill");
const SCRIPT = join(OWN, "scripts", "check-skill.mjs");
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
const clean = { standard: [], kaal: [], unsupported: [], warnings: [] };
/** Assert the only findings are of `kind`, and one of them matches. */
function only(dir, kind, pattern) {
  const found = checkSkill(dir);
  for (const other of ["standard", "kaal", "unsupported"]) if (other !== kind) assert.deepEqual(found[other], [], `${other}: ${JSON.stringify(found)}`);
  assert.ok(found[kind].some((m) => pattern.test(m)), `expected ${kind} ${pattern} in ${JSON.stringify(found)}`);
}

describe("standard: the Agent Skills specification", () => {
  it("accepts its own Agent Skill", () => {
    assert.deepEqual(checkSkill(OWN), clean);
  });

  it("accepts a minimal skill and one with every optional field", () => {
    assert.deepEqual(checkSkill(skill("my-skill", ok())), clean);
    const full = ok("pdf-tools", 'license: Apache-2.0\ncompatibility: Requires git and jq\nmetadata:\n  author: example-org\n  version: "1.0"\nallowed-tools: Bash(git:*) Read\n');
    assert.deepEqual(checkSkill(skill("pdf-tools", full)), clean);
  });

  it("requires SKILL.md, exactly so named, and frontmatter", () => {
    const empty = join(work, "empty", "my-skill");
    mkdirSync(empty, { recursive: true });
    only(empty, "standard", /SKILL\.md is missing/);
    const lower = join(work, "lower", "my-skill");
    mkdirSync(lower, { recursive: true });
    writeFileSync(join(lower, "skill.md"), `---\n${ok()}---\n`);
    only(lower, "standard", /SKILL\.md is missing/);
    const bare = join(work, "bare", "my-skill");
    mkdirSync(bare, { recursive: true });
    writeFileSync(join(bare, "SKILL.md"), "# No frontmatter\n");
    only(bare, "standard", /does not begin with YAML frontmatter/);
  });

  it("requires name and description", () => {
    only(skill("my-skill", "description: Does a thing.\n"), "standard", /name is required/);
    only(skill("my-skill", "name: my-skill\n"), "standard", /description is required/);
    only(skill("my-skill", "name: my-skill\ndescription:\n"), "standard", /description is not a string of 1-1024/);
  });

  it("holds name to the grammar and to its parent directory", () => {
    for (const bad of ["My-Skill", "-skill", "skill-", "my--skill", "my_skill", "a".repeat(65)]) only(skill("x", ok(bad)), "standard", /is not 1-64 lowercase letters/);
    assert.deepEqual(checkSkill(skill("a".repeat(64), ok("a".repeat(64)))), clean);
    only(skill("other-name", ok("my-skill")), "standard", /name my-skill does not match its parent directory name other-name/);
  });

  it("bounds description and compatibility by characters", () => {
    const d = (n) => `name: my-skill\ndescription: ${"é".repeat(n)}\n`;
    assert.deepEqual(checkSkill(skill("my-skill", d(1024))), clean);
    only(skill("my-skill", d(1025)), "standard", /description is not a string of 1-1024/);
    assert.deepEqual(checkSkill(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(500)}\n`))), clean);
    only(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(501)}\n`)), "standard", /compatibility is not a string of 1-500/);
  });

  it("refuses fields outside the standard and duplicate keys", () => {
    only(skill("my-skill", ok("my-skill", "version: 1.0.0\n")), "standard", /field version is not in the standard/);
    only(skill("my-skill", ok("my-skill", "name: again\n")), "standard", /field name appears twice/);
  });

  it("holds metadata to a map of strings", () => {
    only(skill("my-skill", ok("my-skill", "metadata: flat\n")), "standard", /metadata is not a map/);
    only(skill("my-skill", ok("my-skill", "metadata:\n")), "standard", /metadata is not a map/);
    only(skill("my-skill", ok("my-skill", "metadata:\n  version: 1.0\n")), "standard", /version: 1\.0 is not a string in YAML/);
    only(skill("my-skill", ok("my-skill", "metadata:\n  beta: true\n")), "standard", /beta: true is not a string/);
  });

  it("reports frontmatter YAML itself refuses as a standard violation", () => {
    only(skill("my-skill", "name: my-skill\ndescription: Engineer Skills: create and check them.\n"), "standard", /not valid YAML as written/);
    only(skill("my-skill", "name: my-skill\ndescription: 'unclosed\n"), "standard", /single-quoted value is not closed/);
    assert.deepEqual(checkSkill(skill("my-skill", "name: my-skill\ndescription: \"Engineer Skills: create and check them.\"\n")), clean);
    assert.deepEqual(checkSkill(skill("my-skill", "name: 'my-skill'\ndescription: 'It''s quoted: fine.'\n")), clean);
  });

  it("accepts CRLF line endings, and only warns past 500 lines", () => {
    const dir = join(work, "crlf", "my-skill");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "SKILL.md"), `---\r\n${ok().replace(/\n/g, "\r\n")}---\r\n\r\n# Body\r\n`);
    assert.deepEqual(checkSkill(dir), clean);
    const long = checkSkill(skill("my-skill", ok(), "line\n".repeat(600)));
    assert.deepEqual({ ...long, warnings: [] }, clean);
    assert.match(long.warnings[0], /recommends under 500/);
  });
});

describe("unsupported: the checker's own YAML limits, not violations", () => {
  it("leaves valid YAML outside its subset undecided", () => {
    only(skill("my-skill", "name: my-skill\ndescription: >\n  folded text\n"), "unsupported", /outside the plain YAML this checker reads/);
    only(skill("my-skill", "name: my-skill\ndescription: \"tab\\x41\"\n"), "unsupported", /double-quoted value is outside/);
    only(skill("my-skill", ok("my-skill", "metadata:\n  a: x\n    b: y\n")), "unsupported", /frontmatter line is outside/);
  });
});

describe("kaal: engineering rules beyond the standard", () => {
  it("accepts references to files the skill carries, and ignores URLs and anchors", () => {
    const body = "See [the guide](references/guide.md#setup) and run `node scripts/run.mjs`.\nSpec: [spec](https://agentskills.io/specification), [top](#body).\n";
    assert.deepEqual(checkSkill(skill("my-skill", ok(), body, { "references/guide.md": "g", "scripts/run.mjs": "r" })), clean);
  });

  it("refuses a missing file, a path leaving the skill, and a link escaping it", () => {
    only(skill("my-skill", ok(), "See [guide](references/guide.md).\n"), "kaal", /references\/guide\.md, which does not exist/);
    only(skill("my-skill", ok(), "Run scripts/missing.sh first.\n"), "kaal", /scripts\/missing\.sh, which does not exist/);
    only(skill("my-skill", ok(), "See [up](../README.md).\n"), "kaal", /\.\.\/README\.md, which is not inside/);
    only(skill("my-skill", ok(), "See [abs](/etc/hosts).\n"), "kaal", /\/etc\/hosts, which is not inside/);
    const dir = skill("my-skill", ok(), "See [linked](references/outside.md).\n");
    writeFileSync(join(work, "outside.md"), "outside");
    mkdirSync(join(dir, "references"));
    symlinkSync(join(work, "outside.md"), join(dir, "references", "outside.md"));
    only(dir, "kaal", /resolves outside the skill directory through a link/);
  });
});

describe("responsibility boundaries", () => {
  it("reads only the skill directory: no packaging, no package names, no Skill count", () => {
    // A package that names itself differently, carries two skills and a broken manifest: each skill is judged on its own.
    const root = join(work, "unrelated-package-name");
    mkdirSync(root);
    writeFileSync(join(root, "package.json"), "{ not json");
    for (const name of ["first-skill", "second-skill"]) {
      mkdirSync(join(root, "skills", name), { recursive: true });
      writeFileSync(join(root, "skills", name, "SKILL.md"), `---\n${ok(name)}---\n\n# Body\n`);
      assert.deepEqual(checkSkill(join(root, "skills", name)), clean);
    }
  });

  it("does not judge KAAL Nodes: Core does", () => {
    // A Node beside the skill that Core would refuse does not affect Agent Skill conformance.
    const dir = skill("my-skill", ok(), "# Body\n", { "Broken-Node.md": "---\nname: Broken\ntype:\n  name: Ghost\n  id: nothing\n---\n" });
    assert.deepEqual(checkSkill(dir), clean);
    // This package's own Node is judged by Core alone.
    const id = identify(readFileSync(join(PACKAGE, "payload", "Engineer-Skill.md")));
    assert.equal(id.name, "Engineer Skill");
    assert.deepEqual(id.type, foundation().skill);
  });

  it("needs neither kaal-core nor npm, and runs from any host location", () => {
    const placed = join(mkdtempSync(join(tmpdir(), "any-host-")), "some", "skills", "kaal-engineer-skill");
    mkdirSync(dirname(placed), { recursive: true });
    cpSync(OWN, placed, { recursive: true });
    const out = execFileSync(process.execPath, [join(placed, "scripts", "check-skill.mjs"), placed], { cwd: dirname(placed), encoding: "utf8", env: { PATH: "" } });
    assert.equal(out, "ok\n");
    const text = readFileSync(join(placed, "scripts", "check-skill.mjs"), "utf8");
    assert.doesNotMatch(text, /kaal-core|child_process|npm/);
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

  it("exits 0 when clean, 1 on a violation, 3 when undecided, 2 on misuse, naming each finding's kind", () => {
    assert.equal(run(OWN).status, 0);
    const standard = run(skill("my-skill", "name: my-skill\n"));
    assert.equal(standard.status, 1);
    assert.match(standard.stderr, /^standard: description is required$/m);
    const kaal = run(skill("my-skill", ok(), "See [g](references/g.md).\n"));
    assert.equal(kaal.status, 1);
    assert.match(kaal.stderr, /^kaal: SKILL\.md references references\/g\.md/m);
    const undecided = run(skill("my-skill", "name: my-skill\ndescription: >\n  folded\n"));
    assert.equal(undecided.status, 3);
    assert.match(undecided.stderr, /^unsupported: /m);
    assert.match(undecided.stderr, /^undecided: /m);
    assert.equal(run().status, 2);
    assert.equal(run("a", "b").status, 2);
    assert.equal(run("--package", PACKAGE).status, 2);
  });
});
