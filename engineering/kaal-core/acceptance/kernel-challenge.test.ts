// Test suite challenging KAAL against the specification in KERNEL.md.
// Tests Kernel genesis, Form parsing rules, Immutability & Sealing,
// Node rules (genesis exception, self-ID, location independence),
// and Type Chain / Graph resolution dynamics.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { payload } from "kaal-core";
import { readNodes, resolve, candidates, admit } from "../helpers/nodes.js";
import { checkBytes, sha256 } from "../helpers/seal.js";
import { checkBootstrap } from "../helpers/bootstrap.js";
import { deploy } from "./setup.js";

const GENESIS_SEAL = new URL("../../kernel.sha256", import.meta.url);

const typedNode = (name: string, type: { name: string; id: string }, body = `# ${name}\n`) =>
  `---\nname: ${name}\ntype:\n  name: ${type.name}\n  id: ${type.id}\n---\n\n${body}`;

test("KERNEL § Genesis: Kernel is genesis, non-Node, ordered, and sealed", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);

  const files = payload();
  const kernelText = readFileSync(join(dir, "core", "KERNEL.md"), "utf8");

  // 1. Kernel is not a Node
  const cands = candidates(files);
  assert.ok(!cands.some((c) => c.markdown === kernelText), "Kernel contains no Form frontmatter, so it is not a candidate Node");

  // 2. Kernel chapters ordering
  const headings = kernelText.match(/^#{1,6} .+$/gm);
  assert.deepEqual(
    headings,
    ["# Kernel", "## Node", "## Immutability", "## Form", "## Edge"],
    "Kernel chapters must follow strict order: Node -> Immutability -> Form -> Edge"
  );

  // 3. Kernel seal validity
  const expectedSeal = readFileSync(GENESIS_SEAL, "utf8").trim();
  assert.equal(checkBytes(kernelText, expectedSeal, "Kernel"), undefined, "Kernel matches genesis seal");

  // 4. Single-byte tampering breaks Kernel seal
  assert.notEqual(
    checkBytes(kernelText + "\n", expectedSeal, "Kernel"),
    undefined,
    "Adding newline to Kernel invalidates genesis seal"
  );
  assert.notEqual(
    checkBytes(kernelText.replace("genesis", "Genesis"), expectedSeal, "Kernel"),
    undefined,
    "Changing a character in Kernel invalidates genesis seal"
  );
});

test("KERNEL § Node: Node 1 genesis exception and bootstrap prerequisite", (t) => {
  const { dir, cleanup } = deploy();
  t.after(cleanup);

  const nodes = readNodes(dir);
  const node1 = nodes.find((n) => n.name === "Node")!;
  assert.ok(node1, "Node 1 is present");

  // Genesis exception: type MUST be undefined
  assert.equal(node1.type, undefined, "Node 1 is the genesis exception and declares no type");

  // If Node 1 is not sealed, bootstrap fails and no nodes are admitted
  const files = payload();
  const unsealedFiles: Record<string, string> = {};
  for (const [p, content] of Object.entries(files)) {
    if (!p.startsWith("seals/")) unsealedFiles[p] = content;
  }
  assert.deepEqual(admit(unsealedFiles), [], "Without seal markers, no Nodes are admitted");
  assert.ok(checkBootstrap(unsealedFiles).length > 0, "Unsealed bootstrap is flagged as problem");
});

test("KERNEL § Form: Strict parsing rules for frontmatter and types", (t) => {
  const files = payload();
  const nodes = admit(files);
  const node1 = nodes.find((n) => n.name === "Node")!;

  // 1. Indentation mismatch in type frontmatter (1 space instead of 2)
  const badIndent = `---\nname: BadIndent\ntype:\n name: Node\n id: ${node1.id}\n---\n`;
  const badFiles = { ...files, "core/BadIndent.md": badIndent };
  assert.ok(!candidates(badFiles).some((c) => c.name === "BadIndent"), "Malformed indentation is rejected by Form");

  // 2. Leading content before frontmatter
  const leadingText = `\n---\nname: LeadingText\ntype:\n  name: Node\n  id: ${node1.id}\n---\n`;
  const leadingFiles = { ...files, "core/LeadingText.md": leadingText };
  assert.ok(!candidates(leadingFiles).some((c) => c.name === "LeadingText"), "Text before frontmatter prevents Form match");

  // 3. Uppercase hex ID in type reference
  const upperId = `---\nname: UpperHex\ntype:\n  name: Node\n  id: ${node1.id.toUpperCase()}\n---\n`;
  const upperFiles = { ...files, "core/UpperHex.md": upperId };
  assert.ok(!candidates(upperFiles).some((c) => c.name === "UpperHex"), "Uppercase hex ID is rejected by Form pattern");

  // 4. Invalid ID length (63 hex chars)
  const shortId = `---\nname: ShortId\ntype:\n  name: Node\n  id: ${node1.id.slice(1)}\n---\n`;
  const shortFiles = { ...files, "core/ShortId.md": shortId };
  assert.ok(!candidates(shortFiles).some((c) => c.name === "ShortId"), "63-character hex ID is rejected by Form pattern");

  // 5. Type name mismatch (valid ID, wrong name)
  const wrongNameText = typedNode("Mismatch", { name: "WrongNodeName", id: node1.id });
  const wrongNameFiles = { ...files, "core/Mismatch.md": wrongNameText };
  assert.ok(!admit(wrongNameFiles).some((n) => n.name === "Mismatch"), "Type reference with name mismatch is not admitted");
  assert.throws(
    () => resolve(nodes, { name: "WrongNodeName", id: node1.id }),
    /is named Node, not WrongNodeName/,
    "resolve throws when reference name does not match target Node name"
  );
});

