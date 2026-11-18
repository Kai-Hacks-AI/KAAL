// engineering/registration/check.mjs: verify Registration (engineering/CTL1). Detective: reads files, runs nothing, writes nothing.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const FILE = "kaal-guard.json";
const BASES = ["packages", "engineering"];
const CHANGE = /^C\d+-/;
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules").map((e) => e.name) : []);

// the places a path belongs to: the capability or area root, and the Change folder inside it, if any
export function places(path) {
  const p = path.split("/");
  if (!BASES.includes(p[0]) || p.length < 3) return [];
  const out = [p.slice(0, 2).join("/")];
  const i = p.indexOf("00-changes");
  if (i >= 2 && CHANGE.test(p[i + 1] ?? "") && p.length > i + 2) out.push(p.slice(0, i + 2).join("/"));
  return out;
}

function judge(root, place) {
  const file = `${place}/${FILE}`;
  const f = (rule) => ({ place, file, rule });
  if (!existsSync(join(root, file))) return [f("missing")];
  let json;
  try { json = JSON.parse(readFileSync(join(root, file), "utf8")); } catch { return [f("unreadable")]; }
  const checks = json?.checks;
  if (!Array.isArray(checks) || checks.length === 0) return [f("no-checks")];
  const out = [], seen = new Set();
  for (const c of checks) {
    if (typeof c?.id !== "string" || !c.id.trim()) out.push(f("check-without-id"));
    else if (seen.has(c.id)) out.push(f("duplicate-id"));
    else seen.add(c.id);
    if (typeof c?.run !== "string" || !c.run.trim()) out.push(f("check-without-run"));
  }
  return out;
}

const exists = (root, place) => existsSync(join(root, place));
// the places of a list of changed files, or of the whole repository
export function verify(root, { changed }) {
  const set = new Set(changed.flatMap(places));
  return [...set].sort().filter((p) => exists(root, p)).flatMap((p) => judge(root, p));
}
export function inventory(root) {
  const all = BASES.flatMap((b) => dirs(join(root, b)).flatMap((d) => [`${b}/${d}`, ...dirs(join(root, b, d, "00-changes")).filter((c) => CHANGE.test(c)).map((c) => `${b}/${d}/00-changes/${c}`)]));
  return all.sort().flatMap((p) => judge(root, p));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [mode, arg] = process.argv.slice(2);
  const root = process.cwd();
  const found = mode === "--all" ? inventory(root)
    : mode === "--changed" && arg ? verify(root, { changed: readFileSync(arg, "utf8").split("\n").map((s) => s.trim()).filter(Boolean) })
    : (console.error("usage: check.mjs --all | --changed <file-list>"), process.exit(2));
  for (const f of found) console.log(`fail ${f.rule} ${f.place} (${f.file})`);
  console.log(found.length ? `verify Registration: ${found.length} violation(s)` : "verify Registration: every place judged registers");
  process.exit(found.length ? 1 : 0);
}
