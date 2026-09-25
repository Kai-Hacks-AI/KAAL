import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { learningKey, nodeFiles, parseNode, relativeIdentity } from "./brain.js";

test("parses required name and edges", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  const file = path.join(root, "node.md");
  fs.writeFileSync(file, "---\nname: A\nedges:\n  - relation: r\n    to: B\n---\n\nMeaning\n");
  assert.deepEqual(parseNode(file), { name: "A", edges: [{ relation: "r", to: "B" }] });
});

test("rejects missing frontmatter and missing name", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  const plain = path.join(root, "plain.md");
  const unnamed = path.join(root, "unnamed.md");
  fs.writeFileSync(plain, "plain");
  fs.writeFileSync(unnamed, "---\nother: value\n---\n");
  assert.throws(() => parseNode(plain), /missing YAML frontmatter/);
  assert.throws(() => parseNode(unnamed), /name is required/);
});

test("discovers markdown nodes and derives identity and learning relative to root", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  const dir = path.join(root, "genesis", "26", "09", "25", "01", "nodes");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "a.md");
  fs.writeFileSync(file, "---\nname: A\n---\n");
  fs.writeFileSync(path.join(dir, "ignored.txt"), "no");
  assert.deepEqual(nodeFiles(root), [file]);
  assert.equal(relativeIdentity(root, file), "genesis/26/09/25/01/nodes/a.md");
  assert.equal(learningKey(root, file), "26/09/25/01");
});

test("accepts CRLF line endings and frontmatter at end of file", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "brain-"));
  const crlf = path.join(root, "crlf.md");
  const eof = path.join(root, "eof.md");
  fs.writeFileSync(crlf, "---\r\nname: A\r\n---\r\n\r\nMeaning\r\n");
  fs.writeFileSync(eof, "---\nname: B\n---");
  assert.deepEqual(parseNode(crlf), { name: "A" });
  assert.deepEqual(parseNode(eof), { name: "B" });
});
