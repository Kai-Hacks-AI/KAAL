import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { learningOf, nodeFiles, parseNode, relativeIdentity } from "../skills/using-brain/scripts/brain.js";

/**
 * KAAL's trusted regression: `main`, the authoritative regression, judges a
 * candidate with `main`'s own cases, chosen by `main`'s own links and run
 * against the candidate's code, so a candidate cannot weaken, remove or
 * relabel one of `main`'s commitments by changing its own tests. How a
 * commitment is legitimately replaced or withdrawn is stated in
 * brain/learning/genesis/26/09/26/02/nodes/testing.md; this applies it.
 */

export const PLAN = "test/regression-plan.md";
export const BRAIN = "brain/learning";
/** Where each skill's cases are kept; they prove its SKILL.md, commitment 7's place. */
export const SKILL_CASES = "skills/*/SKILL.md";

/** The section of a plan under `heading`, up to the next `## ` heading. */
function section(plan: string, heading: string): string {
  const start = plan.indexOf(`\n## ${heading}`);
  if (start < 0) return "";
  const rest = plan.slice(start + 1);
  const end = rest.indexOf("\n## ", 1);
  return end < 0 ? rest : rest.slice(0, end);
}

/** The place each commitment of a plan is stated in, in the plan's order. */
export function planCommitments(plan: string): string[] {
  return [...section(plan, "Commitments").matchAll(/^\d+\. .*?[Ss]tated in (?:each )?`([^`]+)`/gm)].map((m) => m[1]!);
}

export type Ledger = { base?: string; replaces: [string, string][]; withdraws: [string, string][] };

/** What a plan says it was derived from, and what it replaces and withdraws, each with what supersedes it. */
export function planLedger(plan: string): Ledger {
  const text = section(plan, "How this regression differs from the one it was derived from");
  const pairs = (label: string): [string, string][] => {
    const line = new RegExp(`^- ${label}: (.*)$`, "m").exec(text)?.[1] ?? "";
    return [...line.matchAll(/`([^`]+)` by `([^`]+)`/g)].map((m) => [m[1]!, m[2]!]);
  };
  return {
    base: /^Derived from: `main` at `([0-9a-f]{40})`/m.exec(text)?.[1],
    replaces: pairs("Replaces"),
    withdraws: pairs("Withdraws"),
  };
}

export type Case = { file: string; title: string; places: string[] };

/**
 * The cases a test file states, each with the places of the commitments it
 * points at through `// Why:` lines directly above it. Only cases whose title
 * is a plain string literal are found.
 */
export function fileCases(file: string, source: string): Case[] {
  const cases: Case[] = [];
  const lines = source.split(/\r?\n/);
  const text = lines.join("\n");
  for (const m of text.matchAll(/^test\(\s*"((?:[^"\\]|\\.)*)"/gm)) {
    const title = JSON.parse(`"${m[1]}"`) as string;
    const places: string[] = [];
    let line = text.slice(0, m.index).split("\n").length - 2;
    for (; line >= 0; line--) {
      const why = /^\/\/ Why: (\S+)$/.exec(lines[line]!);
      if (!why) break;
      places.unshift(why[1]!);
    }
    cases.push({ file, title, places });
  }
  return cases;
}

/** The files a repository's own `npm test` runs, by posix path relative to it. */
export function caseFiles(repo: string): string[] {
  const script = (
    JSON.parse(fs.readFileSync(path.join(repo, "package.json"), "utf8")) as { scripts?: { test?: string } }
  ).scripts?.test;
  const globs = script?.split(/\s+/).filter((arg) => arg.endsWith(".ts")) ?? [];
  return [...new Set(globs.flatMap((glob) => fs.globSync(glob, { cwd: repo })))]
    .map((file) => file.split(path.sep).join("/"))
    .sort();
}

