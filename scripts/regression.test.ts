import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  type Case,
  classify,
  fileCases,
  judge,
  PLAN,
  planCommitments,
  planLedger,
  regressionErrors,
  type Result,
} from "./regression.js";
import { regressionCandidate, regressionTrusted } from "./test-data.js";

const REPO = fileURLToPath(new URL("../", import.meta.url));
/** The trusted regression's commit, as the candidates in test-data/regression name it. */
const BASE = "b".repeat(40);
const GREETING = "brain/learning/k/26/01/01/01/nodes/greeting.md";
const GREETING_LATER = "brain/learning/k/26/01/02/01/nodes/greeting.md";

const classified = (candidate: string) => classify(regressionTrusted(), regressionCandidate(candidate), BASE);

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a commitment the candidate's plan still names is retained", () => {
  assert.deepEqual(classified("kept"), {
    retained: ["src/add.ts", GREETING],
    replaced: new Map(),
    withdrawn: new Map(),
    errors: [],
  });
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a commitment superseded by a later node of the same name that the plan names is replaced by it", () => {
  const { retained, replaced, withdrawn, errors } = classified("replaced");
  assert.deepEqual(
    [retained, [...replaced], [...withdrawn], errors],
    [["src/add.ts"], [[GREETING, GREETING_LATER]], [], []],
  );
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a commitment superseded by a later node of the same name that the plan does not name is withdrawn by it", () => {
  const { retained, replaced, withdrawn, errors } = classified("withdrawn");
  assert.deepEqual(
    [retained, [...replaced], [...withdrawn], errors],
    [["src/add.ts"], [], [[GREETING, GREETING_LATER]], []],
  );
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a commitment that leaves the plan without being superseded in BRAIN is a silent escape", () => {
  assert.deepEqual(classified("escaped").errors, [
    `${GREETING}: silent escape: the plan no longer names it, and nothing in BRAIN supersedes it`,
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a commitment stated outside BRAIN can only be retained: leaving the plan is a silent escape", () => {
  assert.deepEqual(classified("code-removed").errors, [
    "src/add.ts: silent escape: the plan no longer names it, and nothing in BRAIN supersedes it",
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a replacement no case of the candidate points at is refused", () => {
  assert.deepEqual(classified("replaced-unproven").errors, [
    `${GREETING}: replaced by ${GREETING_LATER}, which no case of the candidate proves`,
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a plan that still names a commitment BRAIN has superseded is refused", () => {
  assert.deepEqual(classified("superseded-kept").errors, [
    `${GREETING}: the plan still names it, but ${GREETING_LATER} supersedes it`,
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("the plan's own account of what it replaces and withdraws is checked against BRAIN, never trusted", () => {
  assert.deepEqual(classified("unledgered").errors, [
    `${PLAN}: says it withdraws [], but BRAIN shows [${JSON.stringify([GREETING, GREETING_LATER])}]`,
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a plan derived from anything but main as it is now is refused", () => {
  assert.deepEqual(classified("stale-base").errors, [
    `${PLAN}: derived from ${"a".repeat(40)}, not from main at ${BASE}`,
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a trusted regression without a plan classifies nothing, so every one of its cases must hold", () => {
  const trusted = regressionCandidate("kept");
  fs.rmSync(path.join(trusted, PLAN));
  assert.deepEqual(classify(trusted, regressionCandidate("kept"), BASE), {
    retained: [],
    replaced: new Map(),
    withdrawn: new Map(),
    errors: [],
  });
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a trusted case that does not pass is excused only when every commitment it points at was superseded", () => {
  const cases: Case[] = [
    { file: "a.test.ts", title: "retained", places: ["kept.md"] },
    { file: "a.test.ts", title: "superseded", places: ["gone.md"] },
    { file: "a.test.ts", title: "partly superseded", places: ["gone.md", "kept.md"] },
    { file: "a.test.ts", title: "unlinked", places: [] },
    { file: "a.test.ts", title: "skipped", places: ["kept.md"] },
    { file: "a.test.ts", title: "missing", places: ["kept.md"] },
  ];
  const results: Result[] = [
    { file: "a.test.ts", name: "retained", outcome: "fail" },
    { file: "a.test.ts", name: "superseded", outcome: "fail" },
    { file: "a.test.ts", name: "partly superseded", outcome: "fail" },
    { file: "a.test.ts", name: "unlinked", outcome: "fail" },
    { file: "a.test.ts", name: "skipped", outcome: "skip" },
  ];
  assert.deepEqual(judge(cases, results, new Set(["gone.md"])), [
    'a.test.ts: "retained" failed',
    'a.test.ts: "partly superseded" failed',
    'a.test.ts: "unlinked" failed',
    'a.test.ts: "skipped" was skipped',
    'a.test.ts: "missing" not run',
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a trusted file that does not run as a whole proves none of its cases, even if it reports a pass", () => {
  const cases: Case[] = [{ file: "a.test.ts", title: "holds", places: ["kept.md"] }];
  const results: Result[] = [
    { file: "a.test.ts", name: "holds", outcome: "pass" },
    { file: "a.test.ts", name: "a.test.ts", outcome: "pass" },
  ];
  assert.deepEqual(judge(cases, results, new Set()), ['a.test.ts: "holds" did not run as a whole']);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a candidate cannot weaken a retained commitment by weakening its own cases: main's cases judge it", () => {
  assert.deepEqual(regressionErrors(regressionTrusted(), regressionCandidate("weakened"), BASE), [
    'scripts/cases.test.ts: "adds" failed',
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a candidate cannot relabel a retained commitment's case away: main's links choose what judges it", () => {
  assert.deepEqual(regressionErrors(regressionTrusted(), regressionCandidate("relabeled"), BASE), [
    'scripts/cases.test.ts: "adds" failed',
  ]);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a candidate that withdraws or replaces a commitment through BRAIN is not held to its old cases", () => {
  assert.deepEqual(regressionErrors(regressionTrusted(), regressionCandidate("withdrawn"), BASE), []);
  assert.deepEqual(regressionErrors(regressionTrusted(), regressionCandidate("replaced"), BASE), []);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("KAAL's own plan states a place for every commitment and the main it was derived from", () => {
  const plan = fs.readFileSync(path.join(REPO, PLAN), "utf8");
  assert.equal(planCommitments(plan).length, [...plan.matchAll(/^\d+\. /gm)].length);
  assert.match(planLedger(plan).base ?? "", /^[0-9a-f]{40}$/);
});

// Why: brain/learning/genesis/26/09/26/02/nodes/testing.md
test("a case's commitments are the Why: lines directly above it, and only those", () => {
  assert.deepEqual(
    fileCases(
      "x.test.ts",
      '// Why: a.md\n// Why: b.md\ntest("both", () => {});\n\n// Why: c.md\n\ntest("none", () => {});\n',
    ),
    [
      { file: "x.test.ts", title: "both", places: ["a.md", "b.md"] },
      { file: "x.test.ts", title: "none", places: [] },
    ],
  );
});
