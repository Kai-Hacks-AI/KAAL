// Case engineering/T454 (engineering/C16): a title, label or body cannot select the class; the head ref alone does
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, facts, base, HOTFIX_OK, WIRE_OK } from "./helper.mjs";

test("engineering/T454 [engineering/C16]: a title, label or body cannot select the class; the head ref alone does", async () => {
  const { admit } = await load();
  const lying = { title: "hotfix: urgent", labels: ["hotfix", "wire"], body: "## Defect" };
  assert.equal(admit({ ...facts("feature/x", HOTFIX_OK), ...lying }).kind, "fail");
  const v = admit({ ...facts("kaal/x", WIRE_OK), ...lying });
  assert.equal(v.class, "kaal");
});
