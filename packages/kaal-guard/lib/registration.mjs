// The registration reader (guard/A21): guard.json files and aggregates.json, read from Git objects at a
// revision, validated as a closed schema, and the add-only judgment against the base (guard/F42). Runs nothing.
import { execFileSync } from "node:child_process";
import { dirname, posix } from "node:path";

const BUILT = ["solution"];
const NAME = /^[^\s:/]+$/;

export class Refused extends Error {
  constructor(message, todo) { super(message); this.todo = todo; }
}

const git = (cwd, ...args) => execFileSync("git", args, { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });

/** The tracked paths of a revision. */
export const tree = (cwd, rev) => git(cwd, "ls-tree", "-r", "--name-only", "-z", rev).split("\0").filter(Boolean);
export const show = (cwd, rev, path) => git(cwd, "show", `${rev}:${path}`);
const changed = (cwd, base, head) => (base === head ? [] : git(cwd, "diff", "--name-status", "-z", base, head).split("\0").filter(Boolean));

const parse = (text, file) => {
  try { return JSON.parse(text); } catch (e) { throw new Refused(`${file} is not JSON: ${e.message}`, `fix ${file}`); }
};
const isObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

/** The aggregates file at a revision. Missing or unparseable is cannot judge, never empty (guard/F43). */
export function readAggregates(cwd, rev, config) {
  const file = posix.join(config, "aggregates.json");
  let text;
  try { text = show(cwd, rev, file); } catch { throw new Refused(`${file} is missing at the base`, `add ${file} on the base: { "solution": { "always": [], "exempt": {} } }`); }
  const data = parse(text, file);
  if (!isObject(data)) throw new Refused(`${file} must be an object of aggregates`, `fix ${file}`);
  for (const [name, a] of Object.entries(data)) {
    if (!BUILT.includes(name)) throw new Refused(`${file} names the aggregate ${name}, which is not built yet`, `only ${BUILT.join(", ")} exists in this version`);
    if (!isObject(a) || Object.keys(a).some((k) => !["always", "exempt"].includes(k)) || !Array.isArray(a.always ?? []) || !isObject(a.exempt ?? {})) throw new Refused(`${file}: ${name} takes only always (a list) and exempt (a map)`, `fix ${file}`);
  }
  return { file, solution: { always: data.solution?.always ?? [], exempt: data.solution?.exempt ?? {} } };
}

/** The registrations of a revision: every guard.json, validated. */
export function readRegistrations(cwd, rev, paths = tree(cwd, rev)) {
  const out = [];
  for (const file of paths.filter((p) => p === "guard.json" || p.endsWith("/guard.json"))) {
    if (file.split("/").includes("node_modules")) continue;
    const data = parse(show(cwd, rev, file), file);
    const folder = dirname(file) === "." ? "" : dirname(file);
    if (!isObject(data) || Object.keys(data).some((k) => k !== "checks") || !Array.isArray(data.checks)) throw new Refused(`${file} takes only checks, a list`, `fix ${file}`);
    for (const c of data.checks) {
      if (!isObject(c) || Object.keys(c).some((k) => !["name", "command", "aggregates"].includes(k))) throw new Refused(`${file}: a check takes only name, command and aggregates`, `fix ${file}`);
      if (typeof c.name !== "string" || !NAME.test(c.name)) throw new Refused(`${file}: a check's name has no space, colon or slash`, `fix ${file}`);
      if (typeof c.command !== "string" || c.command.trim() === "") throw new Refused(`${file}: check ${c.name} has no command`, `fix ${file}`);
      if (!Array.isArray(c.aggregates) || c.aggregates.some((a) => typeof a !== "string")) throw new Refused(`${file}: check ${c.name} needs aggregates, a list`, `fix ${file}`);
      for (const a of c.aggregates) if (!BUILT.includes(a)) throw new Refused(`${file}: check ${c.name} names the aggregate ${a}, which is not built yet`, `only ${BUILT.join(", ")} exists in this version`);
      out.push({ id: folder === "" ? c.name : `${folder}/${c.name}`, name: c.name, folder, file, command: c.command, aggregates: c.aggregates });
    }
  }
  return out;
}

/** The legacy declarations (.md) never join an aggregate (guard/N17). */
export function refuseLegacyAggregates(cwd, rev, config, paths) {
  for (const p of paths.filter((x) => x.startsWith(`${config}/`) && x.endsWith(".md") && !x.slice(config.length + 1).includes("/"))) {
    const front = /^---\n([\s\S]*?)\n---/.exec(show(cwd, rev, p))?.[1] ?? "";
    if (/^aggregates\s*:/m.test(front)) throw new Refused(`${p} is a legacy declaration and takes no aggregates`, "register the check in a guard.json beside the package instead");
  }
}

/** The package.json scripts of every package at a revision, by folder. */
export function readPackages(cwd, rev, paths) {
  const out = {};
  for (const p of paths.filter((x) => x === "package.json" || x.endsWith("/package.json"))) {
    if (p.split("/").includes("node_modules")) continue;
    let scripts = {};
    try { scripts = JSON.parse(show(cwd, rev, p)).scripts ?? {}; } catch (e) { throw new Refused(`${p} is not readable JSON: ${e.message}`, `fix ${p}: an unreadable package.json is never read as having no suite`); }
    out[dirname(p) === "." ? "" : dirname(p)] = scripts;
  }
  return out;
}

/**
 * Add-only (guard/F42). The candidate keeps every baseline registration unchanged, unless (a) its diff holds
 * only registration files, or (b) the suite no longer exists because the folder's package.json is deleted.
 */
export function judgeAdditions(cwd, base, head, baseRegs, headRegs, config) {
  const status = changed(cwd, base, head);
  const files = [];
  for (let i = 0; i < status.length; i += 2) files.push(status[i + 1]);
  const deletedPackages = new Set();
  for (let i = 0; i < status.length; i += 2) if (status[i].startsWith("D") && (status[i + 1] === "package.json" || status[i + 1].endsWith("/package.json"))) deletedPackages.add(dirname(status[i + 1]) === "." ? "" : dirname(status[i + 1]));
  const registrationOnly = files.length > 0 && files.every((f) => f === "guard.json" || f.endsWith("/guard.json") || f === posix.join(config, "aggregates.json"));
  for (const b of baseRegs) {
    const h = headRegs.find((r) => r.id === b.id);
    const same = h && h.command === b.command && h.file === b.file && JSON.stringify(h.aggregates) === JSON.stringify(b.aggregates);
    if (same || registrationOnly || deletedPackages.has(b.folder)) continue;
    throw new Refused(`${b.file}: the candidate ${h ? "changes" : "removes"} the registration ${b.id} that the base holds`, `land the change to ${b.file} on its own in a reviewed pull request, or delete the package.json of ${b.folder || "the root"} with it if the suite is gone`);
  }
}
