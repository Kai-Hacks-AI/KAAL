// Proposed Guard producer-contract fixtures. All hashes/receipts are synthetic.
export const A = "a".repeat(64), B = "b".repeat(64), REV = "c".repeat(40);
export const clone = (x) => structuredClone(x);
export function given() {
  const record = { candidate: REV, host: "linux", node: "v24.22.1", suites: [{ owner: "Engineering", name: "Engineering acceptance", files: ["cases.mjs"], status: "passed" }], cases: [
    { case: "guard/example-1", owner: "Engineering", suite: "Engineering acceptance", file: "cases.mjs", outcome: "passed" },
    { case: "guard/example-2", owner: "Engineering", suite: "Engineering acceptance", file: "cases.mjs", outcome: "passed" },
  ] };
  const authority = { candidate: REV, host: "linux", node: "v24.22.1", invocation: "invocation-1", producer: REV,
    receipts: { "receipt-1": { file: "cases.mjs", invocation: "invocation-1", worker: "worker-1", digest: A, mechanism: "loader-source", chain: "pinned-direct-js", sourceConsistency: "established" } } };
  const evidence = { context: { candidate: REV, host: "linux", node: "v24.22.1", invocation: "invocation-1" }, producer: REV,
    events: [1,2].map((id) => ({ ref: `invocation-1/worker-1/${id}`, invocation: "invocation-1", worker: "worker-1", instance: String(id), file: "cases.mjs", kind: "test", ended: "pass", ms: id === 1 ? 0 : 8, declaredAncestors: [] })),
    bindings: record.cases.map((c,i) => ({ case: c.case, suite: c.suite, file: c.file, events: [`invocation-1/worker-1/${i+1}`] })),
    loads: [{ file: "cases.mjs", invocation: "invocation-1", worker: "worker-1", before: A, executed: A, after: A, receipt: "receipt-1" }],
  };
  return { record, evidence, authority };
}
export function withoutTiming(record) {
  const r = clone(record); delete r.schema; delete r.producer; delete r.timingEvidence;
  for (const c of r.cases) delete c.timing;
  return r;
}
