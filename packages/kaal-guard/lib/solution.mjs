// The commands of the solution aggregate (guard/A21 to A23): plan, run --report and fold. They read exit
// statuses and reports only; they import nothing of Controls, Testing or Core (guard/N16).
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fold, plan } from "./aggregate.mjs";
import { completeness, OWN_SUITE } from "./completeness.mjs";
import { judgeAdditions, readAggregates, readPackages, readRegistrations, Refused, refuseLegacyAggregates, tree } from "./registration.mjs";
import { describe, REPORT, writeReport } from "./report.mjs";

const USAGE = `usage: kaal-guard plan --aggregate solution --run <id> --head <commit> [--base <commit>] [--config <dir>]
       kaal-guard run --check <id> --run <id> --head <commit> --report <file> [--config <dir>] [--ci] [--github]
       kaal-guard fold --aggregate solution --plan <file> --reports <dir>`;
const DEFAULT_CONFIG = ".kaal/config/guard";

function options(args, flags, valued) {
  const o = {};
  for (let i = 0; i < args.length; i++) {
    if (flags.includes(args[i])) o[args[i]] = true;
    else if (valued.includes(args[i])) {
      const v = args[++i];
      if (v === undefined || v.startsWith("--")) stop(`${args[i - 1]} needs a value`, USAGE);
      o[args[i - 1]] = v;
    } else stop(`unknown option ${args[i]}`, USAGE);
  }
  return o;
}
function stop(evidence, todo, code = 2) {
  console.log(`cannot judge: kaal-guard: ${evidence}`);
  console.log(`  do: ${todo}`);
  process.exit(code);
}
const top = () => {
  try { return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return stop("this is not inside a Git working tree", "run kaal-guard inside the repository"); }
};
const need = (o, ...names) => { for (const n of names) if (o[n] === undefined) stop(`${n} is required`, USAGE); };

export function planCommand(args) {
  const o = options(args, [], ["--aggregate", "--config", "--base", "--head", "--run"]);
  need(o, "--aggregate", "--run", "--head");
  if (o["--aggregate"] !== "solution") stop(`the aggregate ${o["--aggregate"]} is not built yet`, "only solution exists in this version");
  const root = top();
  const config = (o["--config"] ?? DEFAULT_CONFIG).replace(/\/$/, "");
  const head = o["--head"];
  const base = o["--base"] ?? head;
  try {
    const baseTree = tree(root, base);
    const headTree = tree(root, head);
    const { solution, file } = (() => { const r = readAggregates(root, base, config); return { solution: r.solution, file: r.file }; })();
    refuseLegacyAggregates(root, head, config, headTree);
    const baseRegs = readRegistrations(root, base, baseTree);
    const headRegs = readRegistrations(root, head, headTree);
    judgeAdditions(root, base, head, baseRegs, headRegs, config);
    const packages = readPackages(root, head, headTree);
    const found = completeness({ aggregate: "solution", packages, registrations: headRegs, exempt: solution.exempt });
    if (found.length > 0) {
      console.log(`fail: kaal-guard: ${found.length} package(s) of the solution are not protected (exempt entries are read from ${file})`);
      for (const f of found) { console.log(`  ${f.check ?? f.folder ?? "root"} in ${f.place}: ${f.finding}`); console.log(`    do: ${f.fix}`); }
      process.exit(1);
    }
    const scripts = Object.fromEntries(headRegs.map((r) => [r.id, packages[r.folder]?.test]));
    const { plan: p, problem } = plan({ aggregate: "solution", run: o["--run"], head, always: solution.always, registrations: headRegs, scripts });
    if (problem) stop(problem, `fix ${file} or register the check`);
    process.stdout.write(`${JSON.stringify(p, null, 2)}\n`);
    process.exit(0);
  } catch (e) {
    if (e instanceof Refused) stop(e.message, e.todo);
    throw e;
  }
}

