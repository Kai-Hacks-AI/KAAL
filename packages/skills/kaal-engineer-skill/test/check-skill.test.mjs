import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { foundation, identify } from "kaal-core";
import { checkSkill } from "kaal-engineer-skill";
import { execute, read } from "kaal-hosting";

const VALIDATOR = fileURLToPath(import.meta.resolve("kaal-engineer-skill"));

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OWN = join(PACKAGE, "skills", "kaal-engineer-skill");
const SCRIPT = join(OWN, "scripts", "check-skill.mjs");
const work = mkdtempSync(join(tmpdir(), "kaal-engineer-skill-"));
let count = 0;

/** A skill in memory: its directory name, and SKILL.md with this frontmatter and body, plus extra files. */
function skill(name, frontmatter, body = "# Body\n", files = {}) {
  return { name, files: { "SKILL.md": `---\n${frontmatter}---\n\n${body}`, ...files } };
}

/** A skill's directory on disk, read through kaal-hosting as the entry point reads it. */
async function fromDisk(dir) {
  return { name: dir.split(/[\\/]/).pop(), files: await read(dir) };
}

/** Write an in-memory skill to disk under its name; returns its directory. */
function toDisk({ name, files }) {
  const dir = join(work, `d${count++}`, name);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  }
  return dir;
}

const check = ({ name, files }) => checkSkill(name, files);
const ok = (name = "my-skill", extra = "") => `name: ${name}\ndescription: Does a thing. Use when the thing is needed.\n${extra}`;
const clean = { standard: [], kaal: [], warnings: [] };
/** Assert the only findings are of `kind`, and one of them matches. */
function only(s, kind, pattern) {
  const found = check(s);
  for (const other of ["standard", "kaal"]) if (other !== kind) assert.deepEqual(found[other], [], `${other}: ${JSON.stringify(found)}`);
  assert.ok(found[kind].some((m) => pattern.test(m)), `expected ${kind} ${pattern} in ${JSON.stringify(found)}`);
}

