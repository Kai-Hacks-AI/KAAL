// Case hosting/T264 tests: hosting/F84 (discoverable: Skill, operation guide, Agent instructions, engineering rules, README)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PACKAGE } from "./fixtures.mjs";

export const id = "hosting/T264";
export const tests = ["hosting/F84"];
export const title = "the Skill, its operation guide, the shipped Agent instructions, the engineering rules and the README name readRevision and the command, each where it belongs";
export async function run() {
  const text = (path) => readFileSync(join(PACKAGE, path), "utf8");
  const skill = text("05-src/skills/kaal-hosting/SKILL.md");
  assert.match(skill, /readRevision/, "SKILL.md does not name readRevision");
  assert.match(skill, /kaal-hosting-revision/, "SKILL.md does not name the command");
  assert.match(skill, /REVISION_NOT_FOUND[\s\S]*REVISION_UNREADABLE|REVISION_UNREADABLE[\s\S]*REVISION_NOT_FOUND/, "SKILL.md does not keep the two outcomes apart");
  const operations = text("05-src/skills/kaal-hosting/references/operations.md");
  assert.match(operations, /^\| Read the files of a Git revision \| `readRevision\(/m, "the operation guide has no row for readRevision");
  const agent = text("05-src/AGENTS.md");
  assert.match(agent, /readRevision/);
  assert.match(agent, /kaal-hosting-revision/);
  const engineering = text("AGENTS.md");
  assert.match(engineering, /one implementation/);
  assert.match(engineering, /revision\.ts/);
  const readme = text("README.md");
  assert.match(readme, /`readRevision`/);
  assert.match(readme, /`revision`/);
}
