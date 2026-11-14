// engineering/C15: is a collector's capability a Capability that Core registers on main?
// Pure and report-only. It judges a branch name against evidence it is GIVEN; it reads no file,
// no Git and no network, and it enforces nothing (no ruleset, hook or workflow is part of it).
//
//   registrations  { claims: [{ scope, holder }], collisions: [scope] } from Core's Registration
//                  assembly over the files of the default branch's tip, or null when unreadable.
//   capabilities   Set of the names of the KAAL Capability Nodes Core admits there, or null.
//
// PASS needs a segment that is a registered, uncollided scope whose holder is an admitted
// Capability. Anything else with usable evidence is FAIL. Absent, empty, unreadable or ambiguous
// evidence is UNKNOWN, which never passes. A Node's name never stands in for a scope. A property
// such as `head` on the evidence is ignored on purpose: only the trusted main counts.

const COLLECTOR = /^kaal\/([^/]+)\/[^/]+(?:\/.*)?$/;

/** The verdict for one branch name. */
export function collectorCapability(ref, evidence) {
  const m = COLLECTOR.exec(String(ref));
  if (!m) return { ref, verdict: "FAIL", reason: "outside the form kaal/<capability>/<name>: a flat or legacy branch" };
  const segment = m[1];
  const { registrations, capabilities } = evidence ?? {};
  if (!registrations || !Array.isArray(registrations.claims) || registrations.claims.length === 0)
    return { ref, segment, verdict: "UNKNOWN", reason: "no Registration evidence from main" };
  if (!(capabilities instanceof Set) || capabilities.size === 0)
    return { ref, segment, verdict: "UNKNOWN", reason: "no admitted Capability Node evidence from main" };
  const claims = registrations.claims.filter((c) => c.scope === segment);
  if ((registrations.collisions ?? []).includes(segment) || claims.length > 1)
    return { ref, segment, verdict: "UNKNOWN", reason: `scope ${segment} is claimed by several holders` };
  if (segment === "old") return { ref, segment, verdict: "FAIL", reason: "legacy parking, not a capability" };
  if (claims.length === 0) return { ref, segment, verdict: "FAIL", reason: `no Registration on main claims scope ${segment}` };
  const [{ holder }] = claims;
  if (!capabilities.has(holder)) return { ref, segment, verdict: "FAIL", reason: `scope ${segment} is held by ${holder}, which is not an admitted Capability` };
  return { ref, segment, verdict: "PASS", reason: `scope ${segment} is held by the admitted Capability ${holder}` };
}

/**
 * The report over many branch names. Whatever does not pass is a migration finding, never
 * authorized. The exit status is always 0: this check is report-only.
 */
export function report(refs, evidence) {
  const results = refs.map((ref) => collectorCapability(ref, evidence));
  return {
    results,
    findings: results.filter((r) => r.verdict !== "PASS").map((r) => ({ ...r, authorized: false })),
    exitStatus: 0,
  };
}
