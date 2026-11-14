// Draft fixtures for the Testing reference evaluation (skills/C1 PLAN). In a DO these would be Testing's own file;
// here they only let the prototype call Testing's real code. Each mechanism offers three inputs: one the mechanism
// can decide as clear, one it must report on, and one it cannot decide. Arguments are exactly what a caller passes.
const D = 'a'.repeat(64);
const run = (over = {}) => ({ case: 'c', file: 'f.mjs', sha256: D, subject: D, platform: 'linux', node: '24', ms: 5, ...over });
const enc = (s) => new TextEncoder().encode(s);
const wsOk = { workspace: 'w', tests: 'pass', delivered: [], lines: {}, unexecuted: [], files: [] };
const noAttribution = { owners: [], unassigned: { entries: [] }, conflicts: [], findings: [] };

export const duplicates = {
  clear: { args: [{ runs: [run()] }] },
  report: { args: [{ runs: [run(), run()] }] },
  unknown: { args: [{ runs: [] }] },
};
export const report = {
  clear: { args: [noAttribution, [wsOk]] },
  report: { args: [noAttribution, [{ ...wsOk, failed: 'c8 crashed' }]] },
  unknown: { args: [noAttribution, [{ workspace: 'w', unknown: 'no evidence' }]] },
};
export const inventory = {
  clear: { args: [[{ path: 'a.md', bytes: enc('x\n\ny\n') }]] },
};
// accept/cover need Hosting built (Node 24); their fixtures are a DO task, so the prototype reports them unknown.
