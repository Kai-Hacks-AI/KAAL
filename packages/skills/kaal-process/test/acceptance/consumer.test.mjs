// Acceptance: the packed kaal-process, installed into a fresh host outside this
// repository, runs its shipped smoke test there through npm alone.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { execute } from "kaal-hosting";
import { install } from "kaal-testing/acceptance";

/** Runs the installed smoke test as a consumer would, outside this test runner's own reporting. */
function verify(host) {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  return execute("npm", ["explore", "kaal-process", "--", "npm", "run", "verify"], { cwd: host, env });
}

describe("a fresh consumer of kaal-process", () => {
  it("verifies the installed package with kaal-core and no source checkout", async () => {
    const host = await install(["kaal-process", "kaal-core", "kaal-graph", "kaal-hosting"]);
    const r = await verify(host);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.match(r.stdout, /^(?:ℹ|#) pass 5$/m);
    assert.match(r.stdout, /^(?:ℹ|#) fail 0$/m);
  });

  it("cannot verify without kaal-core, and says so", async () => {
    const host = await install(["kaal-process"]);
    const r = await verify(host);
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /cannot verify: kaal-core is not installed beside kaal-process/);
  });
});
