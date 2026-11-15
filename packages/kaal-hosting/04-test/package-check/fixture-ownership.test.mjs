import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";
import { facts, specialEntries, SetupFailure } from "@kaihacksai/kaal-hosting/fixtures";

it("hosting/T80 [hosting/F38]: fixture setup preserves pre-existing fifo and socket paths byte for byte", async (t) => {
  const fact = (await facts())["kaal-hosting/special-entries"];
  t.diagnostic(`native special-entry support: ${fact.holds}; ${fact.reason}`);
  for (const name of ["fifo", "socket"]) {
    const root = mkdtempSync(join(tmpdir(), "hosting-fixture-owner-"));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    writeFileSync(join(root, name), "caller-owned");
    if (fact.holds) await assert.rejects(specialEntries(root), SetupFailure);
    else assert.equal((await specialEntries(root)).holds, false, "an unavailable fact is not a native setup test");
    assert.deepEqual(readdirSync(root), [name]);
    assert.equal(readFileSync(join(root, name), "utf8"), "caller-owned");
  }
});
