// Case engineering/T387 (engineering/C22): the report is what it was; only how the base is read changes.
import assert from "node:assert/strict";
import { scratch } from "./helper.mjs";

export const id = "engineering/T387";
export const tests = ["engineering/C22"];
export const title = "the report over a base with Markdown, a non-Markdown file and a nested folder is unchanged, exit status 0";
export async function run() {
  const r = scratch();
  try {
    r.write("README.md", "# readme\n");
    r.write("a/b/Note.md", "# note\n");
    r.write("a/data.bin", "\u0000\u0001not markdown\n");
    r.commit();
    const out = r.check(["--base", "main", "kaal/core/x", "kaal/learning"]);
    assert.equal(out.status, 0, out.stderr);
    const lines = out.stdout.trim().split("\n");
    assert.deepEqual(lines, [
      "base main: 0 registered scope(s), 0 admitted Capability Node(s)",
      "UNKNOWN kaal/core/x: no Registration evidence from main",
      "FAIL kaal/learning: outside the form kaal/<capability>/<name>: a flat or legacy branch",
      "2 migration finding(s); report-only, exit status 0",
    ]);
  } finally {
    r.cleanup();
  }
}
