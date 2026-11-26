// hosting/T307 draft (hosting/C113): RED on main, becomes a delivered Case in the DO. See change.md, FAR 3.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";

it("hosting/T307: checkTemplates (draft)", () => {
  assert.equal(typeof hosting.renderTemplate, "function", "Hosting renders pull request templates");
  assert.equal(typeof hosting.renderBody, "function", "Hosting renders pull request bodies");
  assert.equal(typeof hosting.checkTemplates, "function", "Hosting checks committed templates");
});
