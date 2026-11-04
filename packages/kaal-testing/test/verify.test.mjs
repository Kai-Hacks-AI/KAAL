// Implementation tests for test/verify.mjs (testing/F13, testing/F50, testing/F63): every way the runner can
// report a delivered file decides exactly one result. An established failure of the intact package as shipped is
// failed; anything that leaves a declared case unproven is unknown; neither is ever verified. Each case installs a
// minimal package that ships this verifier into a fresh consumer under the temporary directory and runs it there.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { execute } from "kaal-hosting";

const VERIFY = readFileSync(join(resolve(dirname(fileURLToPath(import.meta.url))), "verify.mjs"));
const PREFIX = "kaal-testing-verification ";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Every file under `base`, relative to it with forward slashes. */
function files(base) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(join(d, e.name));
      else out.push(relative(base, join(d, e.name)).split(sep).join("/"));
    }
  };
  walk(base);
  return out.sort();
}

/**
 * Installs a package `fx` that ships this verifier and the case files `embed` ({ name: source }) in a fresh
 * consumer, writes the manifest the publisher would write declaring `declared`, runs the verifier there and gives
 * its exit status and parsed summary.
 */
async function verify(embed, declared) {
  const consumer = mkdtempSync(join(tmpdir(), "kaal-testing-verify-"));
  try {
    writeFileSync(join(consumer, "package.json"), JSON.stringify({ name: "consumer", version: "1.0.0", private: true }));
    const pkg = join(consumer, "node_modules", "fx");
    mkdirSync(join(pkg, "test", "embed"), { recursive: true });
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "fx", version: "0.0.1", type: "module" }));
    writeFileSync(join(pkg, "test", "verify.mjs"), VERIFY);
    for (const [name, source] of Object.entries(embed)) writeFileSync(join(pkg, "test", "embed", name), source);
    const hashes = Object.fromEntries(files(pkg).map((p) => [p, sha256(readFileSync(join(pkg, p)))]));
    const model = { cases: declared.map((id) => ({ id, tests: ["fx/F1"] })) };
    writeFileSync(join(pkg, "test", "verify.json"), JSON.stringify({ hashes, cases: declared, model, applicability: {}, platforms: ["linux", "darwin", "win32"] }));
    const r = await execute("node", [join(pkg, "test", "verify.mjs")], { cwd: consumer });
    const lines = r.stdout.split("\n").filter((l) => l.startsWith(PREFIX));
    assert.equal(lines.length, 1, `exactly one summary line\n${r.stdout}${r.stderr}`);
    const summary = JSON.parse(lines[0].slice(PREFIX.length));
    assert.equal(r.status, { verified: 0, failed: 1, unknown: 2 }[summary.result], "the exit status is the summary's result");
    return { status: r.status, summary, outcomes: Object.fromEntries(summary.cases.map((c) => [c.name, c.outcome])) };
  } finally {
    rmSync(consumer, { recursive: true, force: true });
  }
}

const HEAD = 'import { it } from "node:test";\n';

