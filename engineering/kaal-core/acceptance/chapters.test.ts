import { test } from "node:test";
import assert from "node:assert/strict";
import { chapters } from "./chapters.js";

test("splits at headings, keeps text verbatim, ignores fenced code and non-headings", () => {
  const md = "intro\n# One\ntext\n```\n# not a heading\n```\n## Two\n#hashtag\nmore\n### Three";
  const got = chapters(md);
  assert.deepEqual(
    got.map((c) => [c.level, c.title]),
    [[0, ""], [1, "One"], [2, "Two"], [3, "Three"]],
  );
  assert.equal(got.map((c) => c.markdown).join(""), md);
  assert.ok(got[1].markdown.includes("# not a heading"));
  assert.ok(got[2].markdown.includes("#hashtag"));
});

test("no text means no chapters", () => {
  assert.deepEqual(chapters(""), []);
});

test("fences follow CommonMark: indented, tilde, longer closers; four spaces is not a fence", () => {
  const titles = (md: string) => chapters(md).map((c) => c.title);
  assert.deepEqual(titles("# A\n   ```\n# x\n   ```\n# B\n"), ["A", "B"]);
  assert.deepEqual(titles("# A\n~~~\n# x\n~~~\n# B\n"), ["A", "B"]);
  assert.deepEqual(titles("# A\n````\n```\n# x\n````\n# B\n"), ["A", "B"]);
  assert.deepEqual(titles("# A\n```\n# x\n~~~\n# y\n```\n# B\n"), ["A", "B"]);
  assert.deepEqual(titles("# A\n    ```\n# B\n"), ["A", "B"]);
  const unclosed = "# A\n```\n# x\n";
  assert.equal(chapters(unclosed).map((c) => c.markdown).join(""), unclosed);
});
