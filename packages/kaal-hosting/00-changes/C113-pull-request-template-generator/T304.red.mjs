// hosting/T304 draft (hosting/C113): determinism and line ends.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO } from "./fixtures.mjs";

it("hosting/T304: the same declaration renders the same bytes, and CRLF in the declaration comes out as LF", () => {
  assert.equal(hosting.renderTemplate(DO), hosting.renderTemplate(structuredClone(DO)));
  const crlf = structuredClone(DO);
  crlf.intro = "A DO pull request.\r\nExactly three chapters.";
  crlf.chapters[0].guidance = "One line:\r\nthe id and name.";
  const out = hosting.renderTemplate(crlf);
  assert.equal(out.includes("\r"), false);
  assert.match(out, /<!-- A DO pull request\.\nExactly three chapters\. -->/);
  assert.match(out, /<!-- One line:\nthe id and name\. -->/);
});
