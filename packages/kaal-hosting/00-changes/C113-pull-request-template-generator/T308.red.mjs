// hosting/T308 draft (hosting/C113): checkTemplates compares a directory with the render.
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import * as hosting from "@kaihacksai/kaal-hosting";
import { DO, HOTFIX, SYNC } from "./fixtures.mjs";

it("hosting/T308: checkTemplates names a missing, a differing and an undeclared template, and passes when all match", async () => {
  const dir = mkdtempSync(join(tmpdir(), "hosting-c113-"));
  const put = (name, text) => writeFileSync(join(dir, name), text);
  put("do.md", hosting.renderTemplate(DO));
  put("sync.md", hosting.renderTemplate(SYNC));
  put("hotfix.md", hosting.renderTemplate(HOTFIX));
  assert.deepEqual(await hosting.checkTemplates([DO, SYNC, HOTFIX], dir), { ok: true, problems: [] });
  put("sync.md", hosting.renderTemplate(SYNC) + "extra\n");
  put("old.md", "stale");
  writeFileSync(join(dir, "hotfix.md"), "");
  const second = await hosting.checkTemplates([DO, SYNC, HOTFIX, { ...DO, type: "ACT" }], dir);
  assert.equal(second.ok, false);
  assert.deepEqual(second.problems.map((p) => `${p.file}:${p.problem}`).sort(), ["act.md:missing", "hotfix.md:differs", "old.md:undeclared", "sync.md:differs"]);
});
