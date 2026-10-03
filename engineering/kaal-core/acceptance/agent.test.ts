// AGENT.md is the KAAL-side entrypoint a Bare agent reads first. It must be
// carried by payload() and deployed, and what it says about the deployed graph
// must be true of the graph actually deployed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { payload } from "kaal-core";
import { candidates, readNodes, typedBy } from "../helpers/nodes.js";
import { sha256 } from "../helpers/seal.js";
import { deploy } from "./setup.js";

test("payload() carries AGENT.md and it deploys to the root of the KAAL directory", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  assert.equal(typeof payload()["AGENT.md"], "string");
  assert.notEqual(payload()["AGENT.md"], "");
  assert.equal(readFileSync(join(dir, "AGENT.md"), "utf8"), payload()["AGENT.md"]);
});

test("AGENT.md is not a Node and carries no host or implementation wiring", () => {
  const text = payload()["AGENT.md"];
  assert.ok(!candidates({ "AGENT.md": text }).length, "no Form, so it is not a Node candidate");
  for (const banned of [/AGENTS\.md/, /\bnpm\b/, /\bCodex\b|\bClaude\b/]) assert.ok(!banned.test(text), String(banned));
});

test("what AGENT.md says about the deployed graph is true", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);
  const nodes = readNodes(dir);
  // "A Node's ID is the SHA-256 of its exact bytes ... sealed when seals/<ID> exists." Where a Node is stored is not part of the claim.
  for (const n of nodes) {
    assert.equal(n.id, sha256(readFileSync(join(dir, n.path))), n.path);
    assert.ok(existsSync(join(dir, "seals", n.id)), `seals/${n.id}`);
  }
  assert.ok(readdirSync(join(dir, "seals")).every((id) => nodes.some((n) => n.id === id)), "every seal is a carried Node's ID");
  // "Navigation begins in core/": the Kernel and the KAAL Definitions are there.
  const definitionNode = nodes.find((n) => n.name === "KAAL Definition")!;
  for (const n of [definitionNode, ...typedBy(nodes, { name: "KAAL Definition", id: definitionNode.id })]) assert.ok(n.path.startsWith("core/"), n.name);
  // "core/KERNEL.md ... is genesis and not itself a Node."
  assert.ok(existsSync(join(dir, "core", "KERNEL.md")));
  assert.ok(!nodes.some((n) => n.path === "core/KERNEL.md"));
  // "read core/KERNEL.md, then the Nodes it bootstraps": the genesis-typed first Node is `Node`.
  assert.equal(nodes.filter((n) => !n.type).map((n) => n.name).join(), "Node");
  // "the KAAL Definitions: the Nodes whose type refers to the KAAL Definition Node."
  assert.deepEqual(typedBy(nodes, { name: "KAAL Definition", id: definitionNode.id }).map((n) => n.name).sort(), ["Agent", "CASE", "Core", "Skill"]);
});
