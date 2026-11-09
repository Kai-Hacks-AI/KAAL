// Cases for foundation/C19 PLAN B: classifyNested. Run by hand: node --test engineering/acceptance/pin-ratchet/classify.case.mjs
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyNested, compare, listNested } from "./classify.mjs";

const F = "@kaihacksai/kaal-foundation";
const base = { consumer: "kaal-core", workspace: "0.0.2" };

describe("foundation/C19 nested Foundation under a consumer", () => {
  it("an older nested Foundation is a pin-behind report and no failure", () => {
    const r = classifyNested({ ...base, nested: { [F]: "0.0.1" } });
    assert.deepEqual(r.failures, []);
    assert.equal(r.reports.length, 1);
    assert.match(r.reports[0], /pin-behind: kaal-core stays on @kaihacksai\/kaal-foundation@0\.0\.1, workspace is 0\.0\.2/);
  });
  it("a nested copy of the same version is a duplicate and fails", () => {
    const r = classifyNested({ ...base, nested: { [F]: "0.0.2" } });
    assert.equal(r.failures.length, 1);
    assert.match(r.failures[0], /duplicate/);
    assert.deepEqual(r.reports, []);
  });
  it("a nested copy newer than the workspace fails", () => {
    assert.match(classifyNested({ ...base, nested: { [F]: "0.0.3" } }).failures[0], /newer than the workspace/);
  });
  it("a nested copy below a floor Foundation declares fails", () => {
    const r = classifyNested({ ...base, floor: "0.0.2", nested: { [F]: "0.0.1" } });
    assert.match(r.failures[0], /below the floor 0\.0\.2/);
    assert.deepEqual(r.reports, []);
  });
  it("any other nested package fails, even beside an older Foundation", () => {
    const r = classifyNested({ ...base, nested: { [F]: "0.0.1", yaml: "2.9.1" } });
    assert.equal(r.failures.length, 1);
    assert.match(r.failures[0], /nests yaml@2\.9\.1/);
    assert.equal(r.reports.length, 1);
  });
  it("nothing nested is neither a report nor a failure", () => {
    assert.deepEqual(classifyNested({ ...base, nested: {} }), { failures: [], reports: [] });
  });
  it("compare orders x.y.z numerically", () => {
    assert.equal(compare("0.0.10", "0.0.2"), 1);
    assert.equal(compare("0.0.1", "0.0.2"), -1);
    assert.equal(compare("1.0.0", "1.0.0"), 0);
  });
  it("listNested reads scoped and plain packages and ignores dot entries such as .bin", () => {
    const dir = mkdtempSync(join(tmpdir(), "nested-"));
    try {
      mkdirSync(join(dir, ".bin"));
      writeFileSync(join(dir, ".bin", "kaal-foundation"), "#!/usr/bin/env node\n");
      mkdirSync(join(dir, "@kaihacksai", "kaal-foundation"), { recursive: true });
      writeFileSync(join(dir, "@kaihacksai", "kaal-foundation", "package.json"), JSON.stringify({ version: "0.0.1" }));
      mkdirSync(join(dir, "yaml"));
      writeFileSync(join(dir, "yaml", "package.json"), JSON.stringify({ version: "2.9.1" }));
      assert.deepEqual(listNested(dir), { "@kaihacksai/kaal-foundation": "0.0.1", yaml: "2.9.1" });
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it("listNested of a missing directory is empty", () => {
    assert.deepEqual(listNested(join(tmpdir(), "no-such-nested-dir-0")), {});
  });
});
