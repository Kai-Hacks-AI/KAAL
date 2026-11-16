// Case release/T512 (release/C37): .githooks is judged by Developing alone, never by a neighbour
import assert from "node:assert/strict";
import { judge, GOOD, NAMES, ctx } from "./helper.mjs";

export const id = "release/T512";
export const tests = ["release/C37"];
export const title = "a broken .githooks tree fails verify Stages (Developing) alone: Integrating, Collecting, Hotfixing, Wiring and Promoting stay green";
export async function run() {
  const { judge: j } = await judge();
  const f = GOOD(); f.hooks.files["pre-push"].sha256 = "0".repeat(64);
  const r = j(f);
  assert.deepEqual(r.checks, [ctx("Developing")]);
  for (const n of NAMES) assert.ok(!r.findings.some((x) => x.check === ctx(n)), `${n} does not judge .githooks`);
  const g = GOOD(); delete g.hooks;
  assert.ok(!j(g).findings.some((x) => NAMES.map(ctx).includes(x.check)), "without hooks facts only Developing fails");
}