describe("standard: the Agent Skills specification", () => {
  it("accepts its own Agent Skill", async () => {
    assert.deepEqual(check(await fromDisk(OWN)), clean);
  });

  it("accepts a minimal skill and one with every optional field", () => {
    assert.deepEqual(check(skill("my-skill", ok())), clean);
    const full = ok("pdf-tools", 'license: Apache-2.0\ncompatibility: Requires git and jq\nmetadata:\n  author: example-org\n  version: "1.0"\nallowed-tools: Bash(git:*) Read\n');
    assert.deepEqual(check(skill("pdf-tools", full)), clean);
  });

  it("requires SKILL.md, exactly so named, and frontmatter", () => {
    only({ name: "my-skill", files: {} }, "standard", /SKILL\.md is missing/);
    only({ name: "my-skill", files: { "skill.md": `---\n${ok()}---\n` } }, "standard", /SKILL\.md is missing/);
    only({ name: "my-skill", files: { "SKILL.md": "# No frontmatter\n" } }, "standard", /does not begin with YAML frontmatter/);
  });

  it("requires name and description", () => {
    only(skill("my-skill", "description: Does a thing.\n"), "standard", /name is required/);
    only(skill("my-skill", "name: my-skill\n"), "standard", /description is required/);
    only(skill("my-skill", "name: my-skill\ndescription:\n"), "standard", /description is not a string of 1-1024/);
    only(skill("my-skill", 'name: my-skill\ndescription: "   "\n'), "standard", /description is not a string of 1-1024/);
    only(skill("my-skill", ok("my-skill", 'compatibility: " "\n')), "standard", /compatibility is not a string of 1-500/);
  });

  it("holds name to the grammar and to its parent directory", () => {
    for (const bad of ["My-Skill", "-skill", "skill-", "my--skill", "my_skill", "a".repeat(65)]) only(skill("x", ok(bad)), "standard", /is not 1-64 lowercase letters/);
    assert.deepEqual(check(skill("a".repeat(64), ok("a".repeat(64)))), clean);
    only(skill("other-name", ok("my-skill")), "standard", /name my-skill does not match its parent directory name other-name/);
  });

  it("bounds description and compatibility by characters", () => {
    const d = (n) => `name: my-skill\ndescription: ${"é".repeat(n)}\n`;
    assert.deepEqual(check(skill("my-skill", d(1024))), clean);
    only(skill("my-skill", d(1025)), "standard", /description is not a string of 1-1024/);
    assert.deepEqual(check(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(500)}\n`))), clean);
    only(skill("my-skill", ok("my-skill", `compatibility: ${"x".repeat(501)}\n`)), "standard", /compatibility is not a string of 1-500/);
  });

  it("refuses fields outside the standard and duplicate keys", () => {
    only(skill("my-skill", ok("my-skill", "version: 1.0.0\n")), "standard", /field version is not in the standard/);
    only(skill("my-skill", ok("my-skill", "name: again\n")), "standard", /not valid YAML: Map keys must be unique/);
  });

  it("holds metadata to a map of strings", () => {
    only(skill("my-skill", ok("my-skill", "metadata: flat\n")), "standard", /metadata is not a map/);
    only(skill("my-skill", ok("my-skill", "metadata:\n")), "standard", /metadata is not a map/);
    for (const value of ["1.0", "true", "", "null", "~", "0x1F"]) only(skill("my-skill", ok("my-skill", `metadata:\n  version: ${value}\n`)), "standard", /metadata version: the value is not a string in YAML/);
    only(skill("my-skill", ok("my-skill", "metadata:\n  1: value\n")), "standard", /metadata key 1 is not a string in YAML/);
    assert.deepEqual(check(skill("my-skill", ok("my-skill", 'metadata:\n  version: "1.0"\n  "1": value\n  flag: yes\n'))), clean);
  });

  it("reads trailing YAML comments as comments", () => {
    assert.deepEqual(check(skill("my-skill", "name: my-skill # the name\ndescription: Does a thing # explanation\nmetadata: # map\n  author: me # who\n")), clean);
    assert.deepEqual(check(skill("my-skill", "name: 'my-skill' # quoted\ndescription: \"Does: a thing\" # quoted\n")), clean);
    assert.deepEqual(check(skill("my-skill", "name: my-skill\ndescription: Issue#42 stays part of the value\n")), clean);
    only(skill("my-skill", "name: my-skill\ndescription: # nothing but a comment\n"), "standard", /description is not a string of 1-1024/);
  });

  it("reports frontmatter YAML itself refuses as a standard violation", () => {
    only(skill("my-skill", "name: my-skill\ndescription: Engineer Skills: create and check them.\n"), "standard", /not valid YAML/);
    only(skill("my-skill", "name: my-skill\ndescription: 'unclosed\n"), "standard", /not valid YAML/);
    only(skill("my-skill", "- name: my-skill\n"), "standard", /not a YAML mapping of fields/);
    assert.deepEqual(check(skill("my-skill", "name: my-skill\ndescription: \"Engineer Skills: create and check them.\"\n")), clean);
    assert.deepEqual(check(skill("my-skill", "name: 'my-skill'\ndescription: 'It''s quoted: fine.'\n")), clean);
  });

  it("reads bytes or text, accepts CRLF line endings, and only warns past 500 lines", () => {
    const crlf = `---\r\n${ok().replace(/\n/g, "\r\n")}---\r\n\r\n# Body\r\n`;
    assert.deepEqual(checkSkill("my-skill", { "SKILL.md": crlf }), clean);
    assert.deepEqual(checkSkill("my-skill", { "SKILL.md": new TextEncoder().encode(crlf) }), clean);
    const long = check(skill("my-skill", ok(), "line\n".repeat(600)));
    assert.deepEqual({ ...long, warnings: [] }, clean);
    assert.match(long.warnings[0], /recommends under 500/);
  });

  it("accepts any YAML the standard permits, read by a YAML parser", () => {
    assert.deepEqual(check(skill("my-skill", "name: my-skill\ndescription: >\n  folded\n  text\n")), clean);
    assert.deepEqual(check(skill("my-skill", "name: my-skill\ndescription: |\n  literal text\n")), clean);
    assert.deepEqual(check(skill("my-skill", "name: my-skill\ndescription: \"tab\\x41\"\n")), clean);
    assert.deepEqual(check(skill("my-skill", "{ name: my-skill, description: Flow style. }\n")), clean);
    assert.deepEqual(check(skill("my-skill", ok("my-skill", "metadata: { author: me, version: '2' }\n"))), clean);
    only(skill("my-skill", "name: my-skill\ndescription: >\n"), "standard", /description is not a string of 1-1024/);
    assert.deepEqual(check(skill("my-skill", ok("my-skill", "metadata:\n  a: &a v\n  b: *a\n"))), clean);
    // Alias expansion past yaml's resource-exhaustion bound is a finding, not a crash.
    const aliases = Array.from({ length: 101 }, (_, i) => `  k${i}: *a\n`).join("");
    only(skill("my-skill", ok("my-skill", `metadata:\n  a: &a v\n${aliases}`)), "standard", /could not be resolved as YAML/);
  });
});

describe("kaal: engineering rules beyond the standard", () => {
  it("accepts references to files and directories the skill carries, and ignores URLs and anchors", () => {
    const body = "See [the guide](references/guide.md#setup), [this](./references/../references/guide.md) and run `node scripts/run.mjs` from scripts/tools.\nSpec: [spec](https://agentskills.io/specification), [docs](//example.com/guide), [top](#body).\n";
    assert.deepEqual(check(skill("my-skill", ok(), body, { "references/guide.md": "g", "scripts/run.mjs": "r", "scripts/tools/a.sh": "a" })), clean);
  });

  it("refuses a reference the skill does not carry, and one leaving the skill", () => {
    only(skill("my-skill", ok(), "See [guide](references/guide.md).\n"), "kaal", /references\/guide\.md, which the skill does not carry/);
    only(skill("my-skill", ok(), "Run scripts/missing.sh first.\n"), "kaal", /scripts\/missing\.sh, which the skill does not carry/);
    only(skill("my-skill", ok(), "See [up](../README.md).\n"), "kaal", /\.\.\/README\.md, which is not inside/);
    only(skill("my-skill", ok(), "See [abs](/etc/hosts).\n"), "kaal", /\/etc\/hosts, which is not inside/);
    only(skill("my-skill", ok(), "See [win](C:/x.md).\n"), "kaal", /C:\/x\.md, which is not inside/);
    only(skill("my-skill", ok(), "See [g](<references/my guide.md>).\n"), "kaal", /references\/my guide\.md, which the skill does not carry/);
    assert.deepEqual(check(skill("my-skill", ok(), "See [g](<references/my guide.md>).\n", { "references/my guide.md": "g" })), clean);
    only(skill("my-skill", ok(), "See [g](references/100%.md).\n"), "kaal", /references\/100%\.md, which the skill does not carry/);
    assert.deepEqual(check(skill("my-skill", ok(), "See [g](references/a%20b.md).\n", { "references/a b.md": "g" })), clean);
  });

  it("reads references as CommonMark does", () => {
    // Reference-style links and images are references; a link destination is not scanned again as a bare path.
    only(skill("my-skill", ok(), "See [guide][g].\n\n[g]: references/guide.md\n"), "kaal", /references\/guide\.md, which the skill does not carry/);
    only(skill("my-skill", ok(), "![diagram](assets/d.png)\n"), "kaal", /assets\/d\.png, which the skill does not carry/);
    assert.deepEqual(check(skill("my-skill", ok(), "See [g](references/a%20b.md).\n", { "references/a b.md": "g" })).kaal, []);
    // Paths in code are references too: an agent runs them.
    only(skill("my-skill", ok(), "```sh\nnode scripts/run.mjs\n```\n"), "kaal", /scripts\/run\.mjs, which the skill does not carry/);
    // Escaped brackets are not a link.
    assert.deepEqual(check(skill("my-skill", ok(), "\\[not a link\\](nowhere.md)\n")), clean);
  });
});

describe("responsibility boundaries", () => {
  it("validates from contents alone: the validator imports only its YAML and CommonMark parsers and touches no host", () => {
    const text = readFileSync(VALIDATOR, "utf8");
    const imports = [...text.matchAll(/^import (.*) from "([^"]+)";$/gm)].map((m) => `${m[1]} from ${m[2]}`);
    assert.deepEqual(imports, ["{ Parser } from commonmark", "{ parseDocument } from yaml"]);
    assert.doesNotMatch(text, /\brequire\(|\bimport\(|\bprocess\.|node:/);
  });

  it("knows nothing of packaging, package names or how many skills a package carries", () => {
    // Two skills beside a broken manifest, under a package of another name: each is judged on its own contents.
    for (const name of ["first-skill", "second-skill"]) assert.deepEqual(check(skill(name, ok(name))), clean);
    assert.deepEqual(check(skill("first-skill", ok("first-skill"), "# Body\n", { "../package.json": "{ not json" })), clean);
  });

  it("does not judge KAAL Nodes: Core does", () => {
    // A file Core would refuse as a Node does not affect Agent Skill conformance.
    assert.deepEqual(check(skill("my-skill", ok(), "# Body\n", { "Broken-Node.md": "---\nname: Broken\ntype:\n  name: Ghost\n  id: nothing\n---\n" })), clean);
    // This package's own Node is judged by Core alone.
    const id = identify(readFileSync(join(PACKAGE, "payload", "Engineer-Skill.md")));
    assert.equal(id.name, "Engineer Skill");
    assert.deepEqual(id.type, foundation().skill);
  });

  it("reaches the host only in the entry point, and only through kaal-hosting's read()", () => {
    const entry = readFileSync(SCRIPT, "utf8");
    const imports = [...entry.matchAll(/^import (.*) from "([^"]+)";$/gm)].map((m) => `${m[1]} from ${m[2]}`);
    assert.deepEqual(imports, ["{ read } from kaal-hosting", "{ basename, resolve } from node:path", "{ checkSkill } from ./validate.mjs"]);
    assert.doesNotMatch(entry, /node:fs|kaal-core|child_process|process\.platform/);
  });
});

describe("the entry point", () => {
  // Commands run through Hosting, which owns how the host realizes them.
  const run = (...args) => execute(process.execPath, [SCRIPT, ...args], { cwd: work });

  it("hands the validator the same representation it would get in memory", async () => {
    const s = skill("my-skill", ok(), "See [g](references/g.md).\n", { "references/g.md": "g" });
    assert.deepEqual(check(await fromDisk(toDisk(s))), check(s));
  });

  it("exits 0 when clean, 1 on a violation, 2 on misuse, naming each finding's kind", async () => {
    assert.equal((await run(OWN)).status, 0);
    const standard = await run(toDisk(skill("my-skill", "name: my-skill\n")));
    assert.equal(standard.status, 1);
    assert.match(standard.stderr, /^standard: description is required$/m);
    const kaal = await run(toDisk(skill("my-skill", ok(), "See [g](references/g.md).\n")));
    assert.equal(kaal.status, 1);
    assert.match(kaal.stderr, /^kaal: SKILL\.md references references\/g\.md/m);
    const yaml = await run(toDisk(skill("my-skill", "name: my-skill\ndescription: a: b\n")));
    assert.equal(yaml.status, 1);
    assert.match(yaml.stderr, /^standard: frontmatter is not valid YAML/m);
    assert.match((await run(join(work, "nowhere"))).stderr, /^standard: SKILL\.md is missing$/m);
    writeFileSync(join(work, "a-file"), "x");
    assert.match((await run(join(work, "a-file"))).stderr, /could not be read/);
    assert.equal((await run(join(work, "a-file"))).status, 2);
    assert.equal((await run()).status, 2);
    assert.equal((await run("a", "b")).status, 2);
    assert.equal((await run("--package", PACKAGE)).status, 2);
  });

  it("needs neither kaal-core nor npm", async () => {
    const r = await execute(process.execPath, [SCRIPT, OWN], { cwd: work, env: { PATH: "" } });
    assert.deepEqual([r.status, r.stdout], [0, "ok\n"]);
  });
});