test("KERNEL § Immutability: Sealing integrity and problem detection", (t) => {
  const files = payload();
  const nodes = admit(files);
  const node1 = nodes.find((n) => n.name === "Node")!;
  const edge = nodes.find((n) => n.name === "Edge")!;

  // 1. Modifying exact bytes (adding trailing space) changes ID
  const modifiedNode1 = files["core/Node.md"] + " ";
  const newHash = sha256(modifiedNode1);
  assert.notEqual(newHash, node1.id, "Modifying bytes produces a new ID");

  // 2. Orphan seal detection
  const orphanId = "a".repeat(64);
  const orphanFiles = { ...files, [`seals/${orphanId}`]: "" };
  const orphanProblems = checkBootstrap(orphanFiles);
  assert.ok(orphanProblems.some((p) => p.includes(`seals/${orphanId} seals no admitted Node`)), "Orphan seal detected");

  // 3. Unsealed candidate detection
  const customNode = typedNode("UnsealedCustom", { name: "Node", id: node1.id });
  const unsealedCandidateFiles = { ...files, "core/UnsealedCustom.md": customNode };
  const candidateProblems = checkBootstrap(unsealedCandidateFiles);
  assert.ok(
    candidateProblems.some((p) => p.includes("is a bootstrap Node with no seal recorded")),
    "Unsealed candidate detected by checkBootstrap"
  );

  // 4. Sealed unadmitted file (seal exists, but type reference is invalid)
  const invalidTypeNode = typedNode("InvalidType", { name: "NonExistent", id: "f".repeat(64) });
  const invalidTypeId = sha256(invalidTypeNode);
  const unadmittedFiles = {
    ...files,
    "core/InvalidType.md": invalidTypeNode,
    [`seals/${invalidTypeId}`]: "",
  };
  const unadmittedProblems = checkBootstrap(unadmittedFiles);
  assert.ok(
    unadmittedProblems.some((p) => p.includes("is not an admitted Node")),
    "Sealed file with unresolvable type is detected as unadmitted"
  );
});

test("KERNEL § Graph & Type Chains: Cascading admission, broken chains, and resolution", (t) => {
  const files = payload();
  const nodes = admit(files);
  const node1 = nodes.find((n) => n.name === "Node")!;
  const edge = nodes.find((n) => n.name === "Edge")!;

  // 1. Multi-level type chain: Node1 -> Edge -> Level3 -> Level4
  const level3Text = typedNode("Level3Node", { name: "Edge", id: edge.id });
  const level3Id = sha256(level3Text);
  const level4Text = typedNode("Level4Node", { name: "Level3Node", id: level3Id });
  const level4Id = sha256(level4Text);

  const chainFiles = {
    ...files,
    "core/Level3.md": level3Text,
    [`seals/${level3Id}`]: "",
    "core/Level4.md": level4Text,
    [`seals/${level4Id}`]: "",
  };

  const chainAdmitted = admit(chainFiles);
  assert.equal(chainAdmitted.length, 4, "All 4 levels of type chain are admitted");
  assert.ok(chainAdmitted.some((n) => n.name === "Level3Node"));
  assert.ok(chainAdmitted.some((n) => n.name === "Level4Node"));

  // 2. Broken type chain: remove Level 3's seal and file -> Level 4 is NOT admitted
  const brokenChainFiles = {
    ...files,
    "core/Level4.md": level4Text,
    [`seals/${level4Id}`]: "",
  };
  const brokenAdmitted = admit(brokenChainFiles);
  assert.ok(!brokenAdmitted.some((n) => n.name === "Level4Node"), "Level 4 is not admitted when Level 3 is missing");

  // 3. Cyclic type dependency without genesis root: A -> B and B -> A
  const fakeIdA = "1".repeat(64);
  const fakeIdB = "2".repeat(64);
  const cycleA = typedNode("CycleA", { name: "CycleB", id: fakeIdB });
  const cycleB = typedNode("CycleB", { name: "CycleA", id: fakeIdA });
  const cycleFiles = {
    ...files,
    "core/CycleA.md": cycleA,
    "core/CycleB.md": cycleB,
  };
  const cycleAdmitted = admit(cycleFiles);
  assert.ok(!cycleAdmitted.some((n) => n.name === "CycleA" || n.name === "CycleB"), "Cyclic dependencies without genesis root are not admitted");

  // 4. Multiple distinct Nodes sharing the same name
  const meta1Text = typedNode("Meta", { name: "Node", id: node1.id }, "Version 1");
  const meta1Id = sha256(meta1Text);
  const meta2Text = typedNode("Meta", { name: "Node", id: node1.id }, "Version 2");
  const meta2Id = sha256(meta2Text);

  const sameNameFiles = {
    ...files,
    "core/Meta1.md": meta1Text,
    [`seals/${meta1Id}`]: "",
    "core/Meta2.md": meta2Text,
    [`seals/${meta2Id}`]: "",
  };
  const sameNameAdmitted = admit(sameNameFiles);
  const resolvedMeta1 = resolve(sameNameAdmitted, { name: "Meta", id: meta1Id });
  const resolvedMeta2 = resolve(sameNameAdmitted, { name: "Meta", id: meta2Id });

  assert.equal(resolvedMeta1.markdown, meta1Text, "Resolves meta1 by ID");
  assert.equal(resolvedMeta2.markdown, meta2Text, "Resolves meta2 by ID");
});
