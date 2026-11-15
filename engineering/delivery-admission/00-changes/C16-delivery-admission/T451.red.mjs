// Case engineering/T451 (engineering/C16): a hotfix head passes only with the four chapters, a Defect on main and its RED Case turned green
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T451 [engineering/C16]: a hotfix head passes only with the four chapters, a Defect on main and its RED Case turned green", async () => {
  const { admit } = await load();
  assert.equal(admit(facts("hotfix/fix-x", HOTFIX_OK)).kind, "pass");
  const without = (patch) => ({ hotfix: { ...HOTFIX_OK.hotfix, ...patch } });
  assert.equal(admit(facts("hotfix/fix-x", without({ chapters: ["Change", "Defect", "Approach"] }))).kind, "fail");
  assert.equal(admit(facts("hotfix/fix-x", without({ defect: "https://github.com/o/r/issues/1" }))).kind, "fail");
  assert.equal(admit(facts("hotfix/fix-x", without({ defectOnMain: false }))).kind, "fail");
  assert.equal(admit(facts("hotfix/fix-x", without({ redCase: { onMain: "T1.red.mjs", atHead: "T1.red.mjs" } }))).kind, "fail");
});
