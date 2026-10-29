// kaal-testing/model: Testing's kinds (Strategy, Plan, Suite, Case), their identities and
// relationships, Test Data ownership, and each Run's results and Plan evaluation (testing/C14).
// Models and Runs are plain data handed in; the module keeps none and imports nothing.
const DATUM = ["id", "version", "content", "external"];
const KEYS = {
  strategies: ["id", "plans"],
  plans: ["id", "version", "suites", "inapplicable", "data", "uses"],
  suites: ["id", "version", "cases", "data", "uses"],
  cases: ["id", "version", "tests", "data", "uses", "retired"],
};
const REF = { strategies: ["plans", "plans"], plans: ["suites", "suites"], suites: ["cases", "cases"] };
const RUN = ["id", "of", "outcomes", "provenance", "data", "runs"];
const OUTCOMES = ["passed", "failed", "skipped", "todo"];
const LISTS = { strategies: ["plans"], plans: ["suites", "uses"], suites: ["cases", "uses"], cases: ["tests", "uses"] };
const nonempty = (s) => typeof s === "string" && s !== "";
const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
/** A value as a finding names it, whatever it is: never coerced, so formatting cannot throw. */
const name = (x) => {
  if (typeof x === "string") return x;
  try { return JSON.stringify(x) ?? typeof x; } catch { return typeof x; }
};

/** The model as the functions read it: every list a list and every entry an object, with a finding for each shape that is not. */
function shape(m) {
  const f = [], out = {};
  if (!object(m)) { f.push("a model is an object"); return { f, m: out }; }
  for (const kind of Object.keys(m)) if (!Object.hasOwn(KEYS, kind)) f.push(`unknown key ${name(kind)}`);
  for (const kind of Object.keys(KEYS)) {
    if (m[kind] === undefined) continue;
    if (!Array.isArray(m[kind])) { f.push(`${name(kind)} must be a list`); continue; }
    out[kind] = [];
    for (const raw of m[kind]) {
      if (!object(raw)) { f.push(`${name(kind)}: ${name(raw)} is not a definition`); continue; }
      const e = { ...raw };
      for (const key of LISTS[kind]) {
        if (e[key] === undefined) continue;
        const ok = Array.isArray(e[key]) && e[key].every(nonempty);
        if (!ok) f.push(key === "tests" ? `${name(e.id)}: tests must be nonempty strings` : `${name(e.id)}: ${name(key)} must be a list of identities`);
        e[key] = Array.isArray(e[key]) ? e[key].filter(nonempty) : [];
      }
      for (const key of ["data", ...(kind === "plans" ? ["inapplicable"] : [])]) {
        if (e[key] === undefined) continue;
        if (!Array.isArray(e[key]) || !e[key].every(object)) f.push(`${name(e.id)}: ${name(key)} must be a list of objects`);
        e[key] = Array.isArray(e[key]) ? e[key].filter(object) : [];
      }
      out[kind].push(e);
    }
  }
  return { f, m: out };
}

/** A Run as the functions read it, or null, with a finding for each shape that is not one. */
function shapeRun(run, f) {
  if (!object(run)) { f.push(`run ${name(run)}: a Run is an object`); return null; }
  const r = { ...run };
  for (const key of ["outcomes", "provenance", "data"]) {
    if (r[key] === undefined) continue;
    if (!object(r[key])) { f.push(`run ${name(r.id)}: ${name(key)} must be an object`); r[key] = {}; }
  }
  if (r.runs !== undefined && !Array.isArray(r.runs)) { f.push(`run ${name(r.id)}: runs must be a list`); r.runs = []; }
  return r;
}

