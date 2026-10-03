// KAAL Skills, proven from what is deployed: a Node is a Skill when typed by the
// sealed `Skill` Node and is found by Node type alone; Core carries the type
// and the registration, and no Skill. Registering a capability's contribution
// adds its Nodes and seals under `skills/<capability>/` and nothing else, so
// identities are unchanged.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { payload, registerSkill } from "kaal-core";
import { readNodes, typedBy } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

/** A Node typed by `typeName`/`typeId`, plus its own seal, as a contribution entry. */
function node(name: string, typeName: string, typeId: string, extra = ""): Record<string, string> {
  const md = `---\nname: ${name}\ntype:\n  name: ${typeName}\n  id: ${typeId}\n---\n\n# ${name}\n\nA capability.${extra}\n`;
  return { [`${name}.md`]: md, [`seals/${sha256(md)}`]: "" };
}
const skillId = (dir: string) => readNodes(dir).find((n) => n.name === "Skill")!.id;
const tree = (dir: string) => JSON.stringify(readdirSync(dir, { recursive: true }).sort());

test("Skill is a KAAL Definition that Core carries, and Core carries no Skill", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const skill = nodes.find((n) => n.name === "Skill")!;
  assert.equal(skill.type?.name, "KAAL Definition");
  assert.ok(skill.path.startsWith("core/"));
  assert.deepEqual(typedBy(nodes, { name: "Skill", id: skill.id }), [], "no Node of the payload is typed by Skill");
  assert.ok(!Object.keys(payload()).some((p) => p.startsWith("skills/")), "the payload carries no capability");
  assert.match(skill.markdown, /Agent Skills standard/, "conforms to the external standard");
  assert.match(skill.markdown, /exactly when its type refers, by name and ID, to this Node/);
});

test("registering adds the capability's Nodes and seals under skills/<capability>/, and nothing else changes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const sid = skillId(dir);
  const main = node("Reviewing", "Skill", sid);
  const mainId = sha256(main["Reviewing.md"]);
  // A second Node of the capability, typed by its own Skill: Nodes beyond the Skill are allowed.
  const extra = node("Reviewing Notes", "Reviewing", mainId);
  const contribution = { ...main, ...extra };
  const ids = registerSkill(dir, "reviewing", contribution);
  const after = readNodes(dir);
  assert.deepEqual(ids, [mainId], "the Skills are the Nodes typed by Skill");
  assert.equal(after.length, before.length + 2);
  assert.deepEqual(typedBy(after, { name: "Skill", id: sid }).map((n) => n.name), ["Reviewing"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "skills", "reviewing", "Reviewing.md"), "utf8"), main["Reviewing.md"], "bytes kept exactly");
  for (const n of after) assert.ok(existsSync(join(dir, "seals", n.id)), n.name);
});

test("registering the same contribution again changes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const contribution = node("Reviewing", "Skill", skillId(dir));
  registerSkill(dir, "reviewing", contribution);
  const once = tree(dir);
  registerSkill(dir, "reviewing", contribution);
  assert.equal(tree(dir), once);
});

test("registering refuses what is not a sealed Skill contribution, and writes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = tree(dir);
  const sid = skillId(dir);
  const agent = readNodes(dir).find((n) => n.name === "Agent")!;
  const good = node("Reviewing", "Skill", sid);
  const [path, md] = Object.entries(good)[0];
  const cases: [string, string, Record<string, string>][] = [
    ["no seal", "reviewing", { [path]: md }],
    ["another Node's seal", "reviewing", { [path]: md, [`seals/${agent.id}`]: "" }],
    ["a seal with content", "reviewing", { ...good, [`seals/${sha256(md)}`]: "x" }],
    ["typed by another Node", "reviewing", node("Reviewing", "Agent", agent.id)],
    ["typed by an unknown Skill", "reviewing", node("Reviewing", "Skill", "0".repeat(64))],
    ["no Node typed by Skill", "reviewing", node("Reviewing", "KAAL Definition", readNodes(dir).find((n) => n.name === "KAAL Definition")!.id)],
    ["refers to an unsealed Node", "reviewing", node("Reviewing", "Skill", sid, ` See ${"1".repeat(64)}.`)],
    ["not a Node", "reviewing", { "x.md": "# x\n", [`seals/${sha256("# x\n")}`]: "" }],
    ["a path outside the capability", "reviewing", { ...good, "../escape.md": "x" }],
    ["a bad capability name", "Reviewing", good],
    ["a capability path", "../reviewing", good],
    ["nothing", "reviewing", {}],
  ];
  for (const [what, capability, contribution] of cases) assert.throws(() => registerSkill(dir, capability, contribution), Error, what);
  assert.equal(tree(dir), before, "nothing was written");
});

test("registering never gives a registered path other bytes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const sid = skillId(dir);
  registerSkill(dir, "reviewing", node("Reviewing", "Skill", sid));
  const before = tree(dir);
  assert.throws(() => registerSkill(dir, "reviewing", node("Reviewing", "Skill", sid, " Changed.")), /another Node/);
  assert.equal(tree(dir), before);
});

test("a failure while writing removes what was written", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const sid = skillId(dir);
  // Paths `x` and `x/y` pass every check, but `x/y` cannot be written once `x` is a file.
  const x = node("X", "Skill", sid);
  const y = node("Y", "Skill", sid);
  const contribution = { x: x["X.md"], "x/y": y["Y.md"], ...Object.fromEntries(Object.entries({ ...x, ...y }).filter(([p]) => p.startsWith("seals/"))) };
  const before = tree(dir);
  assert.throws(() => registerSkill(dir, "broken", contribution));
  assert.equal(tree(dir), before, "no partial registration is left");
});