/** Every case a repository keeps, with the commitments it helps prove: a skill's cases prove its SKILL.md. */
export function repoCases(repo: string): Case[] {
  return caseFiles(repo).flatMap((file) => {
    const cases = fileCases(file, fs.readFileSync(path.join(repo, file), "utf8"));
    return file.startsWith("skills/") ? cases.map((c) => ({ ...c, places: [SKILL_CASES] })) : cases;
  });
}

type Node = { place: string; name: string; lineage: string; key: string };

function brainNodes(repo: string): Node[] {
  const root = path.join(repo, BRAIN);
  return nodeFiles(root).map((file) => {
    const { lineage, key } = learningOf(root, file);
    return { place: `${BRAIN}/${relativeIdentity(root, file)}`, name: parseNode(file).name, lineage, key };
  });
}

export type Classification = {
  retained: string[];
  replaced: Map<string, string>;
  withdrawn: Map<string, string>;
  errors: string[];
};

/**
 * Classifies every commitment of the trusted regression against a candidate.
 * A commitment is retained while the candidate's plan still names its place.
 * Otherwise it must have been superseded in BRAIN: a later node with the same
 * name, in the same lineage, is what KAAL means now. If the candidate's plan
 * names that node, the commitment is replaced by it; if not, it is withdrawn
 * by it. A commitment stated outside BRAIN has no succession, so it can only
 * be retained. Anything else is a silent escape. The plan's own account of
 * what it replaces and withdraws is only checked against this, never trusted.
 */
export function classify(trusted: string, candidate: string, base: string): Classification {
  const errors: string[] = [];
  const planOf = (repo: string) =>
    fs.existsSync(path.join(repo, PLAN)) ? fs.readFileSync(path.join(repo, PLAN), "utf8") : undefined;
  const trustedPlan = planOf(trusted);
  const candidatePlan = planOf(candidate) ?? "";
  const kept = new Set(planCommitments(candidatePlan));
  const nodes = brainNodes(candidate);
  const current = (node: Node) =>
    nodes
      .filter((n) => n.name === node.name && n.lineage === node.lineage && n.key > node.key)
      .sort((a, b) => a.key.localeCompare(b.key))
      .at(-1);
  const retained: string[] = [];
  const replaced = new Map<string, string>();
  const withdrawn = new Map<string, string>();
  const candidateCases = repoCases(candidate);
  for (const place of trustedPlan ? planCommitments(trustedPlan) : []) {
    const node = nodes.find((n) => n.place === place);
    const successor = node && current(node);
    if (kept.has(place)) {
      if (successor) errors.push(`${place}: the plan still names it, but ${successor.place} supersedes it`);
      retained.push(place);
    } else if (!successor) {
      errors.push(`${place}: silent escape: the plan no longer names it, and nothing in BRAIN supersedes it`);
    } else if (kept.has(successor.place)) {
      replaced.set(place, successor.place);
      if (!candidateCases.some((c) => c.places.includes(successor.place)))
        errors.push(`${place}: replaced by ${successor.place}, which no case of the candidate proves`);
    } else {
      withdrawn.set(place, successor.place);
    }
  }
  const ledger = planLedger(candidatePlan);
  if (ledger.base !== base) errors.push(`${PLAN}: derived from ${ledger.base ?? "nothing"}, not from main at ${base}`);
  const same = (said: [string, string][], found: Map<string, string>) =>
    JSON.stringify([...said].sort()) === JSON.stringify([...found].sort());
  if (!same(ledger.replaces, replaced))
    errors.push(
      `${PLAN}: says it replaces ${JSON.stringify(ledger.replaces)}, but BRAIN shows ${JSON.stringify([...replaced])}`,
    );
  if (!same(ledger.withdraws, withdrawn))
    errors.push(
      `${PLAN}: says it withdraws ${JSON.stringify(ledger.withdraws)}, but BRAIN shows ${JSON.stringify([...withdrawn])}`,
    );
  return { retained, replaced, withdrawn, errors };
}

export type Result = { file: string; name: string; outcome: "pass" | "fail" | "skip" };

