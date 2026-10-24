// core/C6 Code tests for kaal-core/frontmatter, beside the planned outer tests in test/plan/.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validate } from "kaal-core/frontmatter";

const TYPES = { "Sample/Record": { keys: { file: { value: "path" as const } } } };
const verdict = (file: string) => validate(Buffer.from(`---\ntype: Sample/Record\nfile: "${file}"\n---\n`), TYPES).verdict;

describe("kaal-core/frontmatter paths", () => {
  it("refuses a path that is absolute on any supported host", () => {
    for (const file of ["/a.md", "C:/outside.md", "c:outside.md", "a\\\\b.md", "//server/share.md"]) assert.equal(verdict(file), "invalid", file);
    assert.equal(verdict("docs/a.md"), "valid");
  });
});
