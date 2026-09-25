import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { nodeFiles, relativeIdentity } from "../../using-brain/scripts/brain.js";
import { init as initBrain } from "../../using-brain/scripts/init.js";
import { scratchBrain } from "../../using-brain/scripts/test-data.js";
import { validate } from "../../using-brain/scripts/validate.js";
import { init } from "./init.js";

test("using-agents initializes its KAAL knowledge after BRAIN establishes skill expectations", () => {
  const root = scratchBrain(); initBrain(root); init(root);
  const ids = nodeFiles(root).map((f) => relativeIdentity(root, f));
  assert.deepEqual(ids, ["genesis/26/09/25/01/nodes/bass.md","genesis/26/09/25/01/nodes/skill.md","genesis/26/09/25/01/nodes/using-agents.md","genesis/26/09/25/01/nodes/using-brain.md"]);
  for (const id of ids) assert.ok(fs.readFileSync(path.join(root, id), "utf8").startsWith("---\nname:"));
  assert.deepEqual(validate(root), []);
});
