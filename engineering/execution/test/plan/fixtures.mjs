// Proposed PLAN fixtures. These are controlled port responses, never live authority.
import assert from "node:assert/strict";
export const FILE = { path: "cases.mjs", sha256: "1".repeat(64) };
export const CONTEXT = Object.freeze({ workflow: "fixture", job: "job-1", attempt: 1, run: "run-1", platform: "linux", node: "v24.0.0", arch: "x64", cwd: "/fixture", flags: [], dependencies: "deps-1", fixture: "seed-1", coverage: "off", mode: "reuse" });
export const request = (id, extra = {}) => ({ id, owner: "FixtureOwner", files: [FILE], subject: "a".repeat(64), platform: "linux", node: "v24.0.0", entrypoint: "declared fixture suite", ...extra });
export const event = (extra = {}) => ({ case: "fixture/T1", file: FILE.path, sha256: FILE.sha256, subject: "a".repeat(64), platform: "linux", node: "v24.0.0", ms: 5, ...extra });
export function fixture(requests = [request("a"), request("b")], options = {}) {
  const context = { ...CONTEXT, ...options.context };
  const input = { requests, context };
  const calls = { authorize: [], qualify: [], schedule: [], execute: [], original: [], evaluate: [], duplicates: [], publish: [] };
  const observation = options.observation ?? Object.freeze({ outcome: "passed", exit: 0, cases: [{ id: "fixture/T1", outcome: "passed" }], complete: true, events: [event()], provenance: Object.freeze({ occurrence: "fixture-occurrence" }) });
  const verdict = options.verdict ?? Object.freeze({ result: "passed", exit: 0, source: "fixture original evaluator" });
  const advice = Object.freeze({ result: "unchallenged", challenges: [], findings: [], wastedMs: 0 });
  const originalObservations = new Map();
  const ports = {
    authorize: async (value) => { calls.authorize.push(value); return options.authorized === false ? undefined : Object.freeze({ context, source: "test-controlled activation authority" }); },
    qualify: async (q, ctx) => {
      calls.qualify.push({ q, context: ctx });
      if (options.qualify) return options.qualify(q, ctx);
      return { domain: "fixture-domain", request: { by: q.id, files: q.files, subject: q.subject, platform: q.platform, node: q.node }, source: "test-controlled owner qualification" };
    },
    testing: {
      schedule: (qs) => {
        calls.schedule.push(qs);
        if (options.schedule) return options.schedule(qs);
        // Fixture oracle only for this one known file. No general equality/grouping algorithm.
        assert.ok(qs.length === 1 || qs.length === 2);
        for (const q of qs) assert.deepEqual(q.files, [FILE]);
        return { runs: [{ file: FILE.path, sha256: FILE.sha256, subject: "a".repeat(64), platform: "linux", node: "v24.0.0", for: qs.map((q) => q.by) }], reads: qs.map((q) => ({ by: q.by, file: FILE.path, run: 0 })), findings: [] };
      },
      duplicates: (execution) => { calls.duplicates.push(execution); if (options.duplicates) return options.duplicates(execution); return advice; },
    },
    execute: async (run, domain) => { calls.execute.push({ run, domain }); return observation; },
    original: async (q) => { calls.original.push(q); const o = options.original ? options.original(q) : Object.freeze({ ...observation, provenance: { occurrence: q.id } }); originalObservations.set(q.id, o); return o; },
    evaluate: async (requestResults, ctx) => { calls.evaluate.push({ requestResults, context: ctx }); return verdict; },
    publish: async (report) => { calls.publish.push(report); if (options.publish) return options.publish(report); },
  };
  return { input, calls, ports, observation, verdict, advice, originalObservations };
}
export const resultFor = (r, id) => {
  const row = r.requestResults?.find((x) => x.id === id);
  assert.ok(row, `required requester ${id} has a result`);
  return row;
};