function index(m) {
  const f = [], seen = new Set(), ids = { strategies: new Map(), plans: new Map(), suites: new Map(), cases: new Map() }, data = new Map();
  for (const [kind, keys] of Object.entries(KEYS)) {
    for (const e of m[kind] ?? []) {
      for (const k of Object.keys(e)) if (!keys.includes(k)) f.push(`${name(e.id)}: unknown key ${name(k)}`);
      if (!nonempty(e.id)) f.push(`${name(e.id)}: not a valid identity`);
      else if (seen.has(e.id)) f.push(`${name(e.id)}: duplicate identity`);
      else { seen.add(e.id); ids[kind].set(e.id, e); }
      if (e.version !== undefined && !nonempty(e.version)) f.push(`${name(e.id)}: version must be a nonempty string`);
      if (kind === "cases" && e.retired !== undefined && e.retired !== true) f.push(`${name(e.id)}: retired is true or absent`);
      for (const d of e.data ?? []) {
        for (const k of Object.keys(d)) if (!DATUM.includes(k)) f.push(`${name(e.id)}: Test Data ${name(d.id)}: unknown key ${name(k)}`);
        if (!nonempty(d.id)) f.push(`${name(e.id)}: Test Data has no valid identity`);
        else if (seen.has(d.id)) f.push(`${name(d.id)}: duplicate identity`);
        else { seen.add(d.id); data.set(d.id, { owner: e.id, datum: d }); }
        if (Object.hasOwn(d, "content") && Object.hasOwn(d, "external")) f.push(`${name(d.id)}: content or external, not both`);
        if (Object.hasOwn(d, "external") && !nonempty(d.external)) f.push(`${name(d.id)}: external must be a nonempty string`);
      }
    }
  }
  return { f, ids, data };
}

export function check(model) {
  const { f: shaped, m } = shape(model);
  const { f: indexed, ids, data } = index(m);
  const f = [...shaped, ...indexed];
  for (const [kind, [key, target]] of Object.entries(REF)) for (const e of m[kind] ?? []) for (const r of e[key] ?? []) {
    if (!ids[target].has(r)) f.push(`${name(e.id)}: ${name(r)} is not declared`);
    else if (target === "cases" && ids.cases.get(r).retired) f.push(`${name(e.id)}: ${name(r)} is retired and not executable`);
  }
  for (const p of m.plans ?? []) for (const d of p.inapplicable ?? []) {
    if (!ids.cases.has(d.case)) f.push(`${name(p.id)}: ${name(d.case)} is not declared`);
    if (!nonempty(d.reason)) f.push(`${name(p.id)}: ${name(d.case)} is declared inapplicable without a reason`);
  }
  for (const x of m.strategies ?? []) if (!x.plans?.length) f.push(`${name(x.id)}: names no Plan`);
  for (const x of m.plans ?? []) if (!x.suites?.length) f.push(`${name(x.id)}: names no Suite`);
  for (const kind of ["plans", "suites", "cases"]) for (const e of m[kind] ?? []) for (const u of e.uses ?? []) if (!data.has(u)) f.push(`${name(e.id)}: Test Data ${name(u)} is not declared`);
  return f;
}

export function tested(model) {
  const { m } = shape(model);
  const out = new Map();
  for (const c of m.cases ?? []) if (!c.retired && nonempty(c.id)) for (const s of c.tests ?? []) out.set(s, [...(out.get(s) ?? []), c.id]);
  return Object.fromEntries([...out.keys()].sort().map((k) => [k, out.get(k).sort()]));
}

export function data(model) {
  const { m } = shape(model);
  const { data: d } = index(m);
  const out = Object.fromEntries([...d].sort(([a], [b]) => (a < b ? -1 : 1)).map(([id, { owner }]) => [id, { owner, usedBy: [] }]));
  for (const kind of ["plans", "suites", "cases"]) for (const e of m[kind] ?? []) if (nonempty(e.id)) for (const u of e.uses ?? []) if (Object.hasOwn(out, u)) out[u].usedBy.push(e.id);
  for (const v of Object.values(out)) v.usedBy.sort();
  return out;
}

function agg(rs) {
  if (rs.length === 0) return "unknown";
  if (rs.includes("failed")) return "failed";
  if (rs.includes("unknown")) return "unknown";
  if (rs.every((r) => r === "inapplicable")) return "inapplicable";
  return "passed";
}

