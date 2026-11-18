// Case release/T919 (release/C71): the model is truthful about where it comes from
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { model, section, rows, backticked, RM, REPO } from "./helper.mjs";

export const id = "release/T919";
export const tests = ["release/C71"];
export const title = "every repository path the model cites for an object or a relationship exists, and a proposed row cites no file as if it existed";
export async function run() {
  const text = model();
  const exists = (p) => existsSync(join(REPO, p)) || existsSync(join(RM, p));
  let checked = 0;
  for (const sec of ["Objects", "Relationships"]) for (const cells of rows(section(text, sec))) {
    const status = cells.find((c) => ["normative", "observed", "proposed"].includes(c));
    for (const c of cells) for (const p of backticked(c)) {
      if (!p.includes("/") || !/\.(md|mjs|json|yml)$|\/$/.test(p) || p.includes("<")) continue;
      if (status === "proposed") assert.fail(`a proposed row cites ${p} as if it existed`);
      assert.ok(exists(p), `${cells[0]}: the cited path ${p} does not exist`);
      checked++;
    }
  }
  assert.ok(checked >= 10, `${checked} cited paths were checked, the model cites at least 10`);
}