export function runCheckCommand(args) {
  const o = options(args, ["--ci", "--github"], ["--check", "--config", "--run", "--head", "--report"]);
  need(o, "--check", "--run", "--head", "--report");
  const root = top();
  const report = { check: o["--check"], aggregates: [], run: o["--run"], head: o["--head"], script: null, result: "cannot judge", finding: "", fix: "", registration: null };
  const finish = (code) => { writeReport(resolve(o["--report"]), report); for (const l of describe(o["--report"], { ...report, findings: report.finding ? [{ check: report.check, file: report.registration, finding: report.finding, fix: report.fix }] : [] })) console.log(l); process.exit(code); };
  const out = (...args) => { try { return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return undefined; } };
  const judged = out("rev-parse", "--verify", `${o["--head"]}^{commit}`);
  const actual = out("rev-parse", "HEAD");
  if (judged === undefined || actual !== judged) { report.finding = `the working tree is at ${actual ?? "no commit"}, not at the judged revision ${o["--head"]}: its result would not be a result of the judged revision`; report.fix = `check out ${o["--head"]}, then run the check again`; finish(2); }
  if (out("status", "--porcelain", "--untracked-files=no") !== "") { report.finding = "the working tree differs from the judged revision in tracked files"; report.fix = `restore the tracked files to ${o["--head"]}, then run the check again`; finish(2); }
  report.head = judged;
  let reg;
  try { reg = readRegistrations(root, o["--head"]).find((r) => r.id === o["--check"]); } catch (e) { if (!(e instanceof Refused)) throw e; report.finding = e.message; report.fix = e.todo; finish(2); }
  if (!reg) { report.finding = `no guard.json registers ${o["--check"]}`; report.fix = "register the check in a guard.json beside the package"; finish(2); }
  report.aggregates = reg.aggregates;
  report.registration = reg.file;
  const dir = join(root, reg.folder);
  try { report.script = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).scripts?.test ?? null; } catch (e) { report.finding = `${reg.folder ? `${reg.folder}/` : ""}package.json is not readable: ${e.message}`; report.fix = "fix package.json: an unreadable package.json is never read as having no suite"; finish(2); }
  if (!OWN_SUITE.has(reg.command) || report.script === null) {
    report.finding = !OWN_SUITE.has(reg.command) ? `the command ${JSON.stringify(reg.command)} is not the package's own test script` : `${reg.folder || "the root"}/package.json has no test script`;
    report.fix = `run the package's own suite: set the command to "npm test" in ${reg.file}`;
    finish(2);
  }
  const r = spawnSync("npm", ["test"], { cwd: dir, stdio: "inherit", shell: process.platform === "win32" });
  if (r.error) { report.finding = `npm test could not start: ${r.error.message}`; report.fix = "install npm on the runner"; finish(2); }
  if (r.status === 0) { report.result = "pass"; finish(0); }
  report.result = "fail";
  report.finding = `npm test exited ${r.status} in ${reg.folder || "."}`;
  report.fix = `reproduce it with npm test in ${reg.folder || "the root"}`;
  finish(1);
}

export function foldCommand(args) {
  const o = options(args, ["--github"], ["--aggregate", "--plan", "--reports", "--config"]);
  need(o, "--aggregate", "--plan", "--reports");
  let p;
  try { p = JSON.parse(readFileSync(o["--plan"], "utf8")); } catch (e) { stop(`the plan ${o["--plan"]} cannot be read: ${e.message}`, "run kaal-guard plan again"); }
  if (p.aggregate !== o["--aggregate"]) stop(`the plan is for ${p.aggregate}, not ${o["--aggregate"]}`, "give fold the plan of the same aggregate");
  const reports = [];
  if (existsSync(o["--reports"])) for (const f of readdirSync(o["--reports"]).filter((x) => x.endsWith(".json")).sort()) {
    try { reports.push(JSON.parse(readFileSync(join(o["--reports"], f), "utf8"))); } catch { reports.push({ check: f, result: "unreadable" }); }
  }
  const verdict = fold(p, reports);
  const out = { aggregate: p.aggregate, run: p.run, head: p.head, result: verdict.ok ? "pass" : "fail", decidedBy: p.expected, findings: verdict.findings };
  writeReport(resolve(REPORT), out);
  for (const l of describe(REPORT, out)) console.log(l);
  process.exit(verdict.ok ? 0 : 1);
}
