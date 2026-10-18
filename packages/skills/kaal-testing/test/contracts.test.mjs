import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sha256 } from "kaal-testing/acceptance";
import { classify, LOOPS, problems } from "kaal-testing/contracts";

const OWNER = { kind: "capability", name: "Alpha", id: "a".repeat(64) };
const SOURCE = "x/README.md";
const QUOTE = "Alpha refuses what is out of scope.";
const TEST = "x/test/a.test.mjs";
const TEST_BYTES = Buffer.from('it("refuses", () => {});\n');
const PATH = ["Alpha", "refuses"];

async function mapping(extra = {}, evidence) {
  const file = await sha256(TEST_BYTES);
  return {
    owner: OWNER,
    statements: [
      {
        source: SOURCE,
        quote: QUOTE,
        sha256: await sha256(Buffer.from(QUOTE)),
        loop: "acceptance",
        evidence: evidence ?? [{ file: TEST, sha256: file, test: PATH }],
        inference: "The test asserts the refusal.",
        limits: "One input only.",
        review: null,
        ...extra,
      },
    ],
  };
}
const FILES = { [SOURCE]: Buffer.from(`# Alpha\n\n${QUOTE}\n`), [TEST]: TEST_BYTES };
const result = async (status, extra = {}) => ({ file: TEST, sha256: await sha256(TEST_BYTES), test: PATH, status, ...extra });
const only = async (m, files, results) => (await classify(m, files, results))[0];

describe("contract evidence: reading a mapping", () => {
  it("reads a capability's own mapping, and refuses one whose owner is not its claim's", async () => {
    assert.deepEqual(problems(await mapping(), OWNER), []);
    assert.deepEqual(problems(await mapping(), { ...OWNER, id: "b".repeat(64) }), ["the mapping's owner is not the owner of the claim beside it"]);
  });

  it("accepts only the conformance and acceptance loops: implementation tests are never contract evidence", async () => {
    assert.deepEqual(LOOPS, ["conformance", "acceptance"]);
    assert.deepEqual(problems(await mapping({ loop: "implementation" }), OWNER), ["statement 1: loop must be conformance or acceptance"]);
  });

  it("requires an inference and its limits wherever evidence is offered, and a complete review record when there is one", async () => {
    assert.deepEqual(problems(await mapping({ inference: "" }), OWNER), ["statement 1: offered evidence needs an inference and its limits"]);
    assert.deepEqual(problems(await mapping({ review: { reviewer: "someone" } }), OWNER), ["statement 1: a review records its reviewer, pr, commit and the statement and evidence hashes reviewed"]);
  });
});

describe("contract evidence: classifying a statement", () => {
  it("never reports a statement as met: verified evidence with an unreviewed inference stays unknown", async () => {
    const s = await only(await mapping(), FILES, [await result("pass")]);
    assert.equal(s.class, "unknown");
    assert.equal(s.reason, "evidence verified; inference proposed, not reviewed");
    assert.deepEqual(s.evidence.map((e) => e.class), ["verified"]);
  });

  it("reports verified evidence and an inference validated at review, at exactly the reviewed hashes, with its limits", async () => {
    const m = await mapping();
    const st = m.statements[0];
    st.review = { reviewer: "owner", pr: 1, commit: "c", statement: st.sha256, evidence: [st.evidence[0].sha256] };
    const s = await only(m, FILES, [await result("pass")]);
    assert.equal(s.class, "evidence verified, inference validated");
    assert.match(s.reason, /validated at review by owner in #1 at c; limits: One input only\.$/);
  });

  it("drops a review made at other hashes to unknown", async () => {
    const m = await mapping();
    m.statements[0].review = { reviewer: "owner", pr: 1, commit: "c", statement: m.statements[0].sha256, evidence: ["0".repeat(64)] };
    const s = await only(m, FILES, [await result("pass")]);
    assert.equal(s.class, "unknown");
    assert.equal(s.inference, "reviewed at other hashes (stale)");
  });

  it("reports a failed offered test as a verified failure", async () => {
    assert.equal((await only(await mapping(), FILES, [await result("fail")])).class, "verified failure");
  });

  it("fails closed: every gap is unknown with its reason, never a pass", async () => {
    const m = await mapping();
    const reason = async (files, results) => (await only(m, files, results)).evidence[0]?.reason ?? (await only(m, files, results)).reason;
    assert.equal(await reason(FILES, undefined), "this run's evidence carries no per-test results");
    assert.equal(await reason(FILES, []), "the test did not run in this run");
    assert.equal(await reason(FILES, [await result("pass"), await result("pass")]), "the test path names 2 results: ambiguous");
    assert.equal(await reason(FILES, [await result("skip")]), "the test was skip, not run to a result");
    assert.equal(await reason(FILES, [await result("pass", { sha256: "0".repeat(64) })]), "the run executed other bytes of the file than the pinned ones");
    assert.equal(await reason({ ...FILES, [TEST]: Buffer.from("changed") }, [await result("pass")]), `${TEST} no longer holds the pinned bytes (stale)`);
    assert.equal(await reason({ [SOURCE]: FILES[SOURCE] }, [await result("pass")]), `${TEST} is missing`);
    assert.equal(await reason({ ...FILES, [SOURCE]: Buffer.from("# Alpha\n") }, [await result("pass")]), `the statement is no longer in ${SOURCE} (stale)`);
    assert.equal((await only({ ...m, statements: [{ ...m.statements[0], quote: "edited" }] }, FILES, [])).reason, "the quote does not match its pinned sha256");
  });

  it("matches a result by file and full test path, not by the test's name alone", async () => {
    const s = await only(await mapping(), FILES, [await result("pass", { test: ["Other", "refuses"] })]);
    assert.equal(s.evidence[0].reason, "the test did not run in this run");
  });

  it("reports a statement with no evidence offered as unknown", async () => {
    assert.equal((await only(await mapping({}, []), FILES, [])).reason, "no evidence is offered for it");
  });
});

describe("Testing's own mapping", () => {
  const PACKAGE = fileURLToPath(new URL("../", import.meta.url));
  const own = JSON.parse(readFileSync(`${PACKAGE}evidence.kaal.json`, "utf8"));
  const claim = JSON.parse(readFileSync(`${PACKAGE}ownership.kaal.json`, "utf8"));

  it("reads, under Testing's own claim, and pins only statements and tests inside Testing's tree", () => {
    assert.deepEqual(problems(own, claim.owner), []);
    for (const s of own.statements) {
      assert.ok(s.source.startsWith("packages/skills/kaal-testing/"), s.source);
      for (const e of s.evidence) assert.ok(e.file.startsWith("packages/skills/kaal-testing/test/"), e.file);
    }
  });

  it("without a run's per-test results, classifies every statement as unknown: stale pins also read as unknown, never as a failure of this suite", async () => {
    const root = fileURLToPath(new URL("../../../../", import.meta.url));
    const files = {};
    for (const p of new Set(own.statements.flatMap((s) => [s.source, ...s.evidence.map((e) => e.file)]))) if (existsSync(root + p)) files[p] = readFileSync(root + p);
    const classified = await classify(own, files, undefined);
    assert.equal(classified.length, own.statements.length);
    for (const s of classified) assert.equal(s.class, "unknown", s.quote);
  });
});
