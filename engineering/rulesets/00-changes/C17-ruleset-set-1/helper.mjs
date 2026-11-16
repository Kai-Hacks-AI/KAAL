// Shared reading for the engineering/C17 Cases: set 1 is engineering/rulesets/set-1/*.json and engineering/rulesets/controls.md.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url)); // engineering/rulesets/
export const NAMES = ["promotion", "integration", "hotfixing", "wiring", "publishing"];
export const set1 = () => Object.fromEntries(NAMES.map((n) => [n, JSON.parse(readFileSync(join(ROOT, "set-1", `${n}.json`), "utf8"))]));
export const controls = () => readFileSync(join(ROOT, "controls.md"), "utf8");
export const baseline = () => JSON.parse(readFileSync(new URL("./baseline-old.json", import.meta.url), "utf8")).rulesets;
export const rule = (r, type) => r.rules.find((x) => x.type === type);
export const contexts = (r) => (rule(r, "required_status_checks")?.parameters.required_status_checks ?? []).map((c) => c.context);
export const GUARD = ["Guard", "Guard (macOS)", "Guard (Windows)"];
export const have = (p) => existsSync(join(ROOT, p));
export const listed = () => (existsSync(join(ROOT, "set-1")) ? readdirSync(join(ROOT, "set-1")).sort() : []);
