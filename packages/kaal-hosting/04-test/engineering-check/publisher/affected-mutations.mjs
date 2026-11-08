// Discriminating challenges for the parsed-tree `affected` (hosting/D11 to hosting/D14). They supersede the six
// challenges that mutated literal lines of the text heuristic (attribution-mutations.mjs and the
// omit-controlled-cases entry of defect-mutations.mjs); the Cases they challenge are unchanged. Each mutation
// restores the exact bytes in finally and must die by assertion, not setup.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const file = join(root, "dist/skills/kaal-hosting/scripts/boundary-core.js");
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const dir = "04-test/engineering-check/publisher/";
const challenges = [
  { name: "omit-controlled-cases", supersedes: "omit-controlled-cases", before: "for (const call of inside(from, end))", after: "for (const call of [])", pattern: "hosting/T82 ", test: dir + "defects.test.mjs" },
  { name: "omit-first-conditional-alternative", supersedes: "omit-first-conditional-alternative", before: "            visit(node.whenTrue);\n", after: "", pattern: "hosting/T90 ", test: dir + "attribution-branches.test.mjs" },
  { name: "spill-else-if-extent", supersedes: "spill-else-if-extent", before: "const end = branches.getEnd();", after: "const end = code.length;", pattern: "hosting/T91 ", test: dir + "attribution-branches.test.mjs" },
  { name: "spill-semicolon-free-registration", supersedes: "spill-semicolon-free-registration", before: "const end = branches.getEnd();", after: "const end = branches.getEnd() + 200;", pattern: "hosting/T92 ", test: dir + "attribution-branches.test.mjs" },
  { name: "omit-comma-continuation", supersedes: "omit-comma-continuation", before: "const end = branches.getEnd();", after: "const end = branches.getStart(file) + 1;", pattern: "hosting/T98 ", test: dir + "attribution-continuations.test.mjs" },
  { name: "lose-literal-terminal", supersedes: "lose-literal-terminal", before: "from <= call.start && call.start < to", after: "from <= call.start && call.start <= to + 200", pattern: "hosting/T99 ", test: dir + "attribution-continuations.test.mjs" },
  { name: "omit-ternary-false-alternative", supersedes: "omit-ternary-false-alternative", before: "const end = branches.getEnd();", after: "const end = branches.getStart(file) + 1;", pattern: "hosting/T100 ", test: dir + "attribution-ternary.test.mjs" },
];
const evidence = [];
for (const c of challenges) {
  const original = readFileSync(file);
  const source = original.toString("utf8");
  const changed = source.replace(c.before, c.after);
  assert.notEqual(changed, source, `${c.name}: mutation did not apply`);
  try {
    writeFileSync(file, changed);
    const result = spawnSync(process.execPath, ["--test", `--test-name-pattern=${c.pattern}`, c.test], { cwd: root, env, encoding: "utf8" });
    const output = result.stdout + result.stderr;
    assert.notEqual(result.status, 0, `${c.name}: survived`);
    assert.match(output, /AssertionError|ERR_ASSERTION/, `${c.name}: not an assertion kill\n${output}`);
    assert.doesNotMatch(output, /SyntaxError|ERR_MODULE_NOT_FOUND/, `${c.name}: setup failure is not evidence`);
    evidence.push({ name: c.name, outcome: "assertion-killed" });
  } finally { writeFileSync(file, original); }
}
console.log(`hosting-affected-mutations ${JSON.stringify(evidence)}`);
