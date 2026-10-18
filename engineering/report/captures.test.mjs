import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { passes } from "../lanes/evidence.mjs";
import { fromCaptures } from "./captures.mjs";

const AT = "a".repeat(40);
const LINUX = { commit: AT, platform: "linux", arch: "x64", node: "v24.0.0" };
const result = (workspace, extra = {}) => ({ workspace, tests: "pass", delivered: [`${workspace}/x.js`], lines: 100, branches: 100, functions: 100, unexecuted: [], files: [], ...extra });
const capture = (workspace, r, provenance = LINUX) => Buffer.from(JSON.stringify({ workspace, provenance, result: r }));

describe("reading captured evidence", () => {
  it("uses a capture taken at this commit, with its provenance", () => {
    const { coverage, captured } = fromCaptures({ "w/capture.json": capture("w", result("w")) }, ["w"], AT);
    assert.deepEqual(coverage, [result("w")]);
    assert.deepEqual(captured, [{ workspace: "w", ...LINUX }]);
  });

  it("reports a workspace with no capture as unknown, and keeps the rest", () => {
    const { coverage, captured } = fromCaptures({ "w/capture.json": capture("w", result("w")) }, ["w", "v"], AT);
    assert.deepEqual(coverage, [{ workspace: "v", unknown: "v: no evidence was captured for this run" }, result("w")]);
    assert.deepEqual(captured.map((c) => c.workspace), ["w"]);
  });

  it("does not take a capture of another commit as evidence for this one", () => {
    const stale = { ...LINUX, commit: "b".repeat(40) };
    const { coverage, captured } = fromCaptures({ "w/capture.json": capture("w", result("w"), stale) }, ["w"], AT);
    assert.deepEqual(coverage, [{ workspace: "w", unknown: `w: its capture was taken at ${"b".repeat(40)}, not at ${AT}` }]);
    assert.deepEqual(captured, []);
  });

  it("takes nothing as evidence when this tree's commit is unknown", () => {
    const { coverage } = fromCaptures({ "w/capture.json": capture("w", result("w")) }, ["w"], undefined);
    assert.deepEqual(coverage, [{ workspace: "w", unknown: `w: its capture was taken at ${AT}, not at an unknown commit` }]);
  });

  it("keeps a failed measurement failed, and refuses a capture that is not JSON or describes another workspace", () => {
    const failed = { workspace: "w", failed: "w: the coverage driver gave no result (exited 1)" };
    const files = { "w/capture.json": capture("w", failed), "v/capture.json": Buffer.from("{"), "u/capture.json": capture("u", result("x")) };
    const { coverage } = fromCaptures(files, ["w", "v", "u"], AT);
    assert.deepEqual(coverage[0], { workspace: "u", failed: "u: its capture describes another workspace" });
    assert.match(coverage[1].failed, /^v: its capture is not JSON/);
    assert.deepEqual(coverage[2], failed);
  });
});

describe("the lane's gate with evidence", () => {
  it("passes only on tests that ran and passed: not on failing tests, not on a status nobody observed", () => {
    assert.equal(passes(result("w")), true);
    assert.equal(passes(result("w", { failed: "w: no coverage summary was produced" })), true);
    assert.equal(passes(result("w", { tests: "fail" })), false);
    assert.equal(passes({ workspace: "w", failed: "w: the coverage driver gave no result (exited 1)" }), false);
    assert.equal(passes(undefined), false);
  });
});
