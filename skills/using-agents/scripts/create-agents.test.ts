import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createAgents } from "./create-agents.js";
import { guidance, scratchScope } from "./test-data.js";

test("creates <scope>/AGENTS.md holding exactly the guidance supplied", () => {
  const scope = scratchScope();
  const file = createAgents(scope, guidance("example"));
  assert.equal(file, path.join(scope, "AGENTS.md"));
  assert.equal(fs.readFileSync(file, "utf8"), guidance("example"));
  assert.deepEqual(fs.readdirSync(scope), ["AGENTS.md"]);
});

test("keeps the guidance's bytes exactly, line endings included", () => {
  const scope = scratchScope();
  assert.equal(fs.readFileSync(createAgents(scope, guidance("crlf")), "utf8"), guidance("crlf"));
});

test("refuses to overwrite an existing AGENTS.md, leaving it as it was", () => {
  const scope = scratchScope();
  createAgents(scope, guidance("example"));
  assert.throws(() => createAgents(scope, guidance("crlf")), /AGENTS\.md: already exists; refusing to overwrite it/);
  assert.equal(fs.readFileSync(path.join(scope, "AGENTS.md"), "utf8"), guidance("example"));
});

test("refuses a scope that is not an existing directory, creating nothing", () => {
  const parent = scratchScope();
  const missing = path.join(parent, "missing");
  assert.throws(() => createAgents(missing, guidance("example")), /scope must be an existing directory/);
  const file = path.join(parent, "file");
  fs.writeFileSync(file, "");
  assert.throws(() => createAgents(file, guidance("example")), /scope must be an existing directory/);
  assert.deepEqual(fs.readdirSync(parent), ["file"]);
});

test("refuses empty guidance, creating nothing", () => {
  const scope = scratchScope();
  assert.throws(() => createAgents(scope, guidance("blank")), /guidance is empty/);
  assert.deepEqual(fs.readdirSync(scope), []);
});
