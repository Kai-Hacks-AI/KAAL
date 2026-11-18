// Shared reading for the release/C35 Cases. The stages declaration and the judge are sources under 05-src/stages/;
// they do not exist on main, so every Case is RED at the PLAN.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const SRC = fileURLToPath(new URL("../../05-src/", import.meta.url));
export const RULESETS = join(SRC, "wiring/rulesets");
// the five branch rulesets of set 1 (Integrating also requires Developing, release/C37); Publishing is tag based and carries no check
export const NAMES = ["Integrating", "Collecting", "Hotfixing", "Wiring", "Promoting"];
export const stages = () => JSON.parse(readFileSync(join(SRC, "stages/stages.json"), "utf8"));
export const judge = () => import(new URL("../../05-src/stages/judge.mjs", import.meta.url).href);
export const source = (n) => JSON.parse(readFileSync(join(RULESETS, `${n.toLowerCase()}.json`), "utf8"));
export const ctx = (n) => `verify Stages (${n})`;
export const contexts = (r) => (r.rules.find((x) => x.type === "required_status_checks")?.parameters.required_status_checks ?? []).map((c) => c.context);
// the Developing facts are the agreed .githooks tree as the declaration states it (release/C37 judges the real tree)
const hooks = () => {
  const files = {}, sources = {};
  for (const d of stages().stages.find((s) => s.name === "Developing").files) {
    if (d.source) sources[d.source] = "s".repeat(1) + d.source;
    files[d.path] = { sha256: d.sha256 ?? sources[d.source] ?? "0", mode: d.mode };
  }
  return { files, sources };
};
// the controls the declaration traces to, as the judge reads them (id and the Intents it answers): release/CTL1 (verify Stages), release/CTL5 (gate analyze Vulnerabilities) and release/CTL10 (approve Integration, release/C66)
export const CONTROLS = [{ id: "release/CTL1", has: ["release/I27"] }, { id: "release/CTL5", has: ["release/I30"] }, { id: "release/CTL10", has: ["release/I36"] }];
export const GOOD = () => ({ stages: stages(), rulesets: Object.fromEntries([...NAMES, "Publishing"].map((n) => [n, source(n)])), hooks: hooks(), controls: CONTROLS.map((c) => ({ ...c, has: [...c.has] })) });
