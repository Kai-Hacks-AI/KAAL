// kaal-testing/verifiers: the shared observable result contract every consumer verifier is held to
// (testing/C29, testing/F43–testing/F50). A publisher's harness makes each scenario's change in a fresh
// consumer, runs the package's own verifier, and judges what it showed against what it established itself.
// Pure: it reads nothing from a host, runs nothing, keeps nothing and imports nothing (testing/N9).
const RESULTS = ["verified", "failed", "unknown"];
const EXIT = { verified: 0, failed: 1, unknown: 2 };
const NEXT = ["precise", "diagnostic", "exploratory"];
const OUTCOMES = ["pass", "fail", "skipped", "todo", "not applicable", "not run"];
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const nonempty = (s) => typeof s === "string" && s !== "";
const names = (x) => Array.isArray(x) && x.length > 0 && x.every(nonempty);
const setEq = (a, b) => (a === undefined && b === undefined) || (Array.isArray(a) && Array.isArray(b) && a.every((x) => b.includes(x)) && b.every((x) => a.includes(x)));
/**
 * The applicability the harness established for `name`, when it explicitly excludes this run, with a reason:
 * a platform scope that excludes the run's platform; optional complements the case requires, at least one of
 * which the harness established absent from the consumer; or optional complements the case needs absent, at
 * least one of which the harness established present; or host facts, with https evidence, at least one of which
 * the harness established not holding on this host through Hosting (testing/F68, testing/F69). A host fact that
 * holds, is unknown, is inherited or was not established never makes a case not applicable, so the case runs
 * (testing/F70). No complement named is a required dependency. Otherwise null (testing/F47).
 */
function established(facts, name) {
  const a = Object.hasOwn(facts?.applicability ?? {}, name) ? facts.applicability[name] : null;
  if (!plain(a) || !nonempty(a.reason)) return null;
  if (a.platforms !== undefined && !names(a.platforms)) return null;
  const optional = (list) => names(list) && Array.isArray(facts.dependencies) && !list.some((c) => facts.dependencies.includes(c));
  if ((a.requires !== undefined && !optional(a.requires)) || (a.absent !== undefined && !optional(a.absent))) return null;
  if (a.host !== undefined && !(names(a.host) && typeof a.evidence === "string" && /^https:\/\/\S+$/.test(a.evidence))) return null;
  const is = (c, state) => Object.hasOwn(facts.complements ?? {}, c) && facts.complements[c] === state;
  const offPlatform = a.platforms !== undefined && !a.platforms.includes(facts.platform);
  const missing = a.requires !== undefined && a.requires.some((c) => is(c, "absent"));
  const present = a.absent !== undefined && a.absent.some((c) => is(c, "present"));
  const hosts = plain(facts.hostFacts) ? facts.hostFacts : {};
  const lacking = a.host !== undefined && a.host.some((f) => Object.hasOwn(hosts, f) && plain(hosts[f]) && hosts[f].holds === false);
  return offPlatform || missing || present || lacking ? a : null;
}
const same = (a, b) => plain(a) && plain(b) && a.reason === b.reason && setEq(a.platforms, b.platforms) && setEq(a.requires, b.requires) && setEq(a.absent, b.absent) && setEq(a.host, b.host) && a.evidence === b.evidence;