/** Each Case's occurrences in a Run tree, per Suite: [{ suite, case, outcome }], each with the provenance in force. */
function walk(m, ix, given, f, inherited, suite, seen) {
  const occ = [];
  const run = shapeRun(given, f);
  if (!run) return { kind: null, occ };
  for (const k of Object.keys(run)) if (!RUN.includes(k)) f.push(`run ${name(run.id)}: unknown key ${name(k)}`);
  if (!nonempty(run.id)) f.push(`run ${name(run.id)}: not a valid identity`);
  else if (seen.has(run.id)) f.push(`run ${name(run.id)}: duplicate identity`);
  else seen.add(run.id);
  const provenance = { ...inherited, ...(run.provenance ?? {}) };
  const of = run.of;
  const kind = ix.ids.plans.has(of) ? "plan" : ix.ids.suites.has(of) ? "suite" : ix.ids.cases.has(of) ? "case" : null;
  if (!kind) { f.push(`run ${name(run.id)}: ${name(of)} is not a Plan, Suite or Case`); return { kind, occ }; }
  const declared = (kind === "plan" ? ix.ids.plans : kind === "suite" ? ix.ids.suites : ix.ids.cases).get(of).version;
  if (!Object.hasOwn(provenance, of)) f.push(`run ${name(run.id)}: provenance does not identify ${name(of)}`);
  // A Plan or Suite Run speaks only of the version it executed (testing/F31); a Case's mismatch is unknown below.
  else if (kind !== "case" && declared !== undefined && provenance[of] !== declared) f.push(`run ${name(run.id)}: provenance identifies ${name(of)} at ${name(provenance[of])}, not its declared version ${name(declared)}`);
  if (kind === "case" && ix.ids.cases.get(of).retired) f.push(`run ${name(run.id)}: ${name(of)} is retired and not executable`);
  const scope = kind === "plan" ? ix.ids.plans.get(of).suites ?? [] : kind === "suite" ? [of] : [suite];
  const casesOf = (s) => (s === undefined ? [of] : ix.ids.suites.get(s)?.cases ?? []);
  const within = new Set(kind === "case" ? [of] : scope.flatMap(casesOf));
  for (const d of Object.keys(run.data ?? {})) if (!ix.data.has(d)) f.push(`run ${name(run.id)}: Test Data ${name(d)} is not declared`);
  for (const [c, o] of Object.entries(run.outcomes ?? {})) {
    if (!within.has(c)) { f.push(`run ${name(run.id)}: ${name(c)} is outside ${name(of)}`); continue; }
    if (!OUTCOMES.includes(o)) { f.push(`run ${name(run.id)}: ${name(c)}: ${name(o)} is not an outcome`); continue; }
    const def = ix.ids.cases.get(c);
    if (!def) continue;
    if (def.retired) { f.push(`run ${name(run.id)}: ${name(c)} is retired and not executable`); continue; }
    let r = o === "passed" || o === "failed" ? o : "unknown";
    if (!Object.hasOwn(provenance, c)) { f.push(`run ${name(run.id)}: provenance does not identify ${name(c)}`); r = "unknown"; }
    else if (def.version !== undefined && provenance[c] !== def.version) r = "unknown";
    const suites = kind === "case" ? [suite] : scope.filter((s) => casesOf(s).includes(c));
    for (const s of suites) occ.push({ suite: s, case: c, r, ran: o === "passed" || o === "failed" });
  }
  for (const child of run.runs ?? []) {
    const ok = kind === "plan" ? ix.ids.suites.has(child?.of) && scope.includes(child.of) : kind === "suite" ? ix.ids.cases.has(child?.of) && within.has(child.of) : false;
    if (!ok) { f.push(`run ${name(run.id)}: ${name(object(child) ? child.of : child)} cannot run within ${name(of)}`); continue; }
    occ.push(...walk(m, ix, child, f, provenance, kind === "suite" ? of : undefined, seen).occ);
  }
  // A Suite or Case Run has a result for each Case it covers: one it did not observe is unknown in it (testing/F30).
  if (kind !== "plan") {
    const at = kind === "suite" ? of : suite;
    for (const c of within) if (ix.ids.cases.has(c) && !ix.ids.cases.get(c).retired && !occ.some((o) => o.case === c && o.suite === at)) occ.push({ suite: at, case: c, r: "unknown", ran: false });
  }
  return { kind, occ };
}

