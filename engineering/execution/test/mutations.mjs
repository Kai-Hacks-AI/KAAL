// Child-local substitutions only. Frozen acceptance bytes are never rewritten.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";
import { sha256 } from "@kaihacksai/kaal-foundation/sha256";

const target = new URL("../adopt.mjs", import.meta.url);
const planned = fileURLToPath(new URL("./plan/adoption.case.mjs", import.meta.url));
const original = readFileSync(target, "utf8");
// A nested test runner needs its own process context and TAP stream.
const { NODE_TEST_CONTEXT: parentTestContext, ...childEnv } = process.env;
const hook = `import { registerHooks } from 'node:module';
registerHooks({ load(url, context, next) {
  const loaded = next(url, context);
  return url === process.env.KAAL_ADOPTION_TARGET ? { ...loaded, source: process.env.KAAL_ADOPTION_SOURCE } : loaded;
} });`;
async function challenge(source, expected) {
  const result = await execute(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(hook)}`, "--test", "--test-timeout=10000", "--test-reporter=tap", ...(expected ? [`--test-name-pattern=${expected}:`] : []), planned], {
    cwd: fileURLToPath(new URL("../../../", import.meta.url)),
    env: { ...childEnv, KAAL_ADOPTION_TARGET: target.href, KAAL_ADOPTION_SOURCE: source },
  });
  const output = result.stdout + result.stderr;
  const failures = [...output.matchAll(/not ok \d+ - (E-D\d+):/g)].map(m => m[1]);
  const invalid = /SyntaxError|blocked before behavioural assertion|ERR_MODULE_NOT_FOUND|testTimeoutFailure/.test(output);
  return { status: result.status === 0 ? "survived" : !invalid && /ERR_ASSERTION/.test(output) && failures.includes(expected) ? "killed" : "invalid", failures, exit: result.status, output };
}
const baseline = await challenge(original);
assert.equal(baseline.exit, 0, baseline.output);
const inert = await challenge('export async function run() { return { requestResults: [], executions: [], verdict: {}, advice: {}, findings: [] }; }', "E-D01");
assert.equal(inert.status, "killed", inert.output);
// Run the inert implementation against every accepted Case as independent RED.
const red = await challenge('export async function run() { return { requestResults: [], executions: [], verdict: {}, advice: {}, findings: [] }; }');
assert.equal(red.failures.length, 16, red.output);
assert.equal([...red.output.matchAll(/code: .ERR_ASSERTION./g)].length, 16, red.output);
assert.doesNotMatch(red.output, /SyntaxError|blocked before behavioural assertion|ERR_MODULE_NOT_FOUND/);
const changes = [
  ["extra execution", "E-D01", "const observed = [];", "const observed = []; await ports.execute(plan.runs[0], step.domain);"],
  ["erased failure", "E-D02", 'executions.push({ kind, ...detail, observation });', 'if (observation?.outcome === "failed") observation = { ...observation, outcome: "passed", exit: 0, cases: [] };\n    executions.push({ kind, ...detail, observation });'],
  ["lost reader", "E-D15", "const report = { mode, requestResults,", "requestResults.pop();\n  const report = { mode, requestResults,"],
  ["omitted Case", "E-D10", "return observation;", "return { ...observation, cases: [] };"],
  ["changed original entrypoint", "E-D08", "ports.original(request)", 'ports.original({ ...request, entrypoint: "node --test" })'],
  ["dropped domain partition", "E-D05", " && last.domain === item.qualified.domain", ""],
  ["cross-context cache", "E-D11", "ports.execute(scheduled, step.domain)", "(cachedObservation ??= ports.execute(scheduled, step.domain))"],
  ["activation bypass", "E-D16", 'object(authorization) && context.mode === "reuse"', 'context.mode === "reuse"'],
];
const results = [];
for (const [name, expected, from, to] of changes) {
  assert.equal(original.split(from).length, 2, `unique mutation anchor: ${name}`);
  const source = (name === "cross-context cache" ? "let cachedObservation;\n" : "") + original.replace(from, to);
  const result = await challenge(source, expected);
  assert.equal(result.status, "killed", `${name}: ${result.output}`);
  results.push({ name, status: result.status, assertion: expected, failures: result.failures });
}
console.log(JSON.stringify({ subject: "Engineering C51 adoption adapter", sha256: sha256(readFileSync(target)), runtime: process.version, baseline: { pass: 16, fail: 0 }, independentRed: { failures: red.failures, assertionFailures: 16 }, results }, null, 2));
