// Case release/T918 (release/C71): the mismatches between the model and the repository are recorded, and each is still true
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { model, section, rows, walk, frontmatter, backticked, RM, REPO } from "./helper.mjs";

export const id = "release/T918";
export const tests = ["release/C71"];
export const title = "the Mismatches section records each difference between the model and the repository with a citable path that exists, and each recorded fact holds in the repository today, so a mismatch is recorded and not silently corrected";
const text = (p) => readFileSync(join(REPO, p), "utf8");
const FACTS = {
  M1: () => /^implements:/m.test(text("engineering/release-management/00-changes/C65-sync-split/C65.md")) && !/^delivers:/m.test(text("engineering/release-management/00-changes/C65-sync-split/C65.md")),
  M2: () => /^serves:/m.test(text("engineering/release-management/02-requirements/F22-wire-operation/F22.md")) && /^addresses:/m.test(text("engineering/release-management/03-architecture/A47-wire-install/A47.md")),
  M3: () => walk(join(RM, "03-architecture")).filter((f) => f.endsWith(".md")).every((f) => !(frontmatter(readFileSync(f, "utf8")).addresses ?? []).some((a) => /\/D\d+$/.test(a))),
  M4: () => walk(join(RM, "02-requirements")).filter((f) => f.endsWith(".md")).every((f) => !(frontmatter(readFileSync(f, "utf8")).serves ?? []).includes("release/I35")) && /^has: \[.*release\/I35/m.test(text("engineering/release-management/04-controls/CTL7-verify-sync/CTL7.md")),
  M5: () => !existsSync(join(RM, "00-changes/C37-developing/C37.md")) && existsSync(join(RM, "00-changes/C37-developing/change.md")),
  M6: () => !/I35/.test(JSON.parse(text("engineering/release-management/00-changes/C71-metamodel/sample-c65.json")).prs.map((p) => p.changeLine).join("\n")),
  M7: () => !readdirSync(join(REPO, ".github/PULL_REQUEST_TEMPLATE")).some((f) => /wire/i.test(f)),
  M9: () => walk(join(RM, "04-controls")).filter((f) => f.endsWith(".md") && /^id: release\/CTL/m.test(readFileSync(f, "utf8"))).every((f) => { const k = Object.keys(frontmatter(readFileSync(f, "utf8"))); return k.includes("has") && !k.includes("addresses") && !k.includes("source"); }) && walk(join(RM, "03-architecture")).filter((f) => f.endsWith(".md")).every((f) => !/CTL\d+/.test(readFileSync(f, "utf8"))),
  M10: () => /a pull request is one realization of a Change/.test(text("packages/kaal-change/capability/Change-Definition.md")),
  M8: () => /^closes: \[release\/G\d+\]/m.test(text("engineering/release-management/00-changes/C65-sync-split/C65.md")) && !/^closes:.*\/D\d+/m.test(text("engineering/release-management/00-changes/C65-sync-split/C65.md")),
};
export async function run() {
  const rs = rows(section(model(), "Mismatches"));
  assert.ok(rs.length >= 10, `${rs.length} mismatches are recorded, the model records 10`);
  for (const [n, says, shows, evidence] of rs) {
    assert.ok(says && shows && evidence, `${n}: a cell is empty`);
    const path = backticked(evidence).find((p) => p.includes("/"));
    assert.ok(path && existsSync(join(REPO, path)), `${n}: the evidence path ${path} does not exist`);
    assert.ok(FACTS[n], `${n}: no fact is checked for this mismatch`);
    assert.ok(FACTS[n](), `${n}: the recorded fact no longer holds in the repository; update the record, do not correct silently`);
  }
}
