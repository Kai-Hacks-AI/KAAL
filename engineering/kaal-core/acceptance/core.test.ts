// The shared vocabulary, proven from what is deployed: KAAL's definitions are
// found by Node type alone, CASE and Core are among them, and Core refers to
// the exact CASE it is a dimension of, by ID, never by location.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { payload } from "kaal-core";
import { checkBootstrap } from "../helpers/bootstrap.js";
import { candidates, readNodes, resolve, typedBy } from "../helpers/nodes.js";
import { deploy } from "./setup.js";

const referencedCase = (markdown: string) => ({ name: "CASE", id: /CASE ([0-9a-f]{64})/.exec(markdown)![1] });

test("KAAL's definitions are found by Node type: Agent, CASE and Core, and no other Node", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const definition = nodes.find((n) => n.name === "KAAL Definition")!;
  assert.equal(definition.type?.name, "Node", "KAAL Definition is itself typed by Node");
  assert.deepEqual(typedBy(nodes, { name: "KAAL Definition", id: definition.id }).map((n) => n.name).sort(), ["Agent", "CASE", "Core"]);
  assert.deepEqual(typedBy(nodes, { name: "Wrong", id: definition.id }), [], "the name is checked with the ID");
});

test("Core refers to the exact CASE it belongs to", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const core = nodes.find((n) => n.name === "Core")!;
  const caseNode = nodes.find((n) => n.name === "CASE")!;
  assert.equal(resolve(nodes, referencedCase(core.markdown)), caseNode);
  assert.ok(!caseNode.markdown.includes(core.id), "CASE does not refer to Core: Core does not redefine CASE");
});

test("Agent refers to the exact CASE it belongs to", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const agent = nodes.find((n) => n.name === "Agent")!;
  const caseNode = nodes.find((n) => n.name === "CASE")!;
  assert.equal(resolve(nodes, referencedCase(agent.markdown)), caseNode);
  assert.ok(!caseNode.markdown.includes(agent.id), "CASE does not refer to Agent");
});

test("moving stored Nodes without changing their bytes changes neither identity nor reference", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  mkdirSync(join(dir, "elsewhere"));
  renameSync(join(dir, "core", "Core.md"), join(dir, "elsewhere", "anything"));
  renameSync(join(dir, "core", "CASE.md"), join(dir, "CASE.md"));
  const after = readNodes(dir);
  assert.deepEqual(after.map((n) => n.id).sort(), before.map((n) => n.id).sort());
  assert.equal(resolve(after, referencedCase(after.find((n) => n.name === "Core")!.markdown)).name, "CASE");
});

test("changing CASE makes another Node; Core still refers to the exact CASE it was born against", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const before = readNodes(dir);
  const oldCase = before.find((n) => n.name === "CASE")!;
  const path = join(dir, "core", "CASE.md");
  const changed = readFileSync(path, "utf8") + "\n";
  writeFileSync(path, changed);
  const after = readNodes(dir);
  assert.notEqual(after.find((n) => n.name === "CASE")!.id, oldCase.id, "changed bytes are another Node");
  assert.throws(() => resolve(after, referencedCase(after.find((n) => n.name === "Core")!.markdown)), /no Node has ID/, "the changed bytes are not the CASE Core names");
  assert.notEqual(checkBootstrap({ ...payload(), "core/CASE.md": changed }).length, 0, "the changed CASE is not admitted until sealed");
});

test("the graph holds exactly the sealed Nodes born so far, none containing its own ID", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  assert.deepEqual(nodes.map((n) => n.name).sort(), ["Agent", "CASE", "Core", "Edge", "KAAL Definition", "Node"]);
  assert.deepEqual(checkBootstrap(), []);
  for (const n of nodes) assert.ok(!n.markdown.includes(n.id), n.name);
});

test("every Node's type and explicit Node references resolve, by exact ID with the name checked, to another carried Node", () => {
  const nodes = candidates(payload());
  for (const n of nodes) {
    const refs = [...(n.type ? [n.type] : [])];
    for (const other of nodes) for (const m of n.markdown.matchAll(new RegExp(`${other.name} ([0-9a-f]{64})`, "g"))) refs.push({ name: other.name, id: m[1] });
    for (const ref of refs) {
      assert.notEqual(ref.id, n.id, `${n.name} does not refer to itself`);
      assert.equal(resolve(nodes, ref).name, ref.name);
    }
  }
});
