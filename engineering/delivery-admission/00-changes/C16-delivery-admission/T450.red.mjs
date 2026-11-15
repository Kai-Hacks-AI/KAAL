// Case engineering/T450 (engineering/C16): a kaal/** head is admitted as before, class kaal, with no extra evidence
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T450 [engineering/C16]: a kaal/** head is admitted as before, class kaal, with no extra evidence", async () => {
  const { admit } = await load();
  for (const ref of ["kaal/foundation/0.0.2", "kaal/engineering/delivery-admission", "kaal/old/engineering"]) {
    const v = admit(facts(ref, undefined));
    assert.equal(v.kind, "pass", ref);
    assert.equal(v.class, "kaal", ref);
  }
});
