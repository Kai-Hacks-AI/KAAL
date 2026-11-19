// hosting/C111 Case: the command, delivered Case (needs the built package).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { it } from "node:test";
import { PACKAGE } from "./harness.mjs";
it("hosting/T294: the command kaal-hosting-pulls is built into dist and declared as a bin of the package", async () => {
  const cli = join(PACKAGE, "dist/skills/kaal-hosting/scripts/github/pull-requests-cli.mjs");
  assert.ok(existsSync(cli), "the command pull-requests-cli.mjs is not built into dist");
  const bins = JSON.parse(readFileSync(join(PACKAGE, "package.json"), "utf8")).bin ?? {};
  assert.ok("kaal-hosting-pulls" in bins, "kaal-hosting-pulls is not a declared bin");
});
