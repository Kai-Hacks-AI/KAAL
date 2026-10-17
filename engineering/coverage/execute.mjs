// Runs one workspace's own tests under V8 coverage (c8) and returns the
// evidence for the JavaScript it delivers. This is test execution and evidence
// measurement only: which workspace, whether it is built, and which files it
// delivers are the caller's answers (packaging), passed in as `delivered`.
import { rmSync } from "node:fs";
import { join } from "node:path";
import { execute, readFile } from "kaal-hosting";
import { evidence } from "./summary.mjs";

/**
 * Runs `npm test -w name` from root under c8, counting only `delivered` (paths
 * relative to root, forward slashes), into report directory `dir`. Resolves to
 * { tests: "pass"|"fail", lines, branches, functions, unexecuted, output } or,
 * when coverage cannot be measured, { tests, failed, output } naming the
 * workspace and what is missing.
 */
export async function cover(name, delivered, { root, dir }) {
  // A report left by an earlier run is never evidence for this one.
  rmSync(dir, { recursive: true, force: true });
  const args = ["c8", "--all", "--exclude-node-modules=false", "--reporter=json-summary", `--report-dir=${dir}`, `--temp-directory=${join(dir, "tmp")}`, "--clean"];
  for (const p of delivered) args.push(`--include=${p}`);
  const r = await execute("npx", [...args, "npm", "test", "--if-present", "-w", name], { cwd: root });
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
