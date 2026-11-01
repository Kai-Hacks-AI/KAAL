// Engineering-only mutation challenges. The loader substitutes source in each child;
// delivered modules and PLAN-established tests are never changed by this runner.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const target = new URL("../../lib/redesign.mjs", import.meta.url).href;
const planned = fileURLToPath(new URL("../plan/redesign.test.mjs", import.meta.url));
const original = readFileSync(new URL(target), "utf8");
const loader = `import { registerHooks } from 'node:module'; registerHooks({ load(url, context, next) { const loaded = next(url, context); return url === process.env.KAAL_MUTATION_TARGET ? { ...loaded, source: process.env.KAAL_MUTATION_SOURCE } : loaded; } });`;
const execute = (source) => spawnSync(process.execPath, ["--import", `data:text/javascript,${encodeURIComponent(loader)}`, "--test-reporter=tap", "--test", planned], {
  encoding: "utf8", timeout: 30000, maxBuffer: 2 ** 20,
  env: { ...process.env, KAAL_MUTATION_TARGET: target, KAAL_MUTATION_SOURCE: source },
});
const baseline = execute(original);
if (baseline.status !== 0) throw new Error(`mutation baseline failed: ${baseline.stdout}${baseline.stderr}`);
const challenges = [
  ["default window", "window: 5", "window: 6"],
  ["default recurrence", "recur: 3", "recur: 2"],
  ["share floor omitted", "&& c.ms > options.floor", ""],
  ["recurrence lowered", "seen >= options.recur", "seen >= options.recur - 1"],
  ["recent window omitted", "e.version === current).slice(-options.window)", "e.version === current)"],
  ["current version filter omitted", "e.profiled && e.version === current", "e.profiled"],
  ["platform distributions merged", "const cases = platforms.get(run.platform);", "const cases = platforms.values().next().value;"],
  ["unprofiled run counted", 'const profiled = p.result !== "unknown";', "const profiled = true;"],
  ["outliers alone counted", "e.concentration || e.outlier", "e.outlier"],
  ["concentration alone counted", "e.concentration || e.outlier", "e.concentration"],
  ["median order reversed", "b.medianMs - a.medianMs", "a.medianMs - b.medianMs"],
  ["candidate assigned to Hosting", 'owner: "case owner"', 'owner: "hosting"'],
  ["candidate changes run verdict", 'answer.candidates.length ? "challenged"', 'answer.candidates.length ? "failed"'],
  ["earlier window omitted", "e.version === previous).slice(-options.window)", "e.version === previous)"],
  ["pending reported too early", "recent.length < options.recur", "false"],
  ["speed comparison reversed", "afterMs < beforeMs", "afterMs > beforeMs"],
  ["not-faster implies preservation", '"faster" : "not faster"', '"faster" : "kept"'],
  ["hash change claims refactoring", "runs: recent.length,", 'runs: recent.length, result: "kept",'],
  ["duplicate history case accepted", "if (seen.has(c.name))", "if (false)"],
  ["unversioned history accepted", "if (!version(c.sha256))", "if (false)"],
  ["negative history duration accepted", "!Number.isFinite(c.ms) || c.ms < 0", "!Number.isFinite(c.ms)"],
  ["recurrence above window accepted", "if (read.recur > read.window)", "if (false)"],
  ["unknown timing option accepted", 'if (probe.result === "unknown")', "if (false)"],
  ["earlier RED not required", '!verdicts.includes("pass") || !verdicts.includes("fail")', '!verdicts.includes("pass")'],
  ["earlier GREEN not required", '!verdicts.includes("pass") || !verdicts.includes("fail")', '!verdicts.includes("fail")'],
  ["different Case kept", "if (before.id !== after.id)", "if (false)"],
  ["unchanged version kept", "if (before.version === after.version)", "if (false)"],
  ["dropped target ignored", "if (!later.has(target))", "if (false)"],
  ["added target ignored", "if (!earlier.has(target))", "if (false)"],
  ["unjudged subject ignored", "if (!Object.hasOwn(after.verdicts, subject))", "if (false)"],
  ["flipped verdict ignored", "else if (after.verdicts[subject] !== verdict)", "else if (false)"],
  ["malformed verdict accepted", '!["pass", "fail"].includes(verdict)', "false"],
  ["empty target list accepted", "!given.tests.length || ", ""],
  ["differences unordered", "differences: differences.sort(compare)", "differences"],
];
const results = challenges.map(([name, from, to]) => {
  if (!original.includes(from)) throw new Error(`mutation did not match: ${name}`);
  const changed = original.replace(from, to);
  const run = execute(changed);
  const output = `${run.stdout}${run.stderr}`;
  const status = run.error || /SyntaxError/.test(output) ? "invalid" : run.status === 0 ? "survived" : /AssertionError/.test(output) ? "killed" : "unresolved";
  return { name, status, killedBy: [...output.matchAll(/not ok \d+ - testing\/(T\d+)/g)].map((m) => m[1]) };
});
console.log(JSON.stringify({ subject: "testing/C53", baseline: "6 passed", results }, null, 2));
if (results.some((r) => r.status !== "killed")) process.exitCode = 1;
