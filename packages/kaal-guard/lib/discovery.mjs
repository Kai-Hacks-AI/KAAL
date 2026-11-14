// Discovery (guard/F43 to F45): a repository's checks that sit beside the code they guard, in a
// kaal-guard.json at a package root, in an open Change folder, or at the root of the .kaal directory. For the files a
// change touches, Guard takes the nearest kaal-guard.json of each and runs its checks. It reads the
// working tree and the list of changed files, and computes no ownership and no dependency graph; what
// else is in flight comes from the Engine's plan.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { posix } from "node:path";
import { words } from "./command.mjs";
import { Refusal } from "./config.mjs";
import { runCheck } from "./runner.mjs";

/** The file's name, and the one that runs on every run whatever the change touches. */
export const NAME = "kaal-guard.json";
export const ALWAYS = [".kaal", NAME].join("/");

/** A result of Guard about a file or the plan, not about a check. */
const result = (name, verdict, evidence, todo) => ({ name, verdict, evidence, ...(todo ? { do: todo } : {}) });

/** A `when` glob as a regular expression: `**` crosses folders, `*` and `?` do not. */
export function glob(pattern) {
  let out = "";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*" && pattern[i + 1] === "*") {
      if (pattern[i + 2] === "/") {
        out += "(?:.*/)?";
        i += 2;
      } else {
        out += ".*";
        i += 1;
      }
    } else if (c === "*") out += "[^/]*";
    else if (c === "?") out += "[^/]";
    else out += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  }
  return new RegExp(`^${out}$`);
}

/** The tracked and untracked files named kaal-guard.json that exist in the working tree, in path order. */
export function find(root) {
  const r = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", `:(glob)**/${NAME}`], { cwd: root, encoding: "utf8" });
  if (r.status !== 0) return { problem: `git ls-files failed: ${r.stderr.trim()}` };
  return { files: r.stdout.split("\0").filter((p) => p && existsSync(`${root}/${p}`)).sort() };
}

/** One file's checks: { checks } of { id, run, when? }, or a Refusal naming the file and the check. */
export function parse(file, text) {
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    throw new Refusal(`${file}: is not JSON: ${e.message}`, `write ${file} as { "checks": [ { "id": "...", "run": "..." } ] }`);
  }
  if (!body || typeof body !== "object" || Array.isArray(body) || !Array.isArray(body.checks)) {
    throw new Refusal(`${file}: checks: must be a list`, `write ${file} as { "checks": [ { "id": "...", "run": "..." } ] }`);
  }
  const seen = new Set();
  for (const [i, c] of body.checks.entries()) {
    const at = `${file}: checks[${i}]`;
    if (!c || typeof c !== "object" || Array.isArray(c)) throw new Refusal(`${at}: is not an object`, "give each check an id and a run");
    for (const member of Object.keys(c)) if (!["id", "run", "when"].includes(member)) throw new Refusal(`${at}: ${member}: not defined; a check has id, run and when`, "use only id, run and when");
    if (typeof c.id !== "string" || !/^[^:\s]+$/.test(c.id)) throw new Refusal(`${at}: id: must be a string without spaces or colons`, "name the check with an id");
    if (seen.has(c.id)) throw new Refusal(`${file}: ${c.id}: is an id twice`, "keep each id once in a file");
    seen.add(c.id);
    if (typeof c.run !== "string" || !words(c.run)?.length) throw new Refusal(`${file}: ${c.id}: run: names no program, or a quote in it is not closed`, "write a program and its arguments as words");
    if (c.when !== undefined && !(Array.isArray(c.when) && c.when.length && c.when.every((g) => typeof g === "string"))) throw new Refusal(`${file}: ${c.id}: when: must be a list of globs`, "write when as a list of globs relative to the file, or leave it out");
  }
  return body.checks;
}

