// Case release/T511 (release/C37): the Developing judgement passes the agreed .githooks tree and fails every departure
import assert from "node:assert/strict";
import { judge, GOOD, ctx } from "./helper.mjs";

export const id = "release/T511";
export const tests = ["release/C37"];
export const title = "the judge passes the agreed .githooks tree and fails each departure under verify Stages (Developing): a missing or changed dispatcher, an altered legacy hook, an extra file, a hook that is not executable, a missing or changed local script, and unreadable facts";
export async function run() {
  const { judge: j } = await judge();
  const out = j(GOOD());
  assert.equal(out.kind, "pass");
  const fails = (mutate, why) => {
    const f = GOOD(); mutate(f.hooks);
    const r = j(f);
    assert.equal(r.kind, "fail", why);
    assert.deepEqual(r.checks, [ctx("Developing")], `${why}: only the Developing job fails`);
  };
  fails((h) => { delete h.files["pre-push"]; }, "a missing dispatcher");
  fails((h) => { h.files["pre-push"].sha256 = "0".repeat(64); }, "a changed dispatcher");
  fails((h) => { h.files["old/pre-push"].sha256 = "0".repeat(64); }, "an altered legacy hook");
  fails((h) => { h.files["new/pre-push.d/other"] = { sha256: "1".repeat(64), mode: "755" }; }, "an extra file under .githooks");
  fails((h) => { h.files["pre-push"].mode = "644"; }, "a hook that is not executable");
  fails((h) => { delete h.files["new/pre-push.d/verify-stages-developing"]; }, "a missing local script");
  fails((h) => { h.files["new/pre-push.d/verify-stages-developing"].sha256 = "2".repeat(64); }, "a local script that differs from its source");
  const none = GOOD(); delete none.hooks;
  assert.equal(j(none).kind, "fail", "unreadable facts fail closed");
}