/** Each scenario: what the publisher's harness changes in a fresh consumer, and what every conforming verifier must then show. */
export const SCENARIOS = Object.freeze([
  { id: "clean", change: "nothing", result: "verified", cases: "pass" },
  { id: "no-case", change: "the package delivers no case, and its manifest declares none", result: "unknown", cases: "none" },
  { id: "manifest-absent", change: "the installed manifest is removed", result: "unknown", cases: "any" },
  { id: "manifest-malformed", change: "the installed manifest does not parse", result: "unknown", cases: "any" },
  { id: "case-missing", change: "the manifest declares a case the package does not deliver", result: "unknown", cases: "pass", target: "not run" },
  { id: "file-changed", change: "an installed file other than the manifest is changed", result: "unknown", cases: "any" },
  { id: "file-removed", change: "an installed file other than the manifest is removed", result: "unknown", cases: "any" },
  { id: "file-added", change: "a file is added to the installed copy", result: "unknown", cases: "any" },
  { id: "case-omitted", change: "on this platform, the package's runner leaves a delivered, declared case out, without declaring it not applicable", result: "unknown", cases: "pass", target: "not run" },
  { id: "case-substituted", change: "on this platform, the package's runner reports a stand-in under another identity in place of a declared case", result: "unknown", cases: "pass", target: "not run" },
  { id: "case-skipped", change: "a declared case is marked skipped", result: "unknown", cases: "pass", target: "skipped" },
  { id: "case-todo", change: "a declared case is marked todo", result: "unknown", cases: "pass", target: "todo" },
  { id: "not-applicable", change: "the manifest declares a case not applicable, with a reason, by a platform scope that excludes this platform or by a host fact, with its evidence, that the harness established not holding on this host", result: "verified", cases: "pass", target: "not applicable" },
  { id: "complement-absent", change: "the manifest declares a case applicable only with an optional complement installed, with a reason, and the consumer has not installed it", result: "verified", cases: "pass", target: "not applicable" },
  { id: "complement-present", change: "the manifest declares a case applicable only without an optional complement, with a reason, and the consumer has installed it", result: "verified", cases: "pass", target: "not applicable" },
  { id: "dependency-missing", change: "a required runtime dependency of the package is absent from the consumer", result: "unknown", cases: "any" },
  { id: "inapplicable-unsupported", change: "the manifest declares a case not applicable without a platform scope that excludes this platform, or without a reason", result: "unknown", cases: "pass", target: "not run" },
  { id: "case-failing", change: "a declared case fails", result: "failed", cases: "pass", target: "fail" },
  { id: "consumer-changed", change: "the consumer's content changes during the run", result: "failed", cases: "pass" },
].map(Object.freeze));

/**
 * The observation in a verifier's run: its exit status and its summary line, the one line starting with
 * `prefix`, read through `words`, the verifier's own word for each of verified, failed and unknown.
 */
export function observe({ exit, stdout } = {}, { prefix, words } = {}) {
  const findings = [];
  if (!nonempty(prefix)) findings.push("the verifier declares no summary prefix");
  if (!plain(words) || !RESULTS.every((r) => nonempty(words[r])) || new Set(RESULTS.map((r) => words[r])).size !== 3) findings.push("the verifier does not declare one distinct word for each of verified, failed and unknown");
  if (findings.length) return { observation: null, findings };
  const lines = String(stdout ?? "").split(/\r?\n/).filter((l) => l.startsWith(prefix));
  if (lines.length !== 1) return { observation: null, findings: [`the run printed ${lines.length} summary lines, not one`] };
  let s;
  try { s = JSON.parse(lines[0].slice(prefix.length)); } catch { return { observation: null, findings: ["the summary line does not hold JSON"] }; }
  if (!plain(s)) return { observation: null, findings: ["the summary is not an object"] };
  const result = RESULTS.find((r) => words[r] === s.result);
  if (!result) findings.push(`the summary's result ${JSON.stringify(s.result)} is none of the verifier's words`);
  return { observation: { exit, result: result ?? null, cause: s.cause, evidence: s.evidence, uncertainty: s.uncertainty, next: s.next, package: s.package, platform: s.platform, node: s.node, digest: s.digest, cases: s.cases }, findings };
}

/**
 * How a run's diagnosis disagrees with testing/F49: a run that is not verified reports its observation (cause),
 * the evidence that establishes a cause or its uncertainty, and a next step that claims no more than it knows.
 * The step's wording is the case owner's; Testing judges only its kind and whether the diagnosis justifies it.
 */
function diagnosis(result, o) {
  const out = [];
  const listed = (x) => Array.isArray(x) && x.length > 0 && x.every(nonempty);
  const has = { evidence: o.evidence !== undefined && o.evidence !== null, uncertainty: o.uncertainty !== undefined && o.uncertainty !== null, next: o.next !== undefined && o.next !== null };
  if (result === "verified") {
    if (has.next || has.uncertainty || has.evidence) out.push("a verified run reports a diagnosis");
    return out;
  }
  if (has.evidence && !listed(o.evidence)) out.push("evidence is not a list of statements");
  if (has.uncertainty && !nonempty(o.uncertainty)) out.push("uncertainty is not a statement");
  if (!has.evidence && !has.uncertainty) out.push("the run neither establishes its cause with evidence nor states its uncertainty");
  if (!plain(o.next) || !NEXT.includes(o.next.kind) || !nonempty(o.next.step)) out.push("the run names no next step of a kind the contract names");
  else if (o.next.kind === "precise" && has.uncertainty) out.push("a precise next step is claimed without an established cause");
  else if (o.next.kind === "exploratory" && o.next.step !== "analyze") out.push("an exploratory next step is not analyze");
  return out;
}

/**
 * Whether one observation conforms to a scenario, given the facts the publisher's harness established itself:
 * the package it installed, where, on which platform and Node, the digest it recomputed, the declared cases,
 * and the case the scenario targets. A label alone never conforms: every observable is compared.
 */
