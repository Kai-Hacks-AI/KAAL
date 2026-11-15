// testing/A27: pure planning and evidence; execution and verdicts remain the caller's.
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x) => typeof x === "string" && x.trim().length > 0;
const digest = (x) => typeof x === "string" && /^[a-f0-9]{64}$/.test(x);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const ordered = (xs) => [...new Set(xs)].sort(compare);
const fields = ["file", "sha256", "subject", "platform", "node"];
const key = (x, names = fields) => JSON.stringify(names.map((f) => x[f]));
const byIdentity = (a, b) => {
  for (const f of fields) {
    const c = compare(a[f], b[f]);
    if (c) return c;
  }
  return 0;
};
function conditions(x, label, findings) {
  for (const f of ["platform", "node"]) if (!text(x[f])) findings.push(`${label}: ${f} must be nonempty text`);
  if (!digest(x.subject)) findings.push(`${label}: subject must be a SHA-256`);
}

/** Challenge repeated observations within this execution; never choose or change a verdict. */
export function duplicates(execution) {
  const findings = [];
  if (!object(execution) || !Array.isArray(execution.runs) || execution.runs.length === 0) {
    return { result: "unknown", challenges: [], findings: ["execution must hold a nonempty runs list"], wastedMs: 0 };
  }
  for (const r of execution.runs) {
    if (!object(r)) { findings.push("run must be an object"); continue; }
    const label = `run ${text(r.case) ? r.case : "(unnamed)"}`;
    for (const f of ["case", "file"]) if (!text(r[f])) findings.push(`${label}: ${f} must be nonempty text`);
    if (!digest(r.sha256)) findings.push(`${label}: sha256 must be a SHA-256`);
    if (!Number.isFinite(r.ms) || r.ms < 0) findings.push(`${label}: ms must be finite and nonnegative`);
    if ("by" in r && !text(r.by)) findings.push(`${label}: by must name a Case`);
    conditions(r, label, findings);
  }
  if (findings.length) return { result: "unknown", challenges: [], findings: ordered(findings), wastedMs: 0 };
  const groups = new Map();
  for (const r of execution.runs) {
    const id = key(r, ["case", ...fields]);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(r);
  }
  const challenges = [];
  for (const runs of groups.values()) {
    if (runs.length < 2) continue;
    const { case: name, file, platform } = runs[0];
    // Sort before summing so floating-point addition is independent of input order.
    const durations = runs.map((r) => r.ms).sort((a, b) => a - b);
    const wastedMs = durations.slice(1).reduce((sum, ms) => sum + ms, 0);
    const by = ordered(runs.filter((r) => "by" in r).map((r) => r.by));
    challenges.push({
      kind: "duplicate", owner: "case owner", case: name, file, platform,
      runs: runs.length, wastedMs, by,
      statement: `${name} ran ${runs.length} times on ${platform}; re-run by ${by.length ? by.join(", ") : "direct requests"}; ${wastedMs} ms beyond one run.`,
      next: by.length ? `Ask ${by.join(", ")} to read this execution's own run.` : `Run ${file} once and read that run.`,
      // Private ordering key is removed before returning evidence.
      identity: key(runs[0], ["case", ...fields]),
    });
  }
  challenges.sort((a, b) => b.wastedMs - a.wastedMs || compare(a.case, b.case) || compare(a.file, b.file) || compare(a.platform, b.platform) || compare(a.identity, b.identity));
  return {
    result: challenges.length ? "challenged" : "unchallenged",
    challenges: challenges.map(({ identity, ...challenge }) => challenge), findings: [],
    wastedMs: challenges.reduce((sum, c) => sum + c.wastedMs, 0),
  };
}

/** Plan distinct file executions; every requester reads the same unaltered observation. */
export function schedule(requests) {
  const findings = [];
  if (!Array.isArray(requests)) return { runs: [], reads: [], findings: ["requests must be a list"] };
  const seen = new Set();
  for (const q of requests) {
    if (!object(q)) { findings.push("request must be an object"); continue; }
    const label = `request ${text(q.by) ? q.by : "(unnamed)"}`;
    if (!text(q.by)) findings.push(`${label}: by must be nonempty text`);
    if (seen.has(q.by)) findings.push(`${label}: duplicate by`);
    seen.add(q.by);
    conditions(q, label, findings);
    if (!Array.isArray(q.files) || q.files.length === 0) { findings.push(`${label}: files must be a nonempty list`); continue; }
    for (const f of q.files) {
      if (!object(f)) { findings.push(`${label}: file must be an object`); continue; }
      if (!text(f.path)) findings.push(`${label}: file path must be nonempty text`);
      if (!digest(f.sha256)) findings.push(`${label}: file sha256 must be a SHA-256`);
    }
  }
  if (findings.length) return { runs: [], reads: [], findings: ordered(findings) };
  const groups = new Map();
  for (const q of requests) for (const f of q.files) {
    const run = { file: f.path, sha256: f.sha256, subject: q.subject, platform: q.platform, node: q.node };
    const id = key(run);
    if (!groups.has(id)) groups.set(id, { ...run, for: new Set() });
    groups.get(id).for.add(q.by);
  }
  const runs = [...groups.values()].sort(byIdentity).map((r) => ({ ...r, for: ordered([...r.for]) }));
  const reads = runs.flatMap((r, run) => r.for.map((by) => ({ by, file: r.file, run })))
    .sort((a, b) => compare(a.by, b.by) || compare(a.file, b.file) || a.run - b.run);
  return { runs, reads, findings: [] };
}
