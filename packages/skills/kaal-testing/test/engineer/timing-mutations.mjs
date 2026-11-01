// Engineering-only mutation challenges. The loader substitutes source in each child;
// delivered modules and PLAN-established tests are never changed by this runner.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const target = new URL("../../lib/timing.mjs", import.meta.url).href;
const planned = fileURLToPath(new URL("../plan/timing.test.mjs", import.meta.url));
const original = readFileSync(new URL(target), "utf8");
const loader = `import { registerHooks } from 'node:module'; registerHooks({ load(url, context, next) { const loaded = next(url, context); return url === process.env.KAAL_MUTATION_TARGET ? { ...loaded, source: process.env.KAAL_MUTATION_SOURCE } : loaded; } });`;
const execute = (source) => spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(loader)}`, "--test", planned], {
  encoding: "utf8", timeout: 30000, maxBuffer: 2 ** 20,
  env: { ...process.env, KAAL_MUTATION_TARGET: target, KAAL_MUTATION_SOURCE: source },
});
const baseline = execute(original);
if (baseline.status !== 0) throw new Error(`mutation baseline failed: ${baseline.stdout}${baseline.stderr}`);
const challenges = [
  ["default share", "share: 0.8", "share: 0.7"],
  ["default budget", "budget: 0.8", "budget: 0.9"],
  ["default outlier", "outlier: 10", "outlier: 11"],
  ["default floor", "floor: 1000", "floor: 2000"],
  ["default factor", "factor: 4", "factor: 5"],
  ["default minimum", "minimum: 5", "minimum: 6"],
  ["unknown options accepted", "findings.push(`unknown timing option ${key}`)", "void key"],
  ["invalid options accepted", "if (!valid) findings.push(`timing option ${key} is out of range`);", "if (!valid) void key;"],
  ["duplicates accepted", "if (seen.has(c.name))", "if (false)"],
  ["negative duration accepted", "!Number.isFinite(c.ms) || c.ms < 0", "!Number.isFinite(c.ms)"],
  ["minimum omitted", "run.cases.length < settings.minimum", "false"],
  ["zero time accepted", "if (total === 0)", "if (false)"],
  ["slowest share rounded up", "Math.floor(Math.abs(share - nearest) <= Number.EPSILON * read.length ? nearest : share)", "Math.ceil(share)"],
  ["floating point not guarded", "Math.floor(Math.abs(share - nearest) <= Number.EPSILON * read.length ? nearest : share)", "Math.floor(share)"],
  ["budget boundary inclusive", "timeShare > settings.budget", "timeShare >= settings.budget"],
  ["outlier boundary inclusive", "c.ms > settings.outlier * typical", "c.ms >= settings.outlier * typical"],
  ["outlier floor omitted", "&& c.ms > settings.floor", ""],
  ["skew boundary inclusive", "ms > settings.factor * others", "ms >= settings.factor * others"],
  ["skew floor omitted", "&& ms > settings.floor", ""],
  ["skew routed to Hosting", 'kind: "skew", owner: "case owner"', 'kind: "skew", owner: "hosting"'],
  ["outlier routed to Hosting", 'kind: "outlier", owner: "case owner"', 'kind: "outlier", owner: "hosting"'],
  ["repeated platform accepted", "if (platforms.has(run.platform))", "if (false)"],
  ["missing case accepted", "if (!platforms.get(platform).has(name))", "if (false)"],
  ["own platform counted as peer", "ordered.filter((p) => p !== platform)", "ordered"],
  ["evidence changes verdict", 'challenges.length ? "challenged"', 'challenges.length ? "failed"'],
  ["skew median replaced with max", "const others = median(", "const others = Math.max(..."],
];
const results = challenges.map(([name, from, to]) => {
  if (!original.includes(from)) throw new Error(`mutation did not match: ${name}`);
  const changed = original.replace(from, to);
  const run = execute(changed);
  const output = `${run.stdout}${run.stderr}`;
  const status = run.error || /SyntaxError/.test(output) ? "invalid" : run.status === 0 ? "survived" : /AssertionError/.test(output) ? "killed" : "unresolved";
  return { name, status };
});
console.log(JSON.stringify({ subject: "testing/C47", baseline: "6 passed", results }, null, 2));
if (results.some((r) => r.status !== "killed")) process.exitCode = 1;