export function judge(scenarioId, observed, facts) {
  const s = SCENARIOS.find((x) => x.id === scenarioId);
  const differences = [];
  if (!s) return { scenario: scenarioId, conforms: false, differences: [`${JSON.stringify(scenarioId)} is not a scenario of the contract`] };
  const o = observed?.observation;
  if (!o) return { scenario: s.id, conforms: false, differences: ["no observation", ...(Array.isArray(observed?.findings) ? observed.findings : [])] };
  if (Array.isArray(observed.findings)) differences.push(...observed.findings);
  if (o.result !== s.result) differences.push(`result is ${o.result}, the scenario expects ${s.result}`);
  if (o.exit !== EXIT[s.result]) differences.push(`exit status is ${o.exit}, the scenario expects ${EXIT[s.result]}`);
  if (s.result === "verified" ? o.cause !== undefined && o.cause !== null : !nonempty(o.cause)) differences.push(s.result === "verified" ? "a verified run names a cause" : "the run names no cause");
  differences.push(...diagnosis(s.result, o));
  const pkg = plain(facts?.package) ? facts.package : {};
  const unestablished = [...["name", "version", "location"].filter((k) => !nonempty(pkg[k])).map((k) => `package ${k}`), ...["platform", "node", "digest"].filter((k) => !nonempty(facts?.[k]))];
  if (!Array.isArray(facts?.cases) || !facts.cases.every(nonempty) || (s.cases === "pass" && facts.cases.length === 0) || (s.cases === "none" && facts.cases.length > 0)) unestablished.push("declared cases");
  if (!Array.isArray(facts?.dependencies) || !facts.dependencies.every(nonempty)) unestablished.push("required dependencies");
  if (!plain(facts?.applicability)) unestablished.push("applicability");
  if (!plain(facts?.complements)) unestablished.push("complement states");
  if (s.target && !(nonempty(facts?.target) && Array.isArray(facts?.cases) && facts.cases.includes(facts.target))) unestablished.push("declared case the scenario targets");
  for (const f of unestablished) differences.push(`the harness established no ${f}`);
  for (const k of ["name", "version", "location"]) if (o.package?.[k] !== pkg[k]) differences.push(`package ${k} is ${JSON.stringify(o.package?.[k])}, the installed package's is ${JSON.stringify(pkg[k])}`);
  for (const k of ["platform", "node"]) if (o[k] !== facts?.[k]) differences.push(`${k} is ${JSON.stringify(o[k])}, the run's is ${JSON.stringify(facts?.[k])}`);
  if (!["manifest-absent", "manifest-malformed"].includes(s.id) && o.digest !== facts?.digest) differences.push(`digest is ${JSON.stringify(o.digest)}, the recomputed digest is ${JSON.stringify(facts?.digest)}`);
  const cases = Array.isArray(o.cases) ? o.cases : null;
  if (!cases || !cases.every((c) => plain(c) && nonempty(c.name) && OUTCOMES.includes(c.outcome))) differences.push("cases is not a list of { name, outcome }");
  else {
    const declared = Array.isArray(facts?.cases) ? facts.cases : [];
    const reported = cases.map((c) => c.name);
    if (new Set(reported).size !== reported.length) differences.push("a case is reported twice");
    if (s.cases === "pass") for (const d of declared) if (!reported.includes(d)) differences.push(`declared case ${d} is not reported`);
    if (s.cases === "pass") for (const c of cases) if (!declared.includes(c.name)) differences.push(`case ${c.name} is reported, and the manifest declares no such case`);
    if (s.cases === "none" && cases.length) differences.push("cases are reported where none is declared");
    for (const c of cases) if (c.outcome === "not applicable") {
      if (!same(c.applicability, established(facts, c.name))) differences.push(`case ${c.name} is claimed not applicable without the applicability excluding this run and the reason the harness established`);
    }
    if (s.cases === "pass") for (const c of cases) {
      const want = s.target && c.name === facts?.target ? s.target : "pass";
      if (c.outcome !== want) differences.push(`case ${c.name} is ${c.outcome}, the scenario expects ${want}`);
    }
  }
  return { scenario: s.id, conforms: differences.length === 0, differences };
}

/**
 * Whether one candidate's runs on its supported platforms show the same declared cases, each visible on every
 * platform, and what they establish together (testing/F56–testing/F58). `runs` holds one `{ observed, facts }`
 * per platform, as `observe` gave and the harness established. `supported` is the package's declared platforms.
 * `osBoundary` is true only for the capability that owns the operating-system boundary, Hosting, as the harness
 * established it; no other package may scope a case by platform (testing/F67). `challenged` names the cases on
 * which a challenge left an unresolved finding: Hosting's cross-capability suite or Engineering's enforcement.
 */
