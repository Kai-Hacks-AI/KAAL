// Case engineering/T1022 (engineering/C17): the control is declared
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DIR, REPO } from "./helper.mjs";
export const id = "engineering/T1022";
export const tests = ["engineering/C17"];
export const title = "engineering/CTL1 verify Registration is declared as a detective control that has engineering/I1, with its Intent, Requirements F36 to F39 and Architecture A1 traceable to it";
export async function run() {
  const p = join(DIR, "04-controls", "CTL1-verify-registration", "CTL1.md");
  assert.ok(existsSync(p), `the control is not declared: ${p.replace(REPO + "/", "")}`);
  const t = readFileSync(p, "utf8");
  for (const [k, v] of [["id", "engineering/CTL1"], ["title", "verify Registration"], ["type", "detective"], ["has", "[engineering/I1]"]])
    assert.match(t, new RegExp(`^${k}: ${v.replace(/[[\]/]/g, "\\$&")}$`, "m"), `CTL1 front matter ${k}`);
  assert.match(t, /^description: .+/m, "CTL1 has a description");
  assert.match(t, /^status: (designed|implemented)$/m, "CTL1 has a status in the vocabulary");
  const i = readFileSync(join(REPO, "engineering", "registration", "00-changes", "C17-registration-control", "interface.md"), "utf8");
  for (const x of ["engineering/I1", "engineering/F36", "engineering/F37", "engineering/F38", "engineering/F39", "engineering/A1"]) assert.ok(i.includes(x), `interface.md lacks ${x}`);
}
