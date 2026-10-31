// kaal-packaging's Embedded Test Cases (packaging/F15, testing/F76). They ship, and the installed
// `npm test` runs them against the installed copy, through the package's own specifiers, as a
// consumer would import it. Each decides from what the functions return, never from a file
// existing (packaging/N9). Each names the Requirements it tests: the shipped Testing model is built
// from these `tests` lists.
import assert from "node:assert/strict";
import { attribute, compare, read, report, write } from "kaal-packaging";
import { platforms, resultLine } from "kaal-packaging/conformance";

const SHA = "a".repeat(64);
/** A measurement as measure returns one, written out by hand. */
const measurement = (files, { version = "1.0.0", packed = 100 } = {}) => ({
  package: { ecosystem: "npm", name: "fixture", version, sha256: SHA },
  tool: { name: "npm", version: "11.18.0" },
  packed,
  unpacked: files.reduce((n, [, size]) => n + size, 0),
  files: files.map(([path, size]) => ({ path, size })).sort((a, b) => (a.path < b.path ? -1 : 1)),
});
const BASE = measurement([["lib/a.mjs", 40], ["lib/sub/b.mjs", 25], ["docs/x.md", 7], ["package.json", 30]]);

export const cases = [
  {
    id: "packaging/T2",
    tests: ["packaging/F2"],
    run() {
      const a = attribute(BASE, ["lib/", "lib/sub/", "docs/"]);
      const by = Object.fromEntries(a.groups.map((g) => [g.group, g]));
      assert.deepEqual([by["lib/"].bytes, by["lib/sub/"].bytes, by["docs/"].bytes, a.unattributed.bytes], [40, 25, 7, 30], "each file falls in its longest matching group");
      assert.equal(a.groups.reduce((n, g) => n + g.bytes, a.unattributed.bytes), BASE.unpacked, "the groups and unattributed sum to the unpacked size");
    },
  },
  {
    id: "packaging/T3",
    tests: ["packaging/F3"],
    run() {
      const after = measurement([["lib/a.mjs", 45], ["lib/sub/b.mjs", 25], ["lib/c.mjs", 3], ["package.json", 30]], { version: "1.0.1", packed: 104 });
      const c = compare(BASE, after, ["lib/"]);
      assert.deepEqual(c.packed, { before: 100, after: 104, delta: 4 });
      assert.deepEqual(c.added, ["lib/c.mjs"]);
      assert.deepEqual(c.removed, ["docs/x.md"]);
      assert.deepEqual(c.paths.map((p) => [p.path, p.delta]), [["docs/x.md", -7], ["lib/a.mjs", 5], ["lib/c.mjs", 3]]);
      assert.deepEqual(c.groups.map((g) => [g.group, g.delta]), [["lib/", 8], [null, -7]]);
    },
  },
  {
    id: "packaging/T4",
    tests: ["packaging/F4"],
    run() {
      const back = read(write(BASE));
      assert.deepEqual(back, BASE, "a record read back is the measurement written");
      assert.equal(back.package.sha256, SHA);
      assert.deepEqual(back.tool, { name: "npm", version: "11.18.0" });
      for (const bad of ["{}", JSON.stringify({ ...BASE, tool: undefined }), JSON.stringify({ ...BASE, package: { ...BASE.package, sha256: "x" } })]) {
        assert.throws(() => read(bad), /not a Packaging measurement record/);
      }
    },
  },
  {
    id: "packaging/T5",
    tests: ["packaging/F5", "packaging/N2"],
    run() {
      const after = measurement([["lib/a.mjs", 400]], { packed: 900 });
      for (const subject of [BASE, compare(BASE, after, ["lib/"])]) {
        for (const format of ["text", "json"]) {
          const out = report(subject, { format });
          assert.ok(out.length > 0);
          assert.doesNotMatch(out, /\b(pass|fail|budget|threshold|limit)\b/i, `a ${format} report judges nothing`);
        }
      }
      assert.match(report(BASE), /packed 100 bytes, unpacked 102 bytes, 4 files/);
      assert.throws(() => report(BASE, { format: "html" }), /text or json/);
    },
  },
  {
    id: "packaging/T18",
    tests: ["packaging/F10"],
    run() {
      const line = resultLine(`2 passed\nfixture-verification ${JSON.stringify({ result: "failed", exit: 1, causes: ["one failed"] })}\n`);
      assert.deepEqual([line.result, line.exit, line.causes], ["failed", 1, ["one failed"]]);
      assert.deepEqual([resultLine("unknown: no model").result, resultLine("unknown: no model").causes], ["unknown", ["no model"]]);
      assert.match(resultLine("").error, /printed nothing/);
      assert.match(resultLine("done").error, /not a result/);
      assert.match(resultLine(`x ${JSON.stringify({ result: "passed" })}`).error, /not a result/);
    },
  },
  {
    id: "packaging/T20",
    tests: ["packaging/F12"],
    run() {
      const pkg = { name: "fixture", engines: { node: ">=24" } };
      const boundary = (name) => name === "@kaihacksai/kaal-hosting";
      assert.equal(platforms(pkg, { osBoundary: boundary }).result, "verified");
      assert.equal(platforms({ name: "fixture" }, { osBoundary: boundary }).result, "failed");
      assert.equal(platforms({ ...pkg, os: ["linux"] }, { osBoundary: boundary }).result, "failed");
      assert.equal(platforms({ ...pkg, name: "@kaihacksai/kaal-hosting", os: ["linux"] }, { osBoundary: boundary }).result, "verified");
      assert.equal(platforms({ ...pkg, cpu: ["x64"] }, { osBoundary: undefined }).result, "unknown");
    },
  },
];