/**
 * Judges the trusted cases' results against the candidate. A case that did not
 * pass (it failed, was skipped, never reported, or its file did not run as a
 * whole) is excused only when every commitment it points at was replaced or
 * withdrawn; a case that points at nothing is never excused.
 */
export function judge(cases: Case[], results: Result[], superseded: Set<string>): string[] {
  // A file that does not run as a whole reports one result, named by the path it was run as.
  const broken = new Set(results.filter((r) => r.name.split("\\").join("/") === r.file).map((r) => r.file));
  return cases.flatMap((c) => {
    const result = results.find((r) => r.file === c.file && r.name === c.title);
    const outcome = broken.has(c.file) ? "did not run as a whole" : !result ? "not run" : result.outcome;
    if (outcome === "pass") return [];
    if (c.places.length && c.places.every((p) => superseded.has(p))) return [];
    return [`${c.file}: "${c.title}" ${outcome === "fail" ? "failed" : outcome === "skip" ? "was skipped" : outcome}`];
  });
}

const TSX = fileURLToPath(import.meta.resolve("tsx/cli"));
// A URL, not a path: a Windows path such as D:\\… would be read as a URL with the scheme "d:".
const REPORTER = new URL("./regression-reporter.ts", import.meta.url).href;

/** Whether `file`, a posix path, is test data or a test-data loader, which travel with the cases. */
const isData = (file: string) => file.split("/").includes("test-data") || path.posix.basename(file) === "test-data.ts";

/** The test data and test-data loaders of a repository, outside its dependencies and Git's own files. */
function dataOf(repo: string, dir = ""): string[] {
  return fs.readdirSync(path.join(repo, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (rel === "node_modules" || rel === ".git") return [];
    if (isData(rel)) return [rel];
    return e.isDirectory() ? dataOf(repo, rel) : [];
  });
}

/**
 * Runs the trusted cases, with the trusted test data, against a copy of the
 * candidate's code, using the trusted test runner and reporter, never the
 * candidate's. Returns what each case did.
 */
export function runTrusted(trusted: string, candidate: string): Result[] {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "kaal-regression-"));
  const code = path.join(scratch, "candidate");
  fs.cpSync(candidate, code, {
    recursive: true,
    verbatimSymlinks: true,
    filter: (src) => {
      const rel = path.relative(candidate, src).split(path.sep).join("/");
      return rel !== ".git" && rel !== "node_modules" && !isData(rel);
    },
  });
  if (fs.existsSync(path.join(candidate, "node_modules")))
    fs.symlinkSync(path.join(candidate, "node_modules"), path.join(code, "node_modules"), "junction");
  const files = caseFiles(trusted);
  for (const rel of [...files, ...dataOf(trusted)]) {
    fs.rmSync(path.join(code, rel), { recursive: true, force: true });
    fs.cpSync(path.join(trusted, rel), path.join(code, rel), { recursive: true, verbatimSymlinks: true });
  }
  const out = path.join(scratch, "results.jsonl");
  fs.writeFileSync(out, "");
  spawnSync(process.execPath, [TSX, "--test", `--test-reporter=${REPORTER}`, ...files], {
    cwd: code,
    // A run started from within another test run would report to that run instead.
    env: { ...process.env, NODE_TEST_CONTEXT: undefined, KAAL_REGRESSION_RESULTS: out },
    stdio: "ignore",
  });
  return fs
    .readFileSync(out, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const r = JSON.parse(line) as Result;
      return { ...r, file: path.relative(code, r.file).split(path.sep).join("/") };
    });
}

/** Everything that stops a candidate from being accepted over the trusted regression at `base`. */
export function regressionErrors(trusted: string, candidate: string, base: string): string[] {
  const { replaced, withdrawn, errors } = classify(trusted, candidate, base);
  const superseded = new Set([...replaced.keys(), ...withdrawn.keys()]);
  return [...errors, ...judge(repoCases(trusted), runTrusted(trusted, candidate), superseded)];
}
