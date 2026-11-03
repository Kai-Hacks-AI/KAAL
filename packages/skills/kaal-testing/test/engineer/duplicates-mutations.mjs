// Engineering evidence. Loader substitutions are child-local; approved Cases and
// repository configuration are unchanged. A kill requires an assertion failure.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const target = new URL("../../lib/duplicates.mjs", import.meta.url).href;
const planned = fileURLToPath(new URL("../plan/duplicates.test.mjs", import.meta.url));
const additional = fileURLToPath(new URL("../duplicates-inputs.test.mjs", import.meta.url));
const manifest = fileURLToPath(new URL("../../package.json", import.meta.url));
const original = readFileSync(new URL(target), "utf8");
const loader = `
import { registerHooks, syncBuiltinESMExports } from 'node:module';
import fs from 'node:fs';
if (process.env.KAAL_DUPLICATE_SCRIPT === 'yes') {
  const read = fs.readFileSync;
  fs.readFileSync = function(path, ...args) {
    const bytes = read.call(this, path, ...args);
    if (String(path) !== process.env.KAAL_DUPLICATE_MANIFEST) return bytes;
    const pkg = JSON.parse(String(bytes));
    pkg.scripts['test:duplicate'] = 'node --test test/plan/duplicates.test.mjs';
    return JSON.stringify(pkg);
  };
  syncBuiltinESMExports();
}
registerHooks({ load(url, context, next) {
  const loaded = next(url, context);
  return url === process.env.KAAL_DUPLICATE_TARGET ? { ...loaded, source: process.env.KAAL_DUPLICATE_SOURCE } : loaded;
} });`;
function execute(source, script = false, plannedOnly = false) {
  const r = spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(loader)}`, "--test", "--test-reporter=tap", planned, ...(plannedOnly ? [] : [additional])], {
    encoding: "utf8", timeout: 30000, maxBuffer: 2 ** 20,
    env: { ...process.env, KAAL_DUPLICATE_TARGET: target, KAAL_DUPLICATE_SOURCE: source,
      KAAL_DUPLICATE_SCRIPT: script ? "yes" : "no", KAAL_DUPLICATE_MANIFEST: manifest },
  });
  const output = `${r.stdout}${r.stderr}`;
  const failures = [...output.matchAll(/not ok \d+ - (testing\/T\d+) /g)].map((m) => m[1]);
  const status = r.error || /SyntaxError|blocked before behavioural assertion/.test(output) ? "invalid"
    : r.status === 0 ? "survived" : /ERR_ASSERTION/.test(output) ? "killed" : "unresolved";
  const implementationFailures = [...output.matchAll(/not ok \d+ - ((?:independent executions|unknown input)[^\n]+)/g)].map((m) => m[1]);
  return { status, failures, implementationFailures, exit: r.status, output };
}
const baseline = execute(original);
if (baseline.exit !== 0) throw new Error(`baseline failed: ${baseline.output}`);
const inert = execute(`export function duplicates() { return { result: "unchallenged", challenges: [], findings: [], wastedMs: 0 }; }
export function schedule() { return { runs: [], reads: [], findings: [] }; }`, false, true);
if (inert.status !== "killed" || inert.failures.join() !== "testing/T104,testing/T105,testing/T106,testing/T107,testing/T108") throw new Error(`no independent behavioural RED: ${inert.output}`);
const changes = [
  ...["case", "file", "sha256", "subject", "platform", "node"].map((field) => [
    `duplicate identity omits ${field}`, 'key(r, ["case", ...fields])', `key(r, ["case", ...fields].filter((f) => f !== "${field}"))`,
  ]),
  ...["file", "sha256", "subject", "platform", "node"].map((field) => [
    `schedule identity omits ${field}`, 'const id = key(run);', `const id = key(run, fields.filter((f) => f !== "${field}"));`,
  ]),
  ["single run challenged", 'if (runs.length < 2) continue;', 'if (false) continue;'],
  ["fastest included in waste", 'durations.slice(1)', 'durations'],
  ["slowest omitted instead of fastest", 'durations.slice(1)', 'durations.slice(0, -1)'],
  ["least waste first", 'b.wastedMs - a.wastedMs', 'a.wastedMs - b.wastedMs'],
  ["Case tie reversed", 'compare(a.case, b.case)', 'compare(b.case, a.case)'],
  ["wrong owner", 'owner: "case owner"', 'owner: "hosting"'],
  ["challenge changes verdict", 'challenges.length ? "challenged"', 'challenges.length ? "failed"'],
  ["empty execution accepted", 'execution.runs.length === 0', 'false'],
  ["negative duration accepted", '!Number.isFinite(r.ms) || r.ms < 0', '!Number.isFinite(r.ms)'],
  ["nonfinite duration accepted", '!Number.isFinite(r.ms) || r.ms < 0', 'r.ms < 0'],
  ["empty re-runner accepted", '"by" in r && !text(r.by)', 'false'],
  ["bad subject accepted", 'if (!digest(x.subject))', 'if (false)'],
  ["bad file hash accepted", 'if (!digest(r.sha256))', 'if (false)'],
  ["re-runners unordered", 'const by = ordered(runs.filter((r) => "by" in r).map((r) => r.by));', 'const by = [...new Set(runs.filter((r) => "by" in r).map((r) => r.by))];'],
  ["next omits re-runners", 'next: by.length ?', 'next: false ?'],
  ["repeated request accepted", 'if (seen.has(q.by))', 'if (false)'],
  ["empty file request accepted", '!Array.isArray(q.files) || q.files.length === 0', '!Array.isArray(q.files)'],
  ["repeated file read twice", 'for: new Set()', 'for: []'],
  ["for reversed", 'for: ordered([...r.for])', 'for: ordered([...r.for]).reverse()'],
  ["reads reversed", 'compare(a.by, b.by) || compare(a.file, b.file) || a.run - b.run', 'compare(b.by, a.by) || compare(a.file, b.file) || a.run - b.run'],
  ["largest waste instead of sum", 'challenges.reduce((sum, c) => sum + c.wastedMs, 0)', 'Math.max(0, ...challenges.map((c) => c.wastedMs))'],
  ["finding order reversed", 'const ordered = (xs) => [...new Set(xs)].sort(compare);', 'const ordered = (xs) => [...new Set(xs)];'],
];
const results = changes.map(([name, from, to]) => {
  if (!original.includes(from)) throw new Error(`mutation did not match: ${name}`);
  // Preserve valid JS and challenge duplicate file requests as repeated list entries.
  let source = original.replace(from, to);
  if (name === "repeated file read twice") source = source.replace('groups.get(id).for.add(q.by)', 'groups.get(id).for.push(q.by)').replace('for: ordered([...r.for])', 'for: [...r.for].sort(compare)');
  const { status, failures, implementationFailures } = execute(source);
  return { name, status, failures, ...(implementationFailures.length ? { implementationFailures } : {}) };
});
const collision = execute(original, true);
results.push({ name: "duplicate script entry", status: collision.status, failures: collision.failures });
const evidence = {
  subject: "testing/C51", runtime: process.version,
  baseline: { tests: 8, pass: 8 },
  independentRed: { status: inert.status, failures: inert.failures, note: "both exports callable; no missing-module or syntax failures" },
  results,
};
console.log(JSON.stringify(evidence, null, 2));
if (results.some((r) => r.status !== "killed")) process.exitCode = 1;
