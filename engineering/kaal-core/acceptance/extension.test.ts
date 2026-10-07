// KAAL Extensions, proven from what is deployed: a Node is an Extension when typed by the
// sealed `Extension` Node and is found by Node type alone; Core carries the type
// and the registration, and no Extension. Registering a capability's contribution
// adds its Nodes and seals under `extensions/<capability>/` and nothing else, so
// identities are unchanged.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { installedExtensions, installedSkills, payload, registerExtension, registerSkill } from "kaal-core";
import { readNodes, typedBy } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

/** A Node typed by `typeName`/`typeId`, plus its own seal, as a contribution entry. */
function node(name: string, typeName: string, typeId: string, extra = ""): Record<string, string> {
  const md = `---\nname: ${name}\ntype:\n  name: ${typeName}\n  id: ${typeId}\n---\n\n# ${name}\n\nA capability.${extra}\n`;
  return { [`${name}.md`]: md, [`seals/${sha256(md)}`]: "" };
}
const extensionId = (dir: string) => readNodes(dir).find((n) => n.name === "Extension")!.id;
const tree = (dir: string) => JSON.stringify(readdirSync(dir, { recursive: true }).sort());

test("Extension is a KAAL Definition that Core carries, and Core carries no Extension", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const skill = nodes.find((n) => n.name === "Extension")!;
  assert.equal(skill.type?.name, "KAAL Definition");
  assert.ok(skill.path.startsWith("core/"));
  assert.deepEqual(typedBy(nodes, { name: "Extension", id: skill.id }), [], "no Node of the payload is typed by Extension");
  assert.ok(!Object.keys(payload()).some((p) => p.startsWith("skills/")), "the payload carries no capability");
  assert.match(skill.markdown, /CASE 6cffa01b/, "realizes the Extensions dimension of CASE");
  assert.match(skill.markdown, /exactly when its type refers, by name and ID, to this Node/);
});

test("registering adds the capability's Nodes and seals under extensions/<capability>/, and nothing else changes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const sid = extensionId(dir);
  const main = node("Reviewing", "Extension", sid);
  const mainId = sha256(main["Reviewing.md"]);
  // A second Node of the capability, typed by its own Extension: Nodes beyond the Extension are allowed.
  const extra = node("Reviewing Notes", "Reviewing", mainId);
  const contribution = { ...main, ...extra };
  const ids = registerExtension(dir, "reviewing", contribution);
  const after = readNodes(dir);
  assert.deepEqual(ids, [mainId], "the Extensions are the Nodes typed by Extension");
  assert.equal(after.length, before.length + 2);
  assert.deepEqual(typedBy(after, { name: "Extension", id: sid }).map((n) => n.name), ["Reviewing"], "found by Node type alone");
  assert.equal(readFileSync(join(dir, "extensions", "reviewing", "Reviewing.md"), "utf8"), main["Reviewing.md"], "bytes kept exactly");
  for (const n of after) assert.ok(existsSync(join(dir, "seals", n.id)), n.name);
});

test("registering the same contribution again changes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const contribution = node("Reviewing", "Extension", extensionId(dir));
  registerExtension(dir, "reviewing", contribution);
  const once = tree(dir);
  registerExtension(dir, "reviewing", contribution);
  assert.equal(tree(dir), once);
});

test("registering refuses what is not a sealed Extension contribution, and writes nothing", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = tree(dir);
  const sid = extensionId(dir);
  const agent = readNodes(dir).find((n) => n.name === "Agent")!;
  const good = node("Reviewing", "Extension", sid);
  const [path, md] = Object.entries(good)[0];
  const bareMd = "---\nname: Bare\n---\n\n# Bare\n";
  const bare = { "Bare.md": bareMd, [`seals/${sha256(bareMd)}`]: "" };
  const cases: [string, string, Record<string, string>][] = [
    ["no seal", "reviewing", { [path]: md }],
    ["another Node's seal", "reviewing", { [path]: md, [`seals/${agent.id}`]: "" }],
    ["a seal with content", "reviewing", { ...good, [`seals/${sha256(md)}`]: "x" }],
    ["typed by another Node", "reviewing", node("Reviewing", "Agent", agent.id)],
    ["typed by an unknown Extension", "reviewing", node("Reviewing", "Extension", "0".repeat(64))],
    ["no Node typed by Extension", "reviewing", node("Reviewing", "KAAL Definition", readNodes(dir).find((n) => n.name === "KAAL Definition")!.id)],
    ["the right ID under the wrong name", "reviewing", node("Reviewing", "Wrong", sid)],
    ["a genesis Node smuggled in", "reviewing", { ...good, ...bare }],
    ["not a Node", "reviewing", { "x.md": "# x\n", [`seals/${sha256("# x\n")}`]: "" }],
    ["a path outside the capability", "reviewing", { ...good, "../escape.md": "x" }],
    ["a bad capability name", "Reviewing", good],
    ["a capability path", "../reviewing", good],
    ["nothing", "reviewing", {}],
  ];
  for (const [what, capability, contribution] of cases) assert.throws(() => registerExtension(dir, capability, contribution), Error, what);
  assert.equal(tree(dir), before, "nothing was written");
});