/** The plan the Engine gave: { unknown: true } or { inFlight: [folders] }, or a Refusal. */
export function readPlan(path) {
  let body;
  try {
    body = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new Refusal(`the plan ${path} cannot be read: ${e.message}`, "give --plan a readable JSON file, or leave it out");
  }
  const ok = body && typeof body === "object" && !Array.isArray(body);
  if (ok && body.unknown === true && Object.keys(body).length === 1) return { unknown: true };
  if (ok && Array.isArray(body["in-flight"]) && body["in-flight"].length && body["in-flight"].every((f) => typeof f === "string") && Object.keys(body).length === 1) {
    return { inFlight: body["in-flight"].map((f) => f.replace(/\/+$/, "")) };
  }
  throw new Refusal(`the plan ${path} is neither { "unknown": true } nor { "in-flight": [folders] }`, "write the plan as the Engine produces it");
}

/** The changed paths of the `changed` fact (NUL-separated, as git diff -z writes them), or undefined. */
export function changedPaths(path) {
  if (path === undefined) return undefined;
  try {
    return readFileSync(path, "utf8").split("\0").filter(Boolean);
  } catch {
    return undefined;
  }
}

/**
 * Runs the checks of every kaal-guard.json the change selects. `facts.changed` is the file of changed
 * paths; `options` has `full` and `plan`. Returns { results, notes }: notes are lines about how the
 * selection was made (an unknown selection says so), never a silent success.
 */
export function runDiscovered(root, facts, options = {}) {
  const found = find(root);
  if (found.problem) return { results: [result(NAME, "cannot judge", found.problem, "run kaal-guard inside a Git working tree")], notes: [] };
  // A repository with no kaal-guard.json has nothing to discover: a run says nothing about it, as before.
  if (found.files.length === 0 && options.plan === undefined) return { results: [], notes: [] };
  const results = [];
  const notes = [];
  const files = new Map();
  for (const file of found.files) {
    try {
      files.set(file, parse(file, readFileSync(`${root}/${file}`, "utf8")));
    } catch (e) {
      if (!(e instanceof Refusal)) throw e;
      results.push(result(file, "cannot judge", e.message, e.todo));
    }
  }
  let plan = {};
  if (options.plan !== undefined) {
    try {
      plan = readPlan(options.plan);
    } catch (e) {
      if (!(e instanceof Refusal)) throw e;
      return { results: [...results, result("plan", "cannot judge", e.message, e.todo)], notes };
    }
  }
  const changed = changedPaths(facts.changed);
  const everything = options.full || plan.unknown || changed === undefined;
  if (everything) notes.push(`kaal-guard: selection unknown (${options.full ? "--full" : plan.unknown ? "the plan is unknown" : "no changed files supplied"}); running every ${NAME}`);
  // For each file, the changed paths relative to it that select its checks; null selects all of them.
  const touched = new Map();
  for (const file of files.keys()) {
    const dir = posix.dirname(file);
    if (file === ALWAYS || everything || plan.inFlight?.includes(dir)) touched.set(file, null);
  }
  if (!everything) {
    for (const path of changed) {
      let nearest;
      for (const file of files.keys()) {
        const dir = posix.dirname(file);
        const inside = dir === "." || path.startsWith(`${dir}/`);
        if (inside && (!nearest || posix.dirname(nearest).length < dir.length)) nearest = file;
      }
      if (!nearest || touched.get(nearest) === null) continue;
      const dir = posix.dirname(nearest);
      touched.set(nearest, [...(touched.get(nearest) ?? []), dir === "." ? path : path.slice(dir.length + 1)]);
    }
  }
  const supplied = Object.fromEntries(Object.entries(facts).filter(([, v]) => v !== undefined));
  for (const [file, paths] of touched) {
    for (const c of files.get(file)) {
      if (paths !== null && c.when && !paths.some((p) => c.when.some((g) => glob(g).test(p)))) continue;
      const name = `${file}:${c.id}`;
      results.push(runCheck(root, { checks: { [name]: { command: c.run, runs: ["hook", "ci"], facts: [] } } }, name, supplied));
    }
  }
  return { results, notes };
}
