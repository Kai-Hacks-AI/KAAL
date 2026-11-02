// testing/A25: durations are caller observations. This module reads no host or clock.
export const DEFAULTS = Object.freeze({ share: 0.8, budget: 0.8, outlier: 10, floor: 1000, factor: 4, minimum: 5 });

const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const named = (x) => typeof x === "string" && x.trim().length > 0;
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : sorted[middle - 1] / 2 + sorted[middle] / 2;
};
const result = (challenges, findings) => ({
  result: findings.length ? "unknown" : challenges.length ? "challenged" : "unchallenged",
  challenges: findings.length ? [] : challenges,
  findings: [...findings].sort(compare),
});

function options(given, findings) {
  if (given === undefined) return { ...DEFAULTS };
  if (!object(given)) {
    findings.push("timing options must be an object");
    return { ...DEFAULTS };
  }
  const read = { ...DEFAULTS };
  for (const key of Object.keys(given).sort(compare)) {
    if (!Object.hasOwn(DEFAULTS, key)) {
      findings.push(`unknown timing option ${key}`);
      continue;
    }
    const n = given[key];
    const valid = Number.isFinite(n) && (
      key === "share" ? n > 0 && n < 1 :
      key === "budget" ? n >= 0 && n <= 1 :
      key === "floor" ? n >= 0 :
      key === "minimum" ? Number.isInteger(n) && n >= 1 : n > 1
    );
    if (!valid) findings.push(`timing option ${key} is out of range`);
    else read[key] = n;
  }
  return read;
}

function cases(run, settings, findings) {
  if (!object(run) || !Array.isArray(run.cases)) {
    findings.push("run cases must be a list");
    return [];
  }
  const seen = new Set();
  const read = [];
  if (run.cases.length < settings.minimum) findings.push(`run has fewer than ${settings.minimum} cases`);
  for (const c of run.cases) {
    if (!object(c) || !named(c.name)) {
      findings.push("case has no name");
      continue;
    }
    if (seen.has(c.name)) findings.push(`case ${c.name} is named twice`);
    seen.add(c.name);
    if (!Number.isFinite(c.ms) || c.ms < 0) findings.push(`case ${c.name} has unreadable duration ${String(c.ms)}`);
    else read.push({ name: c.name, ms: c.ms });
  }
  read.sort((a, b) => compare(a.name, b.name));
  const total = read.reduce((sum, c) => sum + c.ms, 0);
  if (total === 0) findings.push("run spent no time");
  if (!Number.isFinite(total)) findings.push("run total duration is not finite");
  return read;
}

/** Profile concentration and outliers in one run (testing/F79–F81, F83). */
export function profile(run, given) {
  const findings = [];
  const settings = options(given, findings);
  const read = cases(run, settings, findings);
  if (findings.length) return result([], findings);
  const challenges = [];
  const total = read.reduce((sum, c) => sum + c.ms, 0);
  // Restore an integral share lost only to floating-point representation (e.g. 10 * .2).
  const share = read.length * (1 - settings.share);
  const nearest = Math.round(share);
  const count = Math.max(1, Math.floor(Math.abs(share - nearest) <= Number.EPSILON * read.length ? nearest : share));
  const slowest = [...read].sort((a, b) => b.ms - a.ms || compare(a.name, b.name)).slice(0, count);
  const timeShare = slowest.reduce((sum, c) => sum + c.ms, 0) / total;
  if (timeShare > settings.budget) challenges.push({
    kind: "concentration", owner: "case owner", cases: slowest.map((c) => c.name),
    caseShare: slowest.length / read.length, timeShare,
    statement: `The slowest ${slowest.length} cases took ${timeShare} of the run's time`,
    next: "Investigate the owning suite's distribution and the slow Cases' design",
  });
  const typical = median(read.map((c) => c.ms));
  for (const c of read) {
    if (c.ms > settings.outlier * typical && c.ms > settings.floor) challenges.push({
      kind: "outlier", owner: "case owner", case: c.name, ms: c.ms, median: typical,
      statement: `${c.name} took ${c.ms} ms against the run's median ${typical} ms`,
      next: `Investigate ${c.name} with its Case owner`,
    });
  }
  return result(challenges, findings);
}

/** Compare the same Cases across platforms, without inferring a cause (testing/F82–F83). */
export function skew(runs, given) {
  const findings = [];
  const settings = options(given, findings);
  if (!Array.isArray(runs)) return result([], [...findings, "platform runs must be a list"]);
  if (runs.length < 2) findings.push("at least two platforms are required");
  const platforms = new Map();
  for (const run of runs) {
    if (!object(run) || !named(run.platform)) {
      findings.push("run has no platform");
      continue;
    }
    if (platforms.has(run.platform)) findings.push(`platform ${run.platform} is given twice`);
    const problems = [];
    const read = cases(run, settings, problems);
    findings.push(...problems.map((f) => `${run.platform}: ${f}`));
    platforms.set(run.platform, new Map(read.map((c) => [c.name, c.ms])));
  }
  if (findings.length) return result([], findings);
  const names = [...new Set([...platforms.values()].flatMap((r) => [...r.keys()]))].sort(compare);
  const ordered = [...platforms.keys()].sort(compare);
  for (const name of names) for (const platform of ordered) {
    if (!platforms.get(platform).has(name)) findings.push(`${name} did not run on ${platform}`);
  }
  if (findings.length) return result([], findings);
  const challenges = [];
  for (const name of names) for (const platform of ordered) {
    const ms = platforms.get(platform).get(name);
    const others = median(ordered.filter((p) => p !== platform).map((p) => platforms.get(p).get(name)));
    if (ms > settings.factor * others && ms > settings.floor) challenges.push({
      kind: "skew", owner: "case owner", case: name, platform, ms, others,
      statement: `${name} took ${ms} ms on ${platform}, against the other platforms' median ${others} ms`,
      next: `Investigate ${name} with its Case owner; consult Hosting for demonstrated host-specific causes`,
    });
  }
  return result(challenges, findings);
}
