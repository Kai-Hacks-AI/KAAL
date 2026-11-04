// testing/A28: Testing derives evidence from caller-held history and verdicts only.
import { profile, DEFAULTS as TIMING } from "./timing.mjs";

export const DEFAULTS = Object.freeze({ window: 5, recur: 3 });
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const named = (x) => typeof x === "string" && x.trim().length > 0;
const version = (x) => typeof x === "string" && /^[0-9a-f]{64}$/.test(x);
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : sorted[mid - 1] / 2 + sorted[mid] / 2;
};
const empty = (findings = []) => ({ result: findings.length ? "unknown" : "unchallenged", candidates: [], refactors: [], unprofiled: [], findings: [...findings].sort(compare) });

function settings(given, findings) {
  if (given !== undefined && !object(given)) findings.push("redesign options must be an object");
  const read = { ...DEFAULTS };
  const entries = Object.entries(object(given) ? given : {});
  for (const [key, n] of entries) {
    if (Object.hasOwn(DEFAULTS, key)) {
      if (!Number.isInteger(n) || n < 1) findings.push(`${key} must be a whole number of 1 or more`);
      else read[key] = n;
    }
  }
  if (read.recur > read.window) findings.push("recur exceeds window");
  const timing = Object.fromEntries(entries.filter(([key]) => !Object.hasOwn(DEFAULTS, key)));
  // Ask the public timing interface to validate its options on a bounded, valid run.
  // minimum is a count schema; substituting one keeps this probe bounded even for a huge minimum.
  if (Object.hasOwn(timing, "minimum") && (!Number.isInteger(timing.minimum) || timing.minimum < 1)) findings.push("timing minimum must be a whole number of 1 or more");
  const probe = profile({ cases: [{ name: "option probe", ms: 1 }] }, { ...timing, minimum: 1 });
  if (probe.result === "unknown") findings.push(...probe.findings);
  return { ...read, timing, floor: timing.floor ?? TIMING.floor };
}

/** Learn recurring signals by current file version and platform (testing/F93–F95, F97). */
export function candidates(history, given) {
  const findings = [];
  const options = settings(given, findings);
  if (!Array.isArray(history)) return empty([...findings, "history must be a list, oldest first"]);
  // Read the complete history before deriving evidence: a malformed record cannot disappear.
  for (const [index, run] of history.entries()) {
    const where = `run ${index + 1}`;
    if (!object(run)) { findings.push(`${where} must be an object`); continue; }
    if (!named(run.platform)) findings.push(`${where} has no platform`);
    if (!Array.isArray(run.cases)) { findings.push(`${where} cases must be a list`); continue; }
    const seen = new Set();
    for (const c of run.cases) {
      if (!object(c) || !named(c.name)) { findings.push(`${where} has a case with no name`); continue; }
      if (seen.has(c.name)) findings.push(`${where} names ${c.name} twice`);
      seen.add(c.name);
      if (!version(c.sha256)) findings.push(`${where} ${c.name} has no file SHA-256 version`);
      if (!Number.isFinite(c.ms) || c.ms < 0) findings.push(`${where} ${c.name} has an unreadable duration`);
    }
  }
  if (findings.length) return empty(findings);
  const answer = empty();
  const platforms = new Map();
  for (const [index, run] of history.entries()) {
    const p = profile(run, options.timing);
    const profiled = p.result !== "unknown";
    if (!profiled) answer.unprofiled.push({ run: index + 1, platform: run.platform, findings: p.findings });
    const concentrated = new Set(p.challenges.filter((c) => c.kind === "concentration").flatMap((c) => c.cases));
    const outliers = new Set(p.challenges.filter((c) => c.kind === "outlier").map((c) => c.case));
    if (!platforms.has(run.platform)) platforms.set(run.platform, new Map());
    const cases = platforms.get(run.platform);
    for (const c of run.cases) {
      if (!cases.has(c.name)) cases.set(c.name, []);
      cases.get(c.name).push({ version: c.sha256, ms: c.ms, profiled,
        concentration: concentrated.has(c.name) && c.ms > options.floor, outlier: outliers.has(c.name) });
    }
  }
  for (const [platform, cases] of platforms) for (const [name, entries] of cases) {
    // Even an unprofiled latest run identifies the current bytes. Never fall back to an older version.
    const current = entries.at(-1).version;
    const recent = entries.filter((e) => e.profiled && e.version === current).slice(-options.window);
    const seen = recent.filter((e) => e.concentration || e.outlier).length;
    if (seen >= options.recur) answer.candidates.push({
      kind: "redesign", case: name, version: current, platform, seen, of: recent.length,
      signals: { concentration: recent.filter((e) => e.concentration).length, outlier: recent.filter((e) => e.outlier).length },
      medianMs: median(recent.map((e) => e.ms)), owner: "case owner",
      statement: `${name} was slow in ${seen} of its last ${recent.length} runs on ${platform}`,
      next: `redesign ${name} and record what was learned in the owning capability's PLAN`,
    });
    const previous = entries.findLast((e) => e.profiled && e.version !== current)?.version;
    if (previous !== undefined && recent.length) {
      const earlier = entries.filter((e) => e.profiled && e.version === previous).slice(-options.window);
      const beforeMs = median(earlier.map((e) => e.ms));
      const afterMs = median(recent.map((e) => e.ms));
      answer.refactors.push({ case: name, platform, from: previous, to: current, beforeMs, afterMs, runs: recent.length,
        shown: recent.length < options.recur ? "pending" : afterMs < beforeMs ? "faster" : "not faster" });
    }
  }
  answer.candidates.sort((a, b) => b.medianMs - a.medianMs || compare(a.case, b.case) || compare(a.platform, b.platform));
  answer.refactors.sort((a, b) => compare(a.case, b.case) || compare(a.platform, b.platform));
  answer.result = answer.candidates.length ? "challenged" : "unchallenged";
  return answer;
}

