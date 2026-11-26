// hosting/T303 draft (hosting/C113): RED on main, a delivered Case after the DO. renderTemplate gives exact bytes.
import assert from "node:assert/strict";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO } from "./fixtures.mjs";

it("hosting/T303: renderTemplate gives the declared type, intro and chapters as exact bytes", () => {
  const withIntro = [
    "<!-- KAAL-PR-template: DO -->", "", "<!-- A DO pull request. Exactly three chapters. -->", "",
    "## Change", "", "<!-- One line: the id and name. -->", "",
    "## Implement", "", "<!-- What this DO delivers. -->", "",
    "## Refactor", "", "<!-- What improves while behaviour stays. -->", "",
  ].join("\n");
  assert.equal(hosting.renderTemplate(DO), withIntro);
  const { intro, ...noIntro } = DO;
  assert.equal(hosting.renderTemplate(noIntro), withIntro.replace("<!-- A DO pull request. Exactly three chapters. -->\n\n", ""));
  assert.equal(withIntro.endsWith("-->\n"), true, "one line end after the last chapter");
});
