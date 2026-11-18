// Shared by the Cases of engineering/C17. Reads files; writes only inside temporary directories.
import { existsSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
// the directory that holds check.mjs and 04-controls; the Cases of the PLAN are RED because check.mjs is absent
export const DIR = process.env.KAAL_REGISTRATION_DIR ? resolve(process.env.KAAL_REGISTRATION_DIR) : join(REPO, "engineering", "registration");
export const loadCheck = async () => {
  const p = join(DIR, "check.mjs");
  if (!existsSync(p)) throw new Error(`the registration check is absent: ${p.replace(REPO + "/", "")}`);
  return import(pathToFileURL(p).href);
};
export const reg = (...checks) => JSON.stringify({ checks });
export const one = { id: "unit", run: "node --test" };
// write { "path": "content" } under a new temporary directory and return it
export const fixture = (files) => {
  const root = mkdtempSync(join(tmpdir(), "c17-"));
  for (const [p, c] of Object.entries(files)) { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), c); }
  return root;
};
export const tree = (root, d = root) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? tree(root, join(d, e.name)) : [join(d, e.name).slice(root.length + 1) + ":" + readFileSync(join(d, e.name), "utf8")]).sort();
export const rules = (findings, place) => findings.filter((f) => f.place === place).map((f) => f.rule);