test("registering never gives a registered path other bytes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const sid = extensionId(dir);
  registerExtension(dir, "reviewing", node("Reviewing", "Extension", sid));
  const before = tree(dir);
  assert.throws(() => registerExtension(dir, "reviewing", node("Reviewing", "Extension", sid, " Changed.")), /another Node/);
  assert.equal(tree(dir), before);
});

test("a failure while writing removes what was written", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const sid = extensionId(dir);
  // Paths `x` and `x/y` pass every check, but `x/y` cannot be written once `x` is a file.
  const x = node("X", "Extension", sid);
  const y = node("Y", "Extension", sid);
  const contribution = { x: x["X.md"], "x/y": y["Y.md"], ...Object.fromEntries(Object.entries({ ...x, ...y }).filter(([p]) => p.startsWith("seals/"))) };
  const before = tree(dir);
  assert.throws(() => registerExtension(dir, "broken", contribution));
  assert.equal(tree(dir), before, "no partial registration is left");
});

test("the installed Extensions are the admitted Nodes typed, by name and ID, by the admitted Extension Node", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  assert.deepEqual(installedExtensions(dir), [], "Core carries no Extension");
  const sid = extensionId(dir);
  const b = node("Brewing", "Extension", sid);
  const a = node("Auditing", "Extension", sid);
  // A Node of a capability that is not itself a Extension: typed by the capability's Extension, not by Extension.
  const notes = node("Brewing Notes", "Brewing", sha256(b["Brewing.md"]));
  registerExtension(dir, "brewing", { ...b, ...notes });
  registerExtension(dir, "auditing", a);
  const ref = (name: string, files: Record<string, string>) => ({ name, id: sha256(files[`${name}.md`]) });
  assert.deepEqual(installedExtensions(dir), [ref("Auditing", a), ref("Brewing", b)], "name order; the Notes Node is not a Extension");
  assert.deepEqual(installedExtensions(dir), typedBy(readNodes(dir), { name: "Extension", id: sid }).map(({ name, id }) => ({ name, id })).sort((x, y) => (x.name < y.name ? -1 : 1)), "the same typing registration is");
});

test("installed Extensions are found by typing alone: not by path, not unsealed, not by name, not by the wrong ID", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const sid = extensionId(dir);
  const elsewhere = node("Elsewhere", "Extension", sid);
  mkdirSync(join(dir, "anywhere", "at", "all"), { recursive: true });
  writeFileSync(join(dir, "anywhere", "at", "all", "Elsewhere.md"), elsewhere["Elsewhere.md"]);
  for (const [p, c] of Object.entries(elsewhere)) if (p.startsWith("seals/")) writeFileSync(join(dir, p), c);
  const unsealed = node("Unsealed", "Extension", sid);
  writeFileSync(join(dir, "Unsealed.md"), unsealed["Unsealed.md"]);
  for (const [name, typeName, typeId] of [["Wrong ID", "Extension", "0".repeat(64)], ["Wrong name", "Agent", sid]] as const) {
    const n = node(name, typeName, typeId);
    for (const [p, c] of Object.entries(n)) writeFileSync(join(dir, p), c);
  }
  assert.deepEqual(installedExtensions(dir), [{ name: "Elsewhere", id: sha256(elsewhere["Elsewhere.md"]) }]);
});

