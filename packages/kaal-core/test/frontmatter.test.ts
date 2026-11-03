// core/C6 Code tests for kaal-core/frontmatter, beside the planned outer tests in test/plan/.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validate } from "kaal-core/frontmatter";

const TYPES = { "Sample/Record": { keys: { file: { value: "path" as const }, target: { value: "ref" as const } } } };
const verdict = (file: string) => validate(Buffer.from(`---\ntype: Sample/Record\nfile: "${file}"\n---\n`), TYPES).verdict;

describe("kaal-core/frontmatter paths", () => {
  it("refuses a path that is absolute on any supported host", () => {
    for (const file of ["/a.md", "C:/outside.md", "c:outside.md", "a\\\\b.md", "//server/share.md"]) assert.equal(verdict(file), "invalid", file);
    assert.equal(verdict("docs/a.md"), "valid");
  });
});

describe("kaal-core/frontmatter references", () => {
  const ID = "a".repeat(64);
  const target = (fields: string) => validate(Buffer.from(`---\ntype: Sample/Record\ntarget: { ${fields} }\n---\n`), TYPES).verdict;

  it("accepts a reference of exactly name and id, and refuses any other field", () => {
    assert.equal(target(`name: Graph, id: "${ID}"`), "valid");
    for (const fields of [`name: Graph, ident: "${ID}"`, `nam: Graph, id: "${ID}"`, `name: Graph, id: "${ID}", note: x`, `name: Graph`]) assert.equal(target(fields), "invalid", fields);
  });
});
