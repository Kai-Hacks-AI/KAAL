// Case engineering/T389 (engineering/C22): the accepted regression. A base holding a symbolic link is refused, visibly,
// where the check used to step over it without a word.
import assert from "node:assert/strict";
import { scratch } from "./helper.mjs";

export const id = "engineering/T389";
export const tests = ["engineering/C22"];
export const title = "a base holding a symbolic link stops the check with status 1, naming the link";
export async function run() {
  const r = scratch();
  try {
    r.write("README.md", "# readme\n");
    r.commit();
    const blob = r.git("hash-object", "-w", "README.md");
    r.git("update-index", "--add", "--cacheinfo", `120000,${blob},link`);
    r.git("commit", "-q", "-m", "a link");
    const out = r.check(["--base", "main"]);
    assert.equal(out.status, 1, out.stdout);
    assert.match(out.stderr, /^collector-capability: cannot read main \(.*link/);
    assert.equal(out.stdout, "");
  } finally {
    r.cleanup();
  }
}