test("installed Extensions do not depend on what else the KAAL directory holds, such as changes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  registerExtension(dir, "brewing", node("Brewing", "Extension", extensionId(dir)));
  const before = installedExtensions(dir);
  mkdirSync(join(dir, "changes", "genesis", "26", "10", "04", "01"), { recursive: true });
  writeFileSync(join(dir, "changes", "genesis", "26", "10", "04", "01", "retro.md"), "# Retro\n");
  assert.deepEqual(installedExtensions(dir), before);
});

test("installedExtensions reads and writes nothing, and a directory without the Extension Node has no Extensions", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  registerExtension(dir, "brewing", node("Brewing", "Extension", extensionId(dir)));
  const before = tree(dir);
  installedExtensions(dir);
  assert.equal(tree(dir), before);
  rmSync(join(dir, "core", "Extension.md"));
  assert.deepEqual(installedExtensions(dir), [], "no Extension Node, no Extensions");
});

test("another admitted Node named Extension cannot become the anchor: Extension typing is Core's exact Extension Node", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const real = extensionId(dir);
  // A sealed, admitted Node also named Extension, stored where it comes first in file order.
  const definition = nodes.find((n) => n.name === "KAAL Definition")!;
  const impostor = node("Extension", "KAAL Definition", definition.id, " An impostor.");
  const impostorMd = impostor["Extension.md"];
  const impostorId = sha256(impostorMd);
  mkdirSync(join(dir, "aaa"));
  writeFileSync(join(dir, "aaa", "Extension.md"), impostorMd);
  writeFileSync(join(dir, "seals", impostorId), "");
  assert.deepEqual(readNodes(dir).filter((n) => n.name === "Extension").map((n) => n.id).sort(), [real, impostorId].sort(), "two admitted Nodes are named Extension");
  assert.ok(readNodes(dir).findIndex((n) => n.id === impostorId) < readNodes(dir).findIndex((n) => n.id === real), "the impostor comes first");

  // A Node typed by the impostor is not a Extension, installed or registrable.
  const fake = node("Fake", "Extension", impostorId);
  writeFileSync(join(dir, "Fake.md"), fake["Fake.md"]);
  for (const [p, c] of Object.entries(fake)) if (p.startsWith("seals/")) writeFileSync(join(dir, p), c);
  assert.deepEqual(installedExtensions(dir), [], "typed by a Node named Extension, not by Core's Extension");
  const before = tree(dir);
  assert.throws(() => registerExtension(dir, "fake", node("Fake Two", "Extension", impostorId)), Error);
  assert.equal(tree(dir), before);

  // Core's own Extension still anchors: a real Extension registers and is found.
  const good = node("Brewing", "Extension", real);
  registerExtension(dir, "brewing", good);
  assert.deepEqual(installedExtensions(dir), [{ name: "Brewing", id: sha256(good["Brewing.md"]) }]);
});

test("the anchor is the SHA-256 of the exact bytes Core carries for Extension", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const good = node("Brewing", "Extension", sha256(payload()["core/Extension.md"]));
  assert.deepEqual(registerExtension(dir, "brewing", good), [sha256(good["Brewing.md"])]);
});

test("Extension and Skill are separate registrations: neither types, finds or places the other's Nodes", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const eid = extensionId(dir);
  const sid = nodes.find((n) => n.name === "Skill")!.id;
  const ext = node("Hosting", "Extension", eid);
  const skill = node("Reviewing", "Skill", sid);
  registerExtension(dir, "hosting", ext);
  registerSkill(dir, "reviewing", skill);
  assert.deepEqual(installedExtensions(dir), [{ name: "Hosting", id: sha256(ext["Hosting.md"]) }]);
  assert.deepEqual(installedSkills(dir), [{ name: "Reviewing", id: sha256(skill["Reviewing.md"]) }]);
  assert.ok(existsSync(join(dir, "extensions", "hosting", "Hosting.md")));
  assert.ok(existsSync(join(dir, "skills", "reviewing", "Reviewing.md")));
  assert.ok(!existsSync(join(dir, "skills", "hosting")) && !existsSync(join(dir, "extensions", "reviewing")));
  const before = tree(dir);
  assert.throws(() => registerExtension(dir, "mixed", node("Mixed", "Skill", sid)), Error, "a Skill is not an Extension contribution");
  assert.throws(() => registerSkill(dir, "mixed", node("Mixed", "Extension", eid)), Error, "an Extension is not a Skill contribution");
  assert.equal(tree(dir), before);
});