describe("The installed verification's result for each report the runner gives", () => {
  it("is verified only when every declared case ran and passed (the baseline the negatives depart from)", async () => {
    const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nit("b", () => {});\n` }, ["a", "b"]);
    assert.equal(r.summary.result, "verified");
    assert.deepEqual(r.outcomes, { a: "pass", b: "pass" });
  });

  describe("(1) a delivered file that fails as a whole is an established failure, never verified", () => {
    it("is failed when the file cannot be imported, naming the file; its declared cases stay not run", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\n`, "b.test.mjs": `import "./absent.mjs";\n${HEAD}it("b", () => {});\n` }, ["a", "b"]);
      assert.equal(r.summary.result, "failed");
      assert.equal(r.summary.cause, "a delivered case failed against the installed package");
      assert.ok(r.summary.evidence.some((e) => /^test\/embed\/b\.test\.mjs failed as a whole: /.test(e)), r.summary.evidence.join("\n"));
      assert.deepEqual(r.outcomes, { a: "pass", b: "not run" }, "a case that did not run is never reported as having run");
    });

    it("is failed when the file throws while it loads, after declaring its cases", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nthrow new Error("broken at load");\n` }, ["a"]);
      assert.equal(r.summary.result, "failed");
      assert.ok(r.summary.evidence.some((e) => /^test\/embed\/a\.test\.mjs failed as a whole: /.test(e)), r.summary.evidence.join("\n"));
    });

    it("is failed when the file's process exits non-zero after its cases passed", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nprocess.on("exit", () => { process.exitCode = 3; });\n` }, ["a"]);
      assert.equal(r.summary.result, "failed");
      assert.equal(r.outcomes.a, "pass");
    });

    it("is unknown, not failed and not verified, when the file exits cleanly before any case ran: nothing failed, nothing was proven", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}process.exit(0);\nit("a", () => {});\n` }, ["a"]);
      assert.equal(r.summary.result, "unknown");
      assert.deepEqual(r.outcomes, { a: "not run" });
    });
  });

  describe("(2) a leaf test the manifest does not declare is never counted as a declared case", () => {
    it("is unknown when it passes: the run is not the declared set", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nit("stand-in", () => {});\n` }, ["a"]);
      assert.equal(r.summary.result, "unknown");
      assert.ok(r.summary.evidence.includes("stand-in ran and is not declared"), r.summary.evidence.join("\n"));
    });

    it("is unknown when it stands in for a declared case that never ran", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a-renamed", () => {});\n` }, ["a"]);
      assert.equal(r.summary.result, "unknown");
      assert.deepEqual(r.outcomes, { a: "not run" });
    });

    it("is failed when it fails: the intact package as shipped ran a delivered test that failed", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nit("undeclared", () => { throw new Error("violation"); });\n` }, ["a"]);
      assert.equal(r.summary.result, "failed");
      assert.ok(r.summary.evidence.includes("undeclared ran, is not declared, and failed"), r.summary.evidence.join("\n"));
    });

    it("is unknown when it repeats a declared case's title: the case's outcome cannot be told", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nit("a", () => {});\n` }, ["a"]);
      assert.equal(r.summary.result, "unknown");
      assert.deepEqual(r.outcomes, { a: "not run" });
    });
  });

  describe("(3) a skipped or todo case proves nothing, so it is unknown, never verified and never failed", () => {
    for (const [how, source, outcome] of [
      ["declared skipped", `${HEAD}it("a", { skip: true }, () => {});\n`, "skipped"],
      ["skipped from inside its body", `${HEAD}it("a", (t) => { t.skip(); });\n`, "skipped"],
      ["declared todo, passing", `${HEAD}it("a", { todo: true }, () => {});\n`, "todo"],
      ["declared todo, failing", `${HEAD}it("a", { todo: true }, () => { throw new Error("not yet"); });\n`, "todo"],
      ["marked todo from inside its body", `${HEAD}it("a", (t) => { t.todo(); });\n`, "todo"],
    ]) {
      it(`is unknown when a declared case is ${how}`, async () => {
        const r = await verify({ "a.test.mjs": source }, ["a"]);
        assert.equal(r.summary.result, "unknown");
        assert.deepEqual(r.outcomes, { a: outcome });
        assert.ok(r.summary.evidence.includes(`a is ${outcome}`), r.summary.evidence.join("\n"));
      });
    }

    it("is unknown when an undeclared test is skipped or todo beside passing declared cases", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", () => {});\nit("later", { skip: true }, () => {});\nit("someday", { todo: true }, () => { throw new Error("x"); });\n` }, ["a"]);
      assert.equal(r.summary.result, "unknown");
      assert.ok(r.summary.evidence.includes("later ran and is not declared"));
      assert.ok(r.summary.evidence.includes("someday ran and is not declared"));
    });

    it("is still failed when a declared case fails beside a skipped one: an established failure is never hidden", async () => {
      const r = await verify({ "a.test.mjs": `${HEAD}it("a", { skip: true }, () => {});\nit("b", () => { throw new Error("violation"); });\n` }, ["a", "b"]);
      assert.equal(r.summary.result, "failed");
      assert.deepEqual(r.outcomes, { a: "skipped", b: "fail" });
      assert.deepEqual(r.summary.evidence, ["b failed"], "a failing case is not also reported as its file failing");
    });
  });
});
