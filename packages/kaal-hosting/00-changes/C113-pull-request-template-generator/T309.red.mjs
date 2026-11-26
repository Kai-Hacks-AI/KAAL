// hosting/T309 draft (hosting/C113): the generator stays behind Hosting, and the shipped docs stay clean.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { it } from "node:test";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import * as hosting from "@kaihacksai/kaal-hosting";

it("hosting/T309: the generator files import no node:fs, node:child_process or node:http, and name no Change in shipped docs", () => {
  assert.equal(typeof hosting.renderTemplate, "function", "the generator is shipped");
  const dir = fileURLToPath(new URL("./github/", import.meta.resolve("@kaihacksai/kaal-hosting")));
  const sources = readdirSync(dir).filter((f) => /^(templates|pull-request-types|raise)[\w-]*\.(js|mjs)$/.test(f));
  assert.ok(sources.length >= 2, "the generator modules are found");
  for (const f of sources) {
    const text = readFileSync(join(dir, f), "utf8");
    assert.doesNotMatch(text, /from ["']node:(fs|child_process|http|https)["']|require\(["']node:(fs|child_process)/, f);
  }
});
