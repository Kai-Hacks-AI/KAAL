// hosting/T306 draft (hosting/C113): renderBody refusals, each with a named code.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO, chapters } from "./fixtures.mjs";

const refused = (fn, code) => assert.throws(fn, (e) => e.code === code, `expected ${code}`);

it("hosting/T306: renderBody refuses a missing, an unknown and an empty chapter, and a declaration without chapters", () => {
  const { Refactor, ...missing } = chapters;
  refused(() => hosting.renderBody(DO, missing), "MISSING_CHAPTER");
  refused(() => hosting.renderBody(DO, { ...chapters, Extra: "x" }), "UNKNOWN_CHAPTER");
  refused(() => hosting.renderBody(DO, { ...chapters, Refactor: "  \n " }), "MISSING_CHAPTER");
  refused(() => hosting.renderBody({ ...DO, chapters: [] }, {}), "INVALID_DECLARATION");
  assert.throws(() => hosting.renderBody(DO, missing), /Refactor/, "the error names the chapter");
});
