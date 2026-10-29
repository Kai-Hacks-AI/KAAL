// NEW's orientation (agents/F1–agents/F3): what can be discovered about a directory from durable
// sources, read-only (agents/N4) and deterministic (agents/N2). Discovery is not authorization:
// authority is always reported unresolved, with the sources found (agents/F2, agents/A4).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { catalogOf, engineered, SOURCE } from "./catalog.mjs";
import { inspect } from "./git.mjs";

/** The instruction files an Agent may be given, listed and never interpreted. */
const INSTRUCTIONS = ["AGENTS.md", "CLAUDE.md", ".github/copilot-instructions.md"];

const CLAIM = "ownership.kaal.json";

const ENGINE = ".kaal";

const AUTHORITY = "orient discovers; it does not authorize";

const slash = (p) => p.split(sep).join("/");

const isDirectory = (p) => {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

/** Whether `p` reads as a file; a directory or a dangling link does not. */
const readable = (p) => {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
};

/** Every path under `dir` named `name`, outside node_modules/ and .git/, relative and sorted. */
function find(dir, name) {
  const found = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (e.name !== "node_modules" && e.name !== ".git") walk(join(d, e.name));
      } else if (e.name === name) found.push(slash(relative(dir, join(d, e.name))));
    }
  };
  walk(dir);
  return found.sort();
}

function instructions(dir, unresolved) {
  const skills = isDirectory(join(dir, ".agents", "skills"))
    ? readdirSync(join(dir, ".agents", "skills")).map((s) => `.agents/skills/${s}/SKILL.md`)
    : [];
  const listed = [];
  for (const path of [...INSTRUCTIONS, ...skills].sort()) {
    const file = join(dir, path);
    if (!existsSync(file)) continue;
    if (readable(file)) listed.push(path);
    else unresolved.push({ what: "instructions", reason: `${path} exists but cannot be read as a file` });
  }
  return listed;
}

function owners(dir, unresolved) {
  const claims = [];
  for (const path of find(dir, CLAIM)) {
    try {
      const claim = JSON.parse(readFileSync(join(dir, path), "utf8"));
      if (!claim || typeof claim.owner !== "object" || claim.owner === null || !Array.isArray(claim.paths)) throw new Error("it names no owner and paths");
      claims.push({ path, owner: claim.owner, paths: claim.paths });
    } catch (e) {
      unresolved.push({ what: "owners", reason: `${path} is not a valid ownership claim: ${e.message}` });
    }
  }
  return claims;
}

function setting(dir) {
  if (engineered(dir)) return { kind: "engineered", evidence: [SOURCE] };
  if (isDirectory(join(dir, ENGINE))) return { kind: "embedded", evidence: [ENGINE] };
  return { kind: "outside", evidence: [] };
}

/** The report for `dir`, which must be a directory. */
export async function orient(dir) {
  const { repository, inFlight, unresolved } = inspect(dir);
  const listed = instructions(dir, unresolved);
  const claims = owners(dir, unresolved);
  let catalog = { status: "not applicable" };
  if (isDirectory(join(dir, ENGINE))) {
    catalog = await catalogOf(dir, join(dir, ENGINE));
    if (catalog.status === "unresolved") unresolved.push({ what: "catalog", reason: catalog.reason });
  }
  return {
    setting: setting(dir),
    repository,
    inFlight,
    instructions: listed,
    owners: claims,
    catalog,
    authority: { status: "unresolved", sources: [...listed, ...claims.map((c) => c.path)].sort(), reason: AUTHORITY },
    unresolved: unresolved.sort((a, b) => a.what.localeCompare(b.what) || a.reason.localeCompare(b.reason)),
  };
}

/** The report as text, opening with the authority line (agents/F3). */
export function render(report) {
  const list = (items) => (items.length ? items.join(", ") : "none");
  const r = report.repository;
  const lines = [
    `authority: unresolved (${AUTHORITY})`,
    `  sources: ${list(report.authority.sources)}`,
    `setting: ${report.setting.kind}${report.setting.evidence.length ? ` (${list(report.setting.evidence)})` : ""}`,
    r
      ? `repository: ${r.branch ?? "detached"} at ${r.head ?? "no commit"}${r.upstream ? `, ${r.ahead} ahead and ${r.behind} behind ${r.upstream}` : ", no upstream"}`
      : "repository: none",
    `in flight: ${report.inFlight ? list(report.inFlight) : "unresolved"}`,
    `instructions: ${list(report.instructions)}`,
    `owners: ${list(report.owners.map((o) => `${o.path} (${o.owner.name ?? "unnamed"})`))}`,
    `catalog: ${report.catalog.status}${report.catalog.status === "listed" ? ` (${report.catalog.capabilities.length} capabilities, ${report.catalog.agents.length} agents)` : ""}`,
    ...report.unresolved.map((u) => `unresolved: ${u.what}: ${u.reason}`),
  ];
  return `${lines.join("\n")}\n`;
}
