// requirements/C16: the planned tests of "Requirements stands alone (External use)", packages/skills/kaal-requirements/plan/external/testing.md.
// They are immutable to DO and CHECK. They run outside the package's `npm test` until requirements/C17 turns them GREEN.
// "Stands alone" is NOT proven by these: an independent External trial (a fresh agent, only the Skill's text) is not run here.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const PACKAGE = fileURLToPath(new URL("../../", import.meta.url));
const SKILL_DIR = join(PACKAGE, "skills", "kaal-requirements");
const read = (path) => readFileSync(path, "utf8");
const pkg = () => JSON.parse(read(join(PACKAGE, "package.json")));
const contract = () => JSON.parse(read(join(PACKAGE, "contract.json")));
const skill = () => {
  const path = join(SKILL_DIR, "SKILL.md");
  assert.ok(existsSync(path), "blocked before behavioural assertion: skills/kaal-requirements/SKILL.md does not exist");
  return read(path);
};
const section = (text, heading) => {
  const m = text.match(new RegExp(`^## ${heading}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"));
  assert.ok(m, `the Skill has a "## ${heading}" section`);
  return m[1];
};
const packed = async () => {
  const r = await execute("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], { cwd: PACKAGE });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout)[0].files.map((f) => f.path).sort();
};

describe("kaal-requirements: stands alone (External use)", () => {
  it("requirements/T27: the Skill exists, the contract provides it as a directory asset into .agents/skills/kaal-requirements, and the packed package holds it [requirements/F25, requirements/A18]", async () => {
    skill();
    const c = contract();
    assert.deepEqual(c.provides, [{ skill: "kaal-requirements" }]);
    assert.deepEqual(
      c.assets.find((a) => a.name === "skill"),
      { name: "skill", source: "skills/kaal-requirements", target: ".agents/skills/kaal-requirements", kind: "directory" },
    );
    assert.ok(c.catalogue[".agents/skills/kaal-requirements/SKILL.md"], "the catalogue holds the Skill's bytes");
    assert.ok((await packed()).includes("skills/kaal-requirements/SKILL.md"), "the packed package holds the Skill");
    assert.ok(pkg().files.includes("skills"), "package.json files lists skills");
  });

  it("requirements/T28: the Skill gives no instruction to run a kaal command or install a package, and does not make an Engine a precondition; an explicit independence statement or an optional reference to the Nodes may mention one; a step marked Embedded only is not a precondition [requirements/F28, requirements/I15]", () => {
    const text = skill()
      .split("\n")
      .filter((line) => !/Embedded only/.test(line))
      .join("\n");
    assert.doesNotMatch(text, /\bkaal (verify|list|register|identify|install)\b/);
    assert.doesNotMatch(text, /\bnpx\b|\bnpm (install|i)\b/);
    // A sentence that mentions an Engine must state independence ("no", "not", "without") or an optional reference ("if", "optional", "fuller", "may").
    const sentences = text.split(/(?<=[.!?])\s+|\n+/);
    for (const sentence of sentences.filter((x) => /\bEngine\b/.test(x))) {
      assert.match(sentence, /\b(no|not|without|never|if|optional|fuller|deeper|may)\b/i, `an Engine is mentioned as a precondition: ${sentence}`);
    }
  });

  it("requirements/T29: each statement of what a Requirement is and is not in the Skill is present, verbatim, in the Node Requirement [requirements/F25, requirements/N9]", () => {
    const node = read(join(PACKAGE, "capability", "Requirement.md"));
    const text = skill();
    const statements = [
      "A Requirement states what must hold. It is one functional or non-functional condition that what is built is to satisfy, held by the business context responsible for it, and stated precisely enough to be verified by test or other evidence.",
      "It answers what, and only that. It does not say why (Intent), where (Architecture), how (Code), or whether it holds (Testing).",
      "A condition that cannot be verified is not yet a Requirement.",
    ];
    for (const s of statements) {
      assert.ok(node.includes(s), `the Node states: ${s}`);
      assert.ok(text.includes(s), `the Skill states, as the Node does: ${s}`);
    }
  });

  it("requirements/T30: the Skill's plain form names the capability, F or N and a number, the condition and the Intent it serves where known, and needs no Node id, Definition id or Edge [requirements/F26, requirements/I16]", () => {
    const plain = section(skill(), "Plain form");
    assert.match(plain, /`<capability>\/F<n>`/);
    assert.match(plain, /`<capability>\/N<n>`/);
    assert.match(plain, /condition/i);
    assert.match(plain, /Intent/);
    assert.match(plain, /means the same as a Requirement Node/);
    assert.doesNotMatch(plain, /requires? (a|the) (Node|Definition) id/i);
  });

  it("requirements/T31: the Skill gives a check for 'verifiable' that names an observable result and names Testing as the judge of how it is shown [requirements/F27]", () => {
    const text = skill();
    assert.match(text, /observable/i);
    assert.match(text, /Testing(?:'s| decides| judges)/);
  });

  it("requirements/T32: the Skill states what it writes and where: text returned to the requester by default, a repository file only where the requester has said Requirements are kept; it takes no authority from being installed or absent [requirements/F29]", () => {
    const effects = section(skill(), "Effects");
    assert.match(effects, /returns?\b[^.\n]*\bto the (requester|person|agent that asked)/i);
    assert.match(effects, /only where the (requester|person|agent that asked) has (said|specified|named|told)/i);
    assert.doesNotMatch(effects, /\bany (repository )?file\b/i);
    assert.match(effects, /authori[sz]es nothing|takes no authority/i);
  });
});
