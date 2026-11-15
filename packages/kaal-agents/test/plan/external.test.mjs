// The planned tests of agents/C9, the External part of kaal-agents 0.0.1 (plan/external-0.0.1/plan.md).
// DO and CHECK do not change them. Each fails today on the behaviour it checks.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const read = (...p) => readFileSync(join(PACKAGE, ...p), "utf8");
/** The body of the section whose heading line contains `title`, up to the next heading of the same or a higher level. */
function section(text, title) {
  const lines = text.split("\n");
  const at = lines.findIndex((l) => /^#{1,6}\s/.test(l) && l.toLowerCase().includes(title.toLowerCase()));
  assert.ok(at >= 0, `no section "${title}"`);
  const level = lines[at].match(/^#+/)[0].length;
  const rest = lines.slice(at + 1);
  const end = rest.findIndex((l) => /^#{1,6}\s/.test(l) && l.match(/^#+/)[0].length <= level);
  return (end < 0 ? rest : rest.slice(0, end)).join("\n");
}

describe("agents/C9 External part", () => {
  it("agents/T22 [agents/F10]: the Skill states its effects before its first procedure: it reads and writes nothing, and grants no authority", () => {
    const skill = read("skills", "kaal-agents", "SKILL.md");
    const effects = section(skill, "Effects");
    assert.match(effects, /\bread/i, "Effects says it reads");
    assert.match(effects, /writes? nothing|no writes|does not write/i, "Effects says it writes nothing");
    assert.match(effects, /no authority|grants? no authority|does not (?:grant|authorize)/i, "Effects says it grants no authority");
    assert.ok(skill.indexOf("## Effects") < skill.indexOf("## Bare"), "Effects comes before the first procedure");
  });

  it("agents/T23 [agents/F11]: the README has a 'Without installing' section that links the Definitions and the Skill by path and says the CLI is optional", () => {
    const text = section(read("README.md"), "Without installing");
    for (const path of ["capability/NEW.md", "capability/PREACH.md", "skills/kaal-agents/SKILL.md"]) {
      assert.ok(text.includes(path), `links ${path}`);
    }
    assert.match(text, /optional/i, "says the CLI is optional");
  });

  it("agents/T24 [agents/F12]: the Skill's PREACH section names 'cannot judge' and 'unresolved' results as program reports carried unchanged", () => {
    const text = section(read("skills", "kaal-agents", "SKILL.md"), "escalating with PREACH");
    assert.match(text, /cannot judge/i, "names cannot judge");
    assert.match(text, /unresolved/i, "names unresolved");
    assert.match(text, /program report/i, "calls them program reports");
    assert.match(text, /unchanged|as they are|verbatim/i, "carries the facts and candidates unchanged");
  });
});
