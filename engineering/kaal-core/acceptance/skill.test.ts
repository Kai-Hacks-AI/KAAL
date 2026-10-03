// KAAL Skills, proven from what is deployed: a Skill is a Node typed by the
// sealed `Skill` Node and is found by Node type alone, Engineering Skill is the
// first one, and registering a Skill with an installed KAAL adds that Node and
// its seal and nothing else, so its identity is unchanged.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { registerSkill } from "kaal-core";
import { readNodes, typedBy } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

/** A Skill as it would arrive: its Node and its own seal, typed by the deployed `Skill` Node. */
function skillFor(dir: string, name: string, extra = "", typeId?: string): Record<string, string> {
  const skill = readNodes(dir).find((n) => n.name === "Skill")!;
  const node = `---\nname: ${name}\ntype:\n  name: Skill\n  id: ${typeId ?? skill.id}\n---\n\n# ${name}\n\nA capability.${extra}\n`;
  return { [`${name}.md`]: node, [`seals/${sha256(node)}`]: "" };
}

test("Skill is a KAAL Definition, and Engineering Skill is the first Node typed by it", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const skill = nodes.find((n) => n.name === "Skill")!;
  assert.equal(skill.type?.name, "KAAL Definition");
  assert.deepEqual(typedBy(nodes, { name: "Skill", id: skill.id }).map((n) => n.name), ["Engineering Skill"]);
  assert.match(skill.markdown, /Agent Skills standard/, "conforms to the external standard");
  assert.match(skill.markdown, /exactly when its type refers, by name and ID, to this Node/);
});

test("Engineering Skill's capability is narrow: engineering KAAL Skills", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const md = readNodes(dir).find((n) => n.name === "Engineering Skill")!.markdown;
  assert.match(md, /the capability for engineering KAAL Skills/);
  assert.match(md, /not software engineering in general/);
});

test("registering a Skill adds its Node and its seal, and nothing else changes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const skill = skillFor(dir, "Reviewing");
  const files = Object.values(skill);
  const id = registerSkill(dir, skill);
  const after = readNodes(dir);
  assert.equal(id, sha256(files[0]), "the identity is the SHA-256 of the exact bytes");
  assert.equal(after.length, before.length + 1, "exactly one more admitted Node");
  const registered = typedBy(after, { name: "Skill", id: after.find((n) => n.name === "Skill")!.id }).map((n) => n.name).sort();
  assert.deepEqual(registered, ["Engineering Skill", "Reviewing"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", "Reviewing.md"), "utf8"), files[0], "bytes kept exactly");
  assert.ok(readdirSync(join(dir, "seals")).includes(id));
});

test("registering the same Skill again changes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const skill = skillFor(dir, "Reviewing");
  registerSkill(dir, skill);
  const once = readNodes(dir).map((n) => n.id).sort();
  registerSkill(dir, skill);
  assert.deepEqual(readNodes(dir).map((n) => n.id).sort(), once);
});

test("registering refuses what is not a sealed Skill, and changes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = JSON.stringify(readdirSync(dir, { recursive: true }).sort());
  const good = skillFor(dir, "Reviewing");
  const [path, node] = Object.entries(good)[0];
  const agent = readNodes(dir).find((n) => n.name === "Agent")!;
  const cases: [string, Record<string, string>][] = [
    ["no seal", { [path]: node }],
    ["another Node's seal", { [path]: node, [`seals/${agent.id}`]: "" }],
    ["typed by another Node", skillFor(dir, "Reviewing", "", agent.id)],
    ["typed by an unknown Skill", skillFor(dir, "Reviewing", "", "0".repeat(64))],
    ["refers to an unsealed Node", skillFor(dir, "Reviewing", ` See ${"1".repeat(64)}.`)],
    ["not a Node", { "x.md": "# x\n", [`seals/${sha256("# x\n")}`]: "" }],
    ["a stray file", { ...good, "extra.md": "x" }],
  ];
  for (const [what, skill] of cases) assert.throws(() => registerSkill(dir, skill), Error, what);
  assert.equal(JSON.stringify(readdirSync(dir, { recursive: true }).sort()), before, "nothing was written");
});

test("registering never replaces a registered Skill with other bytes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  registerSkill(dir, skillFor(dir, "Reviewing"));
  assert.throws(() => registerSkill(dir, skillFor(dir, "Reviewing", " Changed.")), /another Node/);
});
