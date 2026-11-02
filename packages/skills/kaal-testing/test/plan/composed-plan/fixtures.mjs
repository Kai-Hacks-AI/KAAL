// Controlled ports for the proposed execution coordinator; not production receipts.
import assert from "node:assert/strict";
export const manifest = () => ({ id: "demo-plan", subject: "a".repeat(64), suites: [{ id: "A", files: ["a.test.mjs", "b.test.mjs"] }, { id: "B", files: ["b.test.mjs", "c.test.mjs"] }] });
export const context = () => ({ cwd: "/controlled-consumer", platform: "linux", node: "v24.22.1" });
export const fileHash = name => ({ "a.test.mjs": "1", "b.test.mjs": "2", "c.test.mjs": "3" })[name]?.repeat(64);
export function fixture(value = manifest(), schedule) {
  const calls = { read: [], digest: [], schedule: [], observe: [] };
  const observations = new Map(value.suites.flatMap(s => s.files).map(file => [file, Object.freeze({ result: "passed", runnerExit: 0, complete: true, cases: [{ name: file + " > first", outcome: "passed" }], stdout: "original stdout", stderr: "", provenance: { occurrence: file } })]));
  const ports = {
    read: async (file, ctx) => { calls.read.push({ file, context: ctx }); return new TextEncoder().encode(file); },
    digest: bytes => { calls.digest.push(bytes); return fileHash(new TextDecoder().decode(bytes)); },
    schedule: requests => { calls.schedule.push(requests); return schedule(requests); },
    observe: async (run, ctx) => { calls.observe.push({ run, context: ctx }); return observations.get(run.file); },
  };
  return { value, context: context(), calls, observations, ports };
}
export function observationFor(report, suite, file) {
  const s = report.suites.find(row => row.id === suite);
  const read = s?.reads.find(row => row.file === file);
  assert.ok(read, `required Suite/file read missing: ${suite}/${file}`);
  return report.executions[read.execution].observation;
}
