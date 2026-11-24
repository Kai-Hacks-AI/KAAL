// Additional implementation checks; the C50 assertions remain untouched.
import assert from "node:assert/strict";
import { it } from "node:test";
import { duplicates, schedule } from "kaal-testing/duplicates";

const on = { subject: "a".repeat(64), platform: "linux", node: "v24.0.0" };
const file = { path: "cases.mjs", sha256: "b".repeat(64) };
const request = (by, extra = {}) => ({ by, files: [file], ...on, ...extra });

it("independent executions have separate schedules; failures and unknown observations are shared unchanged within one execution", () => {
  const q = [request("one"), request("two")];
  const a = schedule(q), b = schedule(q);
  assert.deepEqual(a, b);
  assert.equal(a.runs.length, 1);
  assert.notEqual(a.runs, b.runs, "no cached observation or retained plan crosses executions");
  for (const observation of [{ outcome: "failed", evidence: "failure" }, { outcome: "unknown", evidence: "incomplete" }]) {
    const observed = [Object.freeze(observation)];
    assert.deepEqual(a.reads.map((r) => observed[r.run]), [observation, observation]);
    assert.ok(a.reads.every((r) => observed[r.run] === observation));
    assert.equal(schedule(q).runs.length, 1, "an earlier failed/unknown execution cannot suppress a later independently required run");
  }
  for (const extra of [
    { subject: "c".repeat(64) }, { platform: "win32" }, { node: "v24.1.0" },
    { files: [{ ...file, sha256: "d".repeat(64) }] }, { files: [{ ...file, path: "other.mjs" }] },
  ]) assert.equal(schedule([request("one"), request("two", extra)]).runs.length, 2);
});

it("unknown input plans nothing, even beside valid requests; findings and floating durations are permutation independent", () => {
  for (const bad of [null, [], {}, { ...request("bad"), files: [null] }, { ...request("bad"), platform: " " }]) {
    const s = schedule([request("good"), bad]);
    assert.ok(s.findings.length);
    assert.deepEqual([s.runs, s.reads], [[], []]);
  }
  const run = { case: "T1", file: file.path, sha256: file.sha256, ...on };
  const runs = [1e16, 0.1, 2, 1].map((ms) => ({ ...run, ms }));
  assert.deepEqual(duplicates({ runs }), duplicates({ runs: [...runs].reverse() }));
  assert.deepEqual(schedule([]), { runs: [], reads: [], findings: [] });
  const equalWaste = ["a", "b"].flatMap((c) => [1, 2].map((ms) => ({ ...run, subject: c.repeat(64), ms })));
  assert.deepEqual(duplicates({ runs: equalWaste }), duplicates({ runs: [...equalWaste].reverse() }));
});

it("fixed-seed property checks (testing/C77): schedule key uniqueness, read/request conservation, non-mutation, and permutation invariance", () => {
  let state = 1001;
  const rng = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = (xs) => xs[Math.floor(rng() * xs.length)];
  const shuffle = (xs) => {
    const out = [...xs];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const filesPool = ["a.mjs", "b.mjs", "c.mjs", "d.mjs"].map((p, k) => ({ path: p, sha256: String(k + 1).repeat(64) }));
  const subjects = ["a", "b", "c"].map((c) => c.repeat(64));

  for (let n = 0; n < 80; n++) {
    const k = 1 + Math.floor(rng() * 6);
    const reqs = Array.from({ length: k }, (_, idx) => ({
      by: `req/${idx}`,
      files: Array.from({ length: 1 + Math.floor(rng() * 4) }, () => pick(filesPool)),
      subject: pick(subjects),
      platform: pick(["linux", "win32", "darwin"]),
      node: pick(["v24.0.0", "v24.20.0"]),
    }));
    const reqSnap = structuredClone(reqs);
    const planned = schedule(reqs);
    assert.deepEqual(reqs, reqSnap, "schedule must not mutate requests");
    assert.deepEqual(planned.findings, []);
    const keys = planned.runs.map((r) => JSON.stringify([r.file, r.sha256, r.subject, r.platform, r.node]));
    assert.equal(new Set(keys).size, planned.runs.length, "planned runs must be unique by scheduling key");

    const expectedPairs = [];
    for (const q of reqs) {
      const seen = new Set();
      for (const f of q.files) {
        const key = `${f.path}:${f.sha256}`;
        if (!seen.has(key)) {
          seen.add(key);
          expectedPairs.push({ by: q.by, file: f.path, sha256: f.sha256, subject: q.subject, platform: q.platform, node: q.node });
        }
      }
    }
    assert.equal(planned.reads.length, expectedPairs.length, "reads equal deduplicated requested files");
    for (const pair of expectedPairs) {
      const matched = planned.reads.filter((rd) => {
        const r = planned.runs[rd.run];
        return rd.by === pair.by && rd.file === pair.file && r && r.file === pair.file && r.sha256 === pair.sha256 && r.subject === pair.subject && r.platform === pair.platform && r.node === pair.node && r.for.includes(pair.by);
      });
      assert.equal(matched.length, 1);
    }
    assert.deepEqual(schedule(shuffle(reqs)), planned, "schedule output must be permutation invariant");

    const runs = Array.from({ length: 1 + Math.floor(rng() * 8) }, () => ({
      case: `c/T${Math.floor(rng() * 4)}`,
      file: pick(["a.mjs", "b.mjs"]),
      sha256: pick(subjects),
      subject: pick(subjects),
      platform: pick(["linux", "win32"]),
      node: pick(["v24.0.0", "v24.20.0"]),
      ms: pick([0, 0.1, 1, 2, 1e16]),
    }));
    const runSnap = structuredClone(runs);
    const obs = duplicates({ runs });
    assert.deepEqual(runs, runSnap, "duplicates must not mutate runs");
    assert.deepEqual(duplicates({ runs: shuffle(runs) }), obs, "duplicates output must be permutation invariant");
  }
});
