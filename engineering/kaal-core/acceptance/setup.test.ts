// The admission rules, tested directly on a deployed tree:
// Form declares candidates; only a sealed genesis starts the chain; every later
// Node's {name,id} type must resolve to an admitted Node; IDs are identity.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readNodes } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

const typed = (name: string, type: { name: string; id: string }) => `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n`;

test("only Form, a sealed genesis and a resolving type make a Node", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  const edge = nodes.find((n) => n.name === "Edge")!;
  const write = (file: string, text: string) => writeFileSync(join(dir, "core", file), text);
  write("NoForm.md", "# Not a Node\n");
  write("Impostor.md", "---\nname: Node\n---\n\nUnsealed, so not the genesis.\n");
  const genesis = "---\nname: Self\n---\n";
  write("SelfGenesis.md", genesis);
  write("SelfTyped.md", typed("Appointed", { name: "Self", id: sha256(genesis) }));
  write("WrongName.md", typed("Wrong", { name: "Wrong", id: edge.id }));
  write("UnknownId.md", typed("Unknown", { name: "Edge", id: "f".repeat(64) }));
  assert.deepEqual(readNodes(dir).map((n) => n.id), nodes.map((n) => n.id), "none of those is a Node");
  write("Typed.md", typed("Typed", { name: "Edge", id: edge.id }));
  assert.equal(readNodes(dir).length, 3, "a Node typed by an admitted Node is a Node");
});

test("a Node's ID is its bytes, not where it is stored or what the KAAL directory is called", (t) => {
  const a = deploy();
  const b = deploy("my-kaal");
  t.after(() => (a.cleanup(), b.cleanup()));
  mkdirSync(join(b.dir, "elsewhere"));
  renameSync(join(b.dir, "core", "Node.md"), join(b.dir, "elsewhere", "moved.md"));
  assert.deepEqual(readNodes(b.dir).map((n) => n.id).sort(), readNodes(a.dir).map((n) => n.id).sort());
});
