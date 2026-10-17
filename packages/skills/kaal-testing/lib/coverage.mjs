// Coverage of the code a capability delivers, executed by that capability's
// own tests: Testing's reusable execution and evidence measurement. What is
// delivered, and whether it is built, is packaging: the caller decides it and
// passes the delivered files in. Hosting realizes the commands and reads.
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { execute, kind, readFile } from "kaal-hosting";

const C8 = fileURLToPath(import.meta.resolve("c8/bin/c8.js"));

// Reading one c8 json-summary into coverage evidence. A summary that is
// missing, unreadable or not a c8 summary is a failure of measurement for that
// workspace, never a percentage.
/** The coverage evidence for `workspace`, or `{ failed }` naming what is missing or invalid. */
export function evidence(workspace, root, text) {
  if (text === undefined) return { failed: `${workspace}: no coverage summary was produced` };
  let summary;
  try {
    summary = JSON.parse(text);
  } catch (e) {
    return { failed: `${workspace}: the coverage summary is not JSON (${e.message})` };
  }
  const metric = (s, k) => s?.[k] && Number.isFinite(s[k].pct) && Number.isInteger(s[k].total) && Number.isInteger(s[k].covered);
  const valid = (s) => ["lines", "branches", "functions"].every((k) => metric(s, k));
  if (summary === null || typeof summary !== "object" || !valid(summary.total)) return { failed: `${workspace}: the coverage summary has no valid total for lines, branches and functions` };
  const files = Object.entries(summary).filter(([file]) => file !== "total");
  const invalid = files.find(([, s]) => !valid(s));
  if (invalid) return { failed: `${workspace}: the coverage summary has no valid figures for ${invalid[0]}` };
  const relative = (file) => (file.startsWith(root) ? file.slice(root.length + 1) : file).replaceAll("\\", "/");
  return {
    lines: summary.total.lines.pct,
    branches: summary.total.branches.pct,
    functions: summary.total.functions.pct,
    measured: files.map(([file]) => relative(file)).sort(),
    unexecuted: files
      .filter(([, s]) => s.functions.total > 0 && s.functions.covered === 0 && s.lines.covered === 0)
      .map(([file]) => relative(file))
      .sort(),
  };
}

/**
 * Runs `npm test -w name` from root under c8, counting only `delivered` (paths
 * relative to root, forward slashes), into report directory `dir`, which must
 * hold no coverage summary yet: the caller provides a fresh one. Resolves to
 * { tests: "pass"|"fail", lines, branches, functions, unexecuted, output } or,
 * when coverage cannot be measured, { tests, failed, output } naming the
 * workspace and what is missing. It removes nothing.
 */
export async function cover(name, delivered, { root, dir }) {
  // A report left by an earlier run is never evidence for this one.
  if ((await kind(join(dir, "coverage-summary.json"))) !== "missing") return { failed: `${name}: ${dir} already holds a coverage summary; measurement needs a fresh report directory`, output: "" };
  const args = ["--all", "--exclude-node-modules=false", "--reporter=json-summary", `--report-dir=${dir}`, `--temp-directory=${join(dir, "tmp")}`, "--clean"];
  for (const p of delivered) args.push(`--include=${p}`);
  const r = await execute(process.execPath, [C8, ...args, "npm", "test", "--if-present", "-w", name], { cwd: root });
  const tests = r.status === 0 ? "pass" : "fail";
  const output = r.status === 0 ? "" : r.stdout + r.stderr;
  let text;
  try {
    text = (await readFile(join(dir, "coverage-summary.json"))).toString("utf8");
  } catch {
    text = undefined;
  }
  const found = evidence(name, root, text);
  if (found.failed) return { tests, failed: found.failed, output };
  const missing = delivered.filter((p) => !found.measured.includes(p));
  if (missing.length) return { tests, failed: `${name}: no coverage was reported for delivered ${missing.join(", ")}`, output };
  return { tests, lines: found.lines, branches: found.branches, functions: found.functions, unexecuted: found.unexecuted, output };
}
