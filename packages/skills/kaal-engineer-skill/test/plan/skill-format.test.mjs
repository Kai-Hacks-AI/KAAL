// The planned outer tests of engineer-skill/C1, the Skill format
// (plan/skill-format/testing.md). Each title names the contracts it checks.
// engineer-skill/C2 turns them GREEN.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import * as engineerSkill from "kaal-engineer-skill";
import { read } from "kaal-hosting";

const { checkSkill } = engineerSkill;
// Looked up per call, so each test reports its own RED while the export is missing.
const readSkill = (name, files) => engineerSkill.readSkill(name, files);
const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OWN = join(PACKAGE, "skills", "kaal-engineer-skill");

const FRONTMATTER = [
  "name: my-skill",
  "description: Does one thing. Use when that thing is needed.",
  "license: MIT",
  "compatibility: Needs Node.js 24 or later.",
  "metadata:",
  '  author: "KAAL"',
  '  version: "1"',
  "allowed-tools: Bash(git:*) Read",
].join("\n");

/** SKILL.md text with this frontmatter and body, LF line endings. */
const md = (frontmatter = FRONTMATTER, body = "# My skill\n\nDo the thing.\n") => `---\n${frontmatter}\n---\n\n${body}`;
const bytes = (text) => new TextEncoder().encode(text);
const clean = (found) => found.standard.length + found.kaal.length === 0;

describe("the Skill format", () => {
  it("engineer-skill/T1 (engineer-skill/F1, engineer-skill/F3): a Skill with every standard field passes, and the interpretation returns each field as read", () => {
    const files = { "SKILL.md": bytes(md()) };
    assert.ok(clean(checkSkill("my-skill", files)), JSON.stringify(checkSkill("my-skill", files)));
    const { fields, standard, kaal } = readSkill("my-skill", files);
    assert.deepEqual([standard, kaal], [[], []]);
    assert.equal(fields.get("name"), "my-skill");
    assert.equal(fields.get("description"), "Does one thing. Use when that thing is needed.");
    assert.equal(fields.get("license"), "MIT");
    assert.equal(fields.get("compatibility"), "Needs Node.js 24 or later.");
    assert.deepEqual(fields.get("metadata"), new Map([["author", "KAAL"], ["version", "1"]]));
    assert.equal(fields.get("allowed-tools"), "Bash(git:*) Read");
    assert.deepEqual([...fields.keys()], ["name", "description", "license", "compatibility", "metadata", "allowed-tools"]);
  });

  it("engineer-skill/T2 (engineer-skill/F2): a Skill needs no ## Description section, and its description is the frontmatter's even when the body has one", () => {
    assert.ok(clean(checkSkill("my-skill", { "SKILL.md": md() })));
    const body = "# My skill\n\n## Description\n\nSomething else entirely.\n";
    const found = readSkill("my-skill", { "SKILL.md": md(FRONTMATTER, body) });
    assert.ok(clean(found));
    assert.equal(found.fields.get("description"), "Does one thing. Use when that thing is needed.");
  });

  it("engineer-skill/T3 (engineer-skill/F3, engineer-skill/F7): LF, CRLF and a leading byte order mark give the same fields and findings; a lone CR is not a line break", () => {
    const lf = md();
    const variants = {
      lf,
      crlf: lf.replace(/\n/g, "\r\n"),
      "bom+lf": `﻿${lf}`,
      "bom+crlf": `﻿${lf.replace(/\n/g, "\r\n")}`,
    };
    const expected = readSkill("my-skill", { "SKILL.md": bytes(lf) });
    assert.ok(clean(expected));
    for (const [kind, text] of Object.entries(variants)) {
      for (const [form, raw] of [["bytes", bytes(text)], ["text", text]]) {
        assert.deepEqual(readSkill("my-skill", { "SKILL.md": raw }), expected, `${kind} as ${form}`);
        assert.deepEqual(checkSkill("my-skill", { "SKILL.md": raw }), checkSkill("my-skill", { "SKILL.md": bytes(lf) }), `${kind} as ${form}`);
      }
    }
    // A lone CR does not end the delimiter line, so there is no frontmatter.
    const cr = readSkill("my-skill", { "SKILL.md": bytes(lf.replace(/\n/g, "\r")) });
    assert.equal(cr.fields, undefined);
    assert.match(cr.standard.join("\n"), /does not begin with YAML frontmatter/);
    // Inside a value, a lone CR stays a character of that value.
    const inside = readSkill("my-skill", { "SKILL.md": bytes(md(FRONTMATTER.replace("Does one thing.", "Does one\rthing."))) });
    assert.equal(inside.fields.get("description"), "Does one\rthing. Use when that thing is needed.");
  });

  it("engineer-skill/T4 (engineer-skill/F4): a SKILL.md whose bytes are not UTF-8 gets a standard finding naming the encoding", () => {
    const text = bytes(md());
    const broken = new Uint8Array([...text.subarray(0, text.length - 1), 0xff, 0x0a]);
    const found = checkSkill("my-skill", { "SKILL.md": broken });
    assert.equal(found.standard.length, 1, JSON.stringify(found));
    assert.match(found.standard[0], /UTF-8/);
    assert.equal(readSkill("my-skill", { "SKILL.md": broken }).fields, undefined);
  });

  it("engineer-skill/T5 (engineer-skill/A1): the shipped kaal-engineer-skill passes, keeps license and compatibility, and has no ## Description", async () => {
    const files = await read(OWN);
    const found = readSkill("kaal-engineer-skill", files);
    assert.deepEqual([found.standard, found.kaal], [[], []]);
    assert.ok(found.fields.has("license"));
    assert.ok(found.fields.has("compatibility"));
    const text = files["SKILL.md"];
    assert.doesNotMatch(typeof text === "string" ? text : new TextDecoder().decode(text), /^## Description\s*$/m);
  });

  it("engineer-skill/T6 (engineer-skill/F7, engineer-skill/A2): the package's .gitattributes marks every file under skills/ -text", () => {
    const lines = readFileSync(join(PACKAGE, ".gitattributes"), "utf8").split("\n").map((l) => l.trim());
    assert.ok(lines.includes("skills/** -text"), lines.join("\n"));
  });
});
