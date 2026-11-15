// Case engineering/T457 (engineering/C16): the CLI reads a facts file and exits per verdict; an unreadable file is exit 2.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MODULE, facts } from "./helper.mjs";

test("engineering/T457 [engineering/C16]: the CLI reads a facts file and exits per verdict; an unreadable file is exit 2", () => {
  const cli = fileURLToPath(MODULE);
  const dir = mkdtempSync(join(tmpdir(), "c16-"));
  const run = (file) => spawnSync(process.execPath, [cli, "--facts", file], { encoding: "utf8" }).status;
  const write = (name, body) => { const f = join(dir, name); writeFileSync(f, body); return f; };
  assert.equal(run(write("pass.json", JSON.stringify(facts("hotfix/x", "hotfix")))), 0);
  assert.equal(run(write("fail.json", JSON.stringify(facts("feature/x", "hotfix")))), 1);
  assert.equal(run(write("na.json", JSON.stringify(facts("hotfix/x", "hotfix", { baseRef: "kaal/a/b" })))), 3);
  assert.equal(run(write("unknown.json", JSON.stringify(facts("hotfix/x", undefined)))), 2);
  assert.equal(run(write("bad.json", "{not json")), 2);
  assert.equal(run(join(dir, "missing.json")), 2);
});
