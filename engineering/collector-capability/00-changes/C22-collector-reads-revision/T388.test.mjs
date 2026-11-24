// Case engineering/T388 (engineering/C22): a base that cannot be read still stops the check with status 1 and the same message.
import assert from "node:assert/strict";
import { scratch } from "./helper.mjs";

export const id = "engineering/T388";
export const tests = ["engineering/C22"];
export const title = "a base that names no commit stops the check with status 1 and `collector-capability: cannot list <base>`";
export async function run() {
  const r = scratch();
  try {
    r.write("README.md", "# readme\n");
    r.commit();
    const out = r.check(["--base", "no-such-base"]);
    assert.equal(out.status, 1);
    assert.match(out.stderr, /^collector-capability: cannot list no-such-base \(/);
    assert.equal(out.stdout, "");
  } finally {
    r.cleanup();
  }
}