function caseVersion(given, where, findings) {
  if (!object(given)) { findings.push(`${where} must be a Case record`); return; }
  if (!named(given.id)) findings.push(`${where} has no Case id`);
  if (!version(given.version)) findings.push(`${where} has no file SHA-256 version`);
  if (!Array.isArray(given.tests) || !given.tests.length || [...given.tests].some((t) => !named(t))) findings.push(`${where} has no readable targets`);
  if (!object(given.verdicts) || Object.entries(given.verdicts).some(([subject, verdict]) => !named(subject) || !["pass", "fail"].includes(verdict))) findings.push(`${where} has unreadable verdicts`);
}

/** Compare behavioural evidence, independently of all timing (testing/F96–F97). */
export function refactored(before, after) {
  const findings = [];
  caseVersion(before, "before", findings);
  caseVersion(after, "after", findings);
  if (findings.length) return { result: "unknown", differences: [], findings: findings.sort(compare) };
  const verdicts = Object.values(before.verdicts);
  if (!verdicts.includes("pass") || !verdicts.includes("fail")) return { result: "unknown", differences: [], findings: ["earlier version has no discriminating RED and GREEN"] };
  const differences = [];
  if (before.id !== after.id) differences.push(`Case is ${after.id}, not ${before.id}`);
  if (before.version === after.version) differences.push("Case version is unchanged");
  const earlier = new Set(before.tests);
  const later = new Set(after.tests);
  for (const target of earlier) if (!later.has(target)) differences.push(`no longer tests ${target}`);
  for (const target of later) if (!earlier.has(target)) differences.push(`now also tests ${target}`);
  const colour = (v) => v === "pass" ? "GREEN" : "RED";
  for (const [subject, verdict] of Object.entries(before.verdicts)) {
    if (!Object.hasOwn(after.verdicts, subject)) differences.push(`not judged on ${subject}, where it was ${colour(verdict)}`);
    else if (after.verdicts[subject] !== verdict) differences.push(`${subject} is ${colour(after.verdicts[subject])}, where it was ${colour(verdict)}`);
  }
  return { result: differences.length ? "changed" : "kept", differences: differences.sort(compare), findings: [] };
}
