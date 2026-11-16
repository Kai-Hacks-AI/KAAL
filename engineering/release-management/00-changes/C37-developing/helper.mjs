// Shared reading for the release/C37 Cases. The Developing judgement, the local script and the second Integrating check are
// sources of this Change; they do not exist on main, so every Case is RED at the PLAN.
import { readFileSync, readdirSync, statSync, mkdtempSync, cpSync, rmSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";

export const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
export const SRC = join(ROOT, "engineering/release-management/05-src");
export const RULESETS = join(SRC, "wiring/rulesets");
export const NAMES = ["Integrating", "Collecting", "Hotfixing", "Wiring", "Promoting"];
export const stages = () => JSON.parse(readFileSync(join(SRC, "stages/stages.json"), "utf8"));
export const judge = () => import(new URL("../../05-src/stages/judge.mjs", import.meta.url).href);
export const source = (n) => JSON.parse(readFileSync(join(RULESETS, `${n.toLowerCase()}.json`), "utf8"));
export const ctx = (n) => `verify Stages (${n})`;
export const contexts = (r) => (r.rules.find((x) => x.type === "required_status_checks")?.parameters.required_status_checks ?? []).map((c) => c.context);
export const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

// the facts the Developing job reads from a checkout: every file under .githooks with its sha256 and mode,
// and the sha256 of every source the declaration names
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
export function hooksFacts(root = ROOT) {
  const base = join(root, ".githooks");
  const files = {};
  for (const f of walk(base)) files[relative(base, f).split("\\").join("/")] = { sha256: sha(f), mode: (statSync(f).mode & 0o777).toString(8) };
  const sources = {};
  for (const d of stages().stages.find((s) => s.name === "Developing").files ?? []) {
    if (d.source) sources[d.source] = sha(join(root, "engineering/release-management/05-src", d.source));
  }
  return { files, sources };
}
export const GOOD = () => ({
  stages: stages(),
  rulesets: Object.fromEntries([...NAMES, "Publishing"].map((n) => [n, source(n)])),
  hooks: hooksFacts(),
});

// a copy of the parts of the repository the local script and the CLI read, for Cases that change a file
export function tmpTree(change = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "c37-"));
  cpSync(join(ROOT, ".githooks"), join(dir, ".githooks"), { recursive: true });
  cpSync(SRC, join(dir, "engineering/release-management/05-src"), { recursive: true });
  change(dir);
  return { dir, done: () => rmSync(dir, { recursive: true, force: true }) };
}
export const edit = (dir, rel, text, mode) => { const f = join(dir, rel); writeFileSync(f, text); if (mode) chmodSync(f, mode); };
export const exists = (p) => existsSync(p);
