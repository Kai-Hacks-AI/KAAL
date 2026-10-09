// How the Process consumes what it composes. Review's parser reads the rounds
// it records and Intent's check and identity decide the subject, so there is one
// definition of each; and Review and Intent work, unchanged, without the Process.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { payload as intent } from "kaal-intent";
import { payload as agree } from "kaal-process-agree";
import { payload as review } from "kaal-review";
import { scratch } from "../helpers/setup.js";

type After = { after: (fn: () => void) => void };
function embedding(t: After, ...parts: Array<{ skills: Record<string, string> }>) {
  const root = scratch(t);
  for (const { skills } of parts) for (const [path, content] of Object.entries(skills)) {
    mkdirSync(dirname(join(root, "skills", path)), { recursive: true });
    writeFileSync(join(root, "skills", path), content);
  }
  return root;
}
const node = (root: string, script: string, ...args: string[]) => spawnSync("node", [join(root, "skills", script), ...args], { encoding: "utf8", cwd: root });

test("a round the Process records is a round Review checks and Review's convergence agrees with the Process", (t) => {
  const root = embedding(t, agree(), intent(), review());
  const a = (...args: string[]) => node(root, "kaal-process-agree/scripts/agree.mjs", ...args);
  a("begin", "loop", "--worker", "w", "--reviewer", "r", "--rounds", "2", "--words", "granted");
  writeFileSync(join(root, "d.md"), "# Intent\n\nThe Owner wants it.\n");
  assert.equal(a("submit", "loop", "d.md").status, 0);
  const id = node(root, "kaal-intent/scripts/intent.mjs", "identity", "loop/log/01-subject.md").stdout.trim();
  writeFileSync(join(root, "saw.md"), readFileSync(join(root, "d.md")));
  assert.equal(a("relay", "loop", "--result", "converged", "--actor", "r", "--saw", "saw.md", "--source", "comment 1").status, 0);
  assert.equal(node(root, "kaal-review/scripts/review.mjs", "check", "loop/log/02-round.md").status, 0, "Review reads it as a round");
  assert.match(readFileSync(join(root, "loop/log/02-round.md"), "utf8"), new RegExp(`^# Review\\n\\nIntent: ${id}\\nResult: converged\\n\\n## Reviewer\\n\\nActor: r\\n`));
  assert.equal(a("state", "loop").stdout.split("\n")[0], "AGREED");
});

test("Intent and Review work as they did without the Process, and neither is changed to be composed", (t) => {
  const root = embedding(t, intent(), review());
  writeFileSync(join(root, "i.md"), "# Intent\n\nWanted.\n");
  assert.equal(node(root, "kaal-intent/scripts/intent.mjs", "check", "i.md").status, 0);
  const id = node(root, "kaal-intent/scripts/intent.mjs", "identity", "i.md").stdout.trim();
  assert.equal(node(root, "kaal-review/scripts/review.mjs", "write", "r.md", "--of", "Intent", "--identity", id, "--outcome", "converged", "--reviewer", "assigned by the owner").status, 0);
  assert.equal(node(root, "kaal-review/scripts/review.mjs", "check", "r.md").status, 0);
});

test("with Intent absent the Process refuses and says what is missing", (t) => {
  const root = embedding(t, agree(), review());
  const a = (...args: string[]) => node(root, "kaal-process-agree/scripts/agree.mjs", ...args);
  a("begin", "loop", "--worker", "w", "--reviewer", "r", "--rounds", "2", "--words", "granted");
  const r = a("state", "loop");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /kaal-intent must be installed beside this Skill/);
});
