// Shared reading for the release/C37 Cases.
import { readFileSync, mkdtempSync, cpSync, rmSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
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

// the facts of the agreed .githooks tree, built from the declaration and the sources it names (the real tree equals it once
// the local script is installed by the WIRE of this Change; the Cases that read a real tree install the script first)
export function hooksFacts() {
  const dev = stages().stages.find((s) => s.name === "Developing");
  const files = {}, sources = {};
  for (const d of dev.files) {
    if (d.source) sources[d.source] = sha(join(SRC, d.source));
    files[d.path] = { sha256: d.sha256 ?? sources[d.source] ?? sha(join(ROOT, ".githooks", d.path)), mode: d.mode };
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
  const script = "new/pre-push.d/verify-stages-developing"; // installed by the WIRE of this Change; present here so the tree is the agreed one
  if (!existsSync(join(dir, ".githooks", script))) cpSync(join(SRC, "wiring/hooks/verify-stages-developing"), join(dir, ".githooks", script));
  chmodSync(join(dir, ".githooks", script), 0o755);
  change(dir);
  return { dir, done: () => rmSync(dir, { recursive: true, force: true }) };
}
export const edit = (dir, rel, text, mode) => { const f = join(dir, rel); writeFileSync(f, text); if (mode) chmodSync(f, mode); };
export const exists = (p) => existsSync(p);
