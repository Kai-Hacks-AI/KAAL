// Implementation tests for the re-entry guard (testing/F102–testing/F104): the verification's inlined guard is the
// shared contract of lib/reentry.mjs, so the installed verification still imports only Node's built-ins (testing/F65).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { guard, MARKER } from "kaal-testing/reentry";

const source = readFileSync(new URL("./verify.mjs", import.meta.url), "utf8");
const block = source.slice(source.indexOf("// reentry:begin"), source.indexOf("// reentry:end"));
// The block is this package's own shipped text, not external input.
const inlined = new Function(`${block}\nreturn guard;`)();

describe("the verification's inlined re-entry guard", () => {
  it("is found between its markers", () => {
    assert.ok(block.includes("function guard"), "the inlined guard is delimited in test/verify.mjs");
  });

  it("gives the same result as the shared guard for every marker value and level", () => {
    const values = [undefined, "", "0", "1", "2", "3", "10", "01", "-1", "1.5", " 1", "x", "1e3"];
    for (const value of values) {
      for (const level of [0, 1, 2, 3, 1.5, "2", undefined]) {
        const env = value === undefined ? { PATH: "/bin" } : { [MARKER]: value, PATH: "/bin" };
        assert.deepEqual(inlined(env, level), guard(env, level), `marker ${JSON.stringify(value)} at level ${JSON.stringify(level)}`);
      }
    }
    for (const env of [null, undefined, [], "x", 3]) assert.deepEqual(inlined(env, 2), guard(env, 2));
  });
});
