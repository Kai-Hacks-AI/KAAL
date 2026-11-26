// hosting/T307 draft (hosting/C113): an invalid declaration is refused before anything renders.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO } from "./fixtures.mjs";

it("hosting/T307: invalid declarations are refused by renderTemplate and renderBody, with INVALID_DECLARATION", () => {
  const bad = {
    "a lower-case type": { ...DO, type: "do" },
    DEFAULT: { ...DO, type: "DEFAULT" },
    "a chapter without a name": { ...DO, chapters: [{ guidance: "x" }] },
    "a repeated chapter name": { ...DO, chapters: [DO.chapters[0], DO.chapters[0]] },
    "a field outside the format": { ...DO, colour: "red" },
    "guidance that closes a comment": { ...DO, chapters: [{ name: "Change", guidance: "x --> y" }] },
    "a file name": { ...DO, file: "do.md" },
    "comment syntax": { ...DO, comment: "<!-- -->" },
    "a recognition rule": { ...DO, recognition: [{ base: "main" }] },
    "an auto-merge method outside the set": { ...DO, raise: { ...DO.raise, autoMerge: "fast-forward" } },
    "a title rule that is not a pattern": { ...DO, raise: { ...DO.raise, title: { forbid: ["("] } } },
  };
  for (const [why, declaration] of Object.entries(bad)) {
    for (const call of [() => hosting.renderTemplate(declaration), () => hosting.renderBody(declaration, {})]) {
      assert.throws(call, (e) => e.code === "INVALID_DECLARATION", why);
    }
  }
});
