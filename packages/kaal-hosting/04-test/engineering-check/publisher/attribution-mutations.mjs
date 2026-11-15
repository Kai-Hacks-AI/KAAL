// Challenge each independent-review correction without changing frozen regressions.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const file = join(root, "dist/skills/kaal-hosting/scripts/boundary-core.js");
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;
const challenges = [
  { name: "omit-first-conditional-alternative", before: "if (title)", after: "if (false && title)", pattern: "hosting/T90 " },
  { name: "spill-else-if-extent", before: "if (branch) {", after: "if (branch) return mask.length;\n        if (branch) {", pattern: "hosting/T91 " },
  { name: "spill-semicolon-free-registration", before: "const newline = /[\\r\\n]/.test(mask.slice(i, next));", after: "const newline = false;", pattern: "hosting/T92 " },
  { name: "omit-comma-continuation", before: "/[.([?:,+\\-*/%<>=&|^]/", after: "/[.([?:+\\-*/%<>=&|^]/", pattern: "hosting/T98 ", test: "04-test/engineering-check/publisher/attribution-continuations.test.mjs" },
  { name: "lose-literal-terminal", before: 'text.startsWith("/") ? " " : "0"', after: 'text.startsWith("/") ? " " : " "', pattern: "hosting/T99 ", test: "04-test/engineering-check/publisher/attribution-continuations.test.mjs" },
  { name: "omit-ternary-false-alternative", before: "/[.([?:,+\\-*/%<>=&|^]/", after: "/[.([?,+\\-*/%<>=&|^]/", pattern: "hosting/T100 ", test: "04-test/engineering-check/publisher/attribution-ternary.test.mjs" },
];
const evidence = [];
for (const c of challenges) {
  const original = readFileSync(file);
  const source = original.toString("utf8");
  const changed = source.replace(c.before, c.after);
  assert.notEqual(changed, source, `${c.name}: mutation did not apply`);
  try {
    writeFileSync(file, changed);
    const result = spawnSync(process.execPath, ["--test", `--test-name-pattern=${c.pattern}`, c.test ?? "04-test/engineering-check/publisher/attribution-branches.test.mjs"], { cwd: root, env, encoding: "utf8" });
    const output = result.stdout + result.stderr;
    assert.notEqual(result.status, 0, `${c.name}: survived`);
    assert.match(output, /AssertionError|ERR_ASSERTION/, `${c.name}: not an assertion kill\n${output}`);
    assert.doesNotMatch(output, /SyntaxError|ERR_MODULE_NOT_FOUND/, `${c.name}: setup failure is not evidence`);
    evidence.push({ name: c.name, outcome: "assertion-killed" });
  } finally { writeFileSync(file, original); }
}
console.log(`hosting-attribution-mutations ${JSON.stringify(evidence)}`);
