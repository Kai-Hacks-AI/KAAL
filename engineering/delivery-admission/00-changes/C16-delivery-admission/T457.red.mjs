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
  const ok = join(dir, "ok.json"), no = join(dir, "no.json"), bad = join(dir, "bad.json");
  writeFileSync(ok, JSON.stringify(facts("kaal/x", undefined)));
  writeFileSync(no, JSON.stringify(facts("feature/x", undefined)));
  writeFileSync(bad, "{not json");
  assert.equal(run(ok), 0);
  assert.equal(run(no), 1);
  assert.equal(run(bad), 2);
  assert.equal(run(join(dir, "missing.json")), 2);
});
