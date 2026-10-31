// Implementation tests for test/run.mjs, kaal-testing's `npm test` in the source workspace (testing/F62): its
// suites aggregate in Testing's three results, never collapsing unknown into failed, and a place or result it
// cannot read is unknown. Each runs a copy of the entry in a throwaway source-like workspace whose suites end as
// the test says, with Hosting resolved from this workspace.
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const PACKAGE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOSTING = dirname(createRequire(join(PACKAGE, "package.json")).resolve("kaal-hosting/package.json"));
const exits = (code) => `node -e "process.exit(${code})"`;

/** Runs a copy of test/run.mjs in a source-like workspace with `scripts`, or with `packageJson` written verbatim. */
async function runWith({ scripts, packageJson, args = [] }) {
  const root = mkdtempSync(join(tmpdir(), "kaal-testing-run-"));
  try {
    mkdirSync(join(root, "test", "plan"), { recursive: true });
    mkdirSync(join(root, "plan"));
    mkdirSync(join(root, "node_modules"));
    symlinkSync(HOSTING, join(root, "node_modules", "kaal-hosting"), "junction");
    cpSync(join(PACKAGE, "test", "run.mjs"), join(root, "test", "run.mjs"));
    if (packageJson !== undefined) writeFileSync(join(root, "package.json"), packageJson);
    else if (scripts) writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture", private: true, scripts }));
    const r = await execute("node", [join(root, "test", "run.mjs"), ...args], { cwd: root });
    return { status: r.status, out: `${r.stdout}${r.stderr}` };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("kaal-testing's npm test in the source workspace", () => {
  it("is verified only when every declared suite verifies", async () => {
    const r = await runWith({ scripts: { "test:publisher": exits(0), "test:consumer": exits(0) } });
    assert.equal(r.status, 0, r.out);
  });

  it("is failed when a suite established a failure, even beside one that could not verify", async () => {
    const r = await runWith({ scripts: { "test:publisher": exits(2), "test:other": exits(1), "test:consumer": exits(0) } });
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /suite test:other: failed/);
  });

  it("is unknown, never failed, when a suite could not verify and none failed", async () => {
    const r = await runWith({ scripts: { "test:publisher": exits(0), "test:consumer": exits(2) } });
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /suite test:consumer: unknown/);
  });

  it("reads a suite's end other than 0, 1 or 2 as unknown, since it is none of Testing's results", async () => {
    const r = await runWith({ scripts: { "test:publisher": exits(3), "test:consumer": exits(0) } });
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /suite test:publisher: unknown \(exit 3\)/);
  });

  it("is unknown when the package's own scripts cannot be read", async () => {
    for (const [why, packageJson] of [["absent", undefined], ["unreadable", "{ not json"]]) {
      const r = await runWith({ packageJson });
      assert.equal(r.status, 2, `${why}: ${r.out}`);
      assert.match(r.out, /unknown: package\.json cannot be read/, why);
    }
  });

  it("is unknown when test:consumer is not declared", async () => {
    const r = await runWith({ scripts: { "test:publisher": exits(0) } });
    assert.equal(r.status, 2, r.out);
    assert.match(r.out, /test:consumer is not declared/);
  });

  it("lists the suites it would run, consumer last, and runs none", async () => {
    const r = await runWith({ scripts: { "test:consumer": exits(1), "test:publisher": exits(1) }, args: ["--list"] });
    assert.equal(r.status, 0, r.out);
    assert.deepEqual(r.out.trim().split("\n"), ["kaal-testing-suite test:publisher", "kaal-testing-suite test:consumer"]);
  });
});