export function parity(runs, { supported, osBoundary = false, challenged = [] } = {}) {
  const findings = [];
  const list = Array.isArray(runs) ? runs.filter((r) => plain(r) && plain(r.facts)) : [];
  if (!Array.isArray(runs) || list.length !== runs.length || list.length === 0) findings.push("runs is not a list of { observed, facts }");
  if (!names(supported) || new Set(supported).size !== supported.length) findings.push("the harness established no supported platforms");
  if (typeof osBoundary !== "boolean") findings.push("the harness established no answer to whether the package is the operating-system boundary");
  if (!Array.isArray(challenged) || !challenged.every(nonempty)) findings.push("challenged is not a list of case names");
  const platforms = list.map((r) => r.facts.platform);
  if (names(supported)) {
    for (const p of supported) if (platforms.filter((x) => x === p).length !== 1) findings.push(`the supported platform ${p} has ${platforms.filter((x) => x === p).length} runs, not one`);
    for (const p of platforms) if (!supported.includes(p)) findings.push(`a run is on ${JSON.stringify(p)}, which the package does not support`);
  }
  const first = list[0]?.facts;
  const declared = Array.isArray(first?.cases) ? first.cases : [];
  for (const r of list) {
    const f = r.facts;
    if (!Array.isArray(f.cases) || !setEq(f.cases, declared) || f.cases.length !== declared.length) findings.push(`on ${f.platform} the declared cases differ`);
    for (const k of ["name", "version"]) if (f.package?.[k] !== first.package?.[k]) findings.push(`on ${f.platform} the package ${k} differs`);
    if (!nonempty(f.digest) || f.digest !== first.digest) findings.push(`on ${f.platform} the digest differs`);
  }
  if (declared.length === 0 || !declared.every(nonempty)) findings.push("no case is declared");
  const expected = names(supported) ? supported : [];
  const cases = declared.map((name) => ({ name, outcomes: Object.fromEntries(expected.map((p) => [p, "not run"])) }));
  const results = [];
  for (const r of list) {
    const p = r.facts.platform;
    const o = r.observed?.observation;
    if (!o) {
      findings.push(`on ${p} there is no observation`);
      for (const c of cases) c.outcomes[p] = "not run";
      continue;
    }
    results.push(o.result);
    const reported = Array.isArray(o.cases) ? o.cases.filter((c) => plain(c) && nonempty(c.name)) : [];
    for (const c of cases) {
      const seen = reported.filter((x) => x.name === c.name);
      if (seen.length !== 1) { findings.push(`on ${p} declared case ${c.name} is reported ${seen.length} times, not once`); c.outcomes[p] = "not run"; continue; }
      const outcome = seen[0].outcome;
      const a = outcome === "not applicable" ? established(r.facts, c.name) : null;
      if (outcome === "not applicable" && !same(seen[0].applicability, a)) {
        findings.push(`on ${p} case ${c.name} is not applicable without the applicability the harness established`);
        c.outcomes[p] = "not run";
      } else if (a && a.platforms !== undefined && osBoundary !== true) {
        findings.push(`on ${p} case ${c.name} is scoped by platform, and only the operating-system boundary may scope a case by platform`);
        c.outcomes[p] = "not run";
      } else c.outcomes[p] = OUTCOMES.includes(outcome) ? outcome : "not run";
    }
    for (const x of reported) if (!declared.includes(x.name)) findings.push(`on ${p} case ${x.name} is reported, and the manifest declares no such case`);
  }
  for (const c of cases) {
    const outs = Object.values(c.outcomes);
    if (outs.length > 0 && outs.every((x) => x === "not applicable")) findings.push(`case ${c.name} is not applicable on every platform, so it is exercised on none`);
    if (Array.isArray(challenged) && challenged.includes(c.name)) findings.push(`case ${c.name} has an unresolved challenge finding`);
  }
  if (Array.isArray(challenged)) for (const name of new Set(challenged)) if (!declared.includes(name)) findings.push(`${JSON.stringify(name)} has an unresolved challenge finding, and the manifest declares no such case`);
  const failed = results.includes("failed");
  const verified = findings.length === 0 && results.length === list.length && results.every((x) => x === "verified") && cases.every((c) => Object.values(c.outcomes).every((x) => x === "pass" || x === "not applicable"));
  return { result: failed ? "failed" : verified ? "verified" : "unknown", cases, findings };
}
