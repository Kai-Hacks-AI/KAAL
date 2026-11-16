// Shared reading for the release/C35 Cases. The stages declaration and the judge are sources under 05-src/stages/;
// they do not exist on main, so every Case is RED at the PLAN.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const SRC = fileURLToPath(new URL("../../05-src/", import.meta.url));
export const RULESETS = join(SRC, "wiring/rulesets");
// the six GitHub rulesets of set 1 that carry a check, then Publishing, which is tag based and carries none
export const NAMES = ["Integrating", "Collecting", "Hotfixing", "Wiring", "Promoting"];
export const stages = () => JSON.parse(readFileSync(join(SRC, "stages/stages.json"), "utf8"));
export const judge = () => import(new URL("../../05-src/stages/judge.mjs", import.meta.url).href);
export const source = (n) => JSON.parse(readFileSync(join(RULESETS, `${n.toLowerCase()}.json`), "utf8"));
export const ctx = (n) => `verify Stages (${n})`;
export const contexts = (r) => (r.rules.find((x) => x.type === "required_status_checks")?.parameters.required_status_checks ?? []).map((c) => c.context);
export const GOOD = () => ({ stages: stages(), rulesets: Object.fromEntries([...NAMES, "Publishing"].map((n) => [n, source(n)])), githooks: ["pre-push", "old/pre-push", "new/pre-push.d/README.md"] });