export function results(model, run) {
  const findings = check(model);
  const { m } = shape(model);
  const ix = index(m);
  const { kind, occ } = walk(m, ix, run, findings, {}, undefined, new Set());
  const target = object(run) ? run.of : undefined;
  const caseIds = kind === "plan" ? [...new Set((ix.ids.plans.get(target).suites ?? []).flatMap((s) => ix.ids.suites.get(s)?.cases ?? []))] : kind === "suite" ? ix.ids.suites.get(target).cases ?? [] : kind === "case" ? [target] : [];
  const live = caseIds.filter((c) => !ix.ids.cases.get(c)?.retired);
  const hits = (c, s) => occ.filter((o) => o.case === c && (s === undefined || o.suite === s));
  const of = (c, s) => hits(c, s).map((o) => o.r);
  const ran = (c, s) => hits(c, s).some((o) => o.ran);
  const suiteIds = kind === "plan" ? ix.ids.plans.get(target).suites ?? [] : kind === "suite" ? [target] : [];
  // In a Plan Run, a Case keeps a result per containing Suite, and its result aggregates them (testing/F30).
  const containing = (c) => suiteIds.filter((s) => (ix.ids.suites.get(s)?.cases ?? []).includes(c));
  const result = (c, inapplicable) => (kind === "plan" ? agg(containing(c).map((s) => (inapplicable && !ran(c, s) ? "inapplicable" : agg(of(c, s))))) : agg(of(c)));
  const cases = Object.fromEntries(live.map((c) => [c, result(c, false)]));
  const suites = Object.fromEntries(suiteIds.map((s) => [s, agg((ix.ids.suites.get(s)?.cases ?? []).filter((c) => live.includes(c)).map((c) => agg(of(c, s))))]));
  const plans = new Map();
  if (kind === "plan") {
    const p = ix.ids.plans.get(target);
    const decl = new Set((p.inapplicable ?? []).map((d) => d.case));
    const pc = Object.fromEntries(live.map((c) => [c, result(c, decl.has(c))]));
    const ps = Object.fromEntries(suiteIds.map((s) => [s, agg((ix.ids.suites.get(s)?.cases ?? []).filter((c) => live.includes(c)).map((c) => (decl.has(c) && !ran(c, s) ? "inapplicable" : agg(of(c, s)))))]));
    plans.set(target, { result: agg(Object.values(pc)), cases: pc, suites: ps });
  }
  return { run: object(run) ? run.id : undefined, of: target, cases, suites, plans: Object.fromEntries(plans), data: object(run) && object(run.data) ? { ...run.data } : {}, findings };
}

export function evaluate(model, run, given = {}) {
  const r = results(model, run);
  const findings = [...r.findings];
  const options = object(given) ? given : {};
  if (!object(given)) findings.push("evaluation options must be an object");
  for (const k of Object.keys(options)) if (k !== "allowances") findings.push(`${name(k)} is not an evaluation input`);
  const p = typeof r.of === "string" && Object.hasOwn(r.plans, r.of) ? r.plans[r.of] : undefined;
  if (!p) findings.push(`run ${name(r.run)}: ${name(r.of)} is not a Plan`);
  const cases = p ? p.cases : r.cases;
  const list = options.allowances ?? [];
  const allowed = [], stale = [];
  if (!Array.isArray(list)) findings.push("allowances must be a list");
  else for (const a of list) {
    if (!object(a) || typeof a.case !== "string" || a.cite === undefined) findings.push(`malformed allowance ${name(a)}`);
    else if (!Object.hasOwn(cases, a.case)) findings.push(`${name(a.case)} is outside ${name(r.of)}`);
  }
  const out = { run: r.run, plan: r.of, cases, suites: p ? p.suites : r.suites, allowed, stale, findings };
  if (findings.length) return { ...out, result: "unknown" };
  for (const a of list) (cases[a.case] === "failed" ? allowed : cases[a.case] === "unknown" ? [] : stale).push(a);
  const allow = new Set(allowed.map((a) => a.case));
  return { ...out, result: agg(Object.entries(cases).map(([c, v]) => (allow.has(c) ? "passed" : v))) };
}
