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
const nonempty = (s) => typeof s === "string" && s !== "";

function index(m) {
  const f = [], seen = new Set(), ids = { strategies: new Map(), plans: new Map(), suites: new Map(), cases: new Map() }, data = new Map();
  for (const kind of Object.keys(m)) if (!Object.hasOwn(KEYS, kind)) f.push(`unknown key ${kind}`);
  for (const [kind, keys] of Object.entries(KEYS)) {
    for (const e of m[kind] ?? []) {
      for (const k of Object.keys(e)) if (!keys.includes(k)) f.push(`${e.id}: unknown key ${k}`);
      if (!nonempty(e.id)) f.push(`${e.id}: not a valid identity`);
      else if (seen.has(e.id)) f.push(`${e.id}: duplicate identity`);
      else { seen.add(e.id); ids[kind].set(e.id, e); }
      if (e.version !== undefined && !nonempty(e.version)) f.push(`${e.id}: version must be a nonempty string`);
      if (kind === "cases" && e.tests !== undefined && (!Array.isArray(e.tests) || !e.tests.every(nonempty))) f.push(`${e.id}: tests must be nonempty strings`);
      if (kind === "cases" && e.retired !== undefined && e.retired !== true) f.push(`${e.id}: retired is true or absent`);
      for (const d of e.data ?? []) {
        for (const k of Object.keys(d ?? {})) if (!DATUM.includes(k)) f.push(`${e.id}: Test Data ${d.id}: unknown key ${k}`);
        if (!nonempty(d?.id)) f.push(`${e.id}: Test Data has no valid identity`);
        else if (seen.has(d.id)) f.push(`${d.id}: duplicate identity`);
        else { seen.add(d.id); data.set(d.id, { owner: e.id, datum: d }); }
        if (d && "content" in d && "external" in d) f.push(`${d.id}: content or external, not both`);
        if (d && "external" in d && !nonempty(d.external)) f.push(`${d.id}: external must be a nonempty string`);
      }
    }
  }
  return { f, ids, data };
}

export function check(m) {
  const { f, ids, data } = index(m);
  for (const [kind, [key, target]] of Object.entries(REF)) for (const e of m[kind] ?? []) for (const r of e[key] ?? []) {
    if (!ids[target].has(r)) f.push(`${e.id}: ${r} is not declared`);
    else if (target === "cases" && ids.cases.get(r).retired) f.push(`${e.id}: ${r} is retired and not executable`);
  }
  for (const p of m.plans ?? []) for (const d of p.inapplicable ?? []) {
    if (!ids.cases.has(d?.case)) f.push(`${p.id}: ${d?.case} is not declared`);
    if (!nonempty(d?.reason)) f.push(`${p.id}: ${d?.case} is declared inapplicable without a reason`);
  }
  for (const x of m.strategies ?? []) if (!x.plans?.length) f.push(`${x.id}: names no Plan`);
  for (const x of m.plans ?? []) if (!x.suites?.length) f.push(`${x.id}: names no Suite`);
  for (const kind of ["plans", "suites", "cases"]) for (const e of m[kind] ?? []) for (const u of e.uses ?? []) if (!data.has(u)) f.push(`${e.id}: Test Data ${u} is not declared`);
  return f;
}

export function tested(m) {
  const out = new Map();
  for (const c of m.cases ?? []) if (!c.retired) for (const s of c.tests ?? []) out.set(s, [...(out.get(s) ?? []), c.id]);
  return Object.fromEntries([...out.keys()].sort().map((k) => [k, out.get(k).sort()]));
}

export function data(m) {
  const { data: d } = index(m);
  const out = Object.fromEntries([...d].sort(([a], [b]) => (a < b ? -1 : 1)).map(([id, { owner }]) => [id, { owner, usedBy: [] }]));
  for (const kind of ["plans", "suites", "cases"]) for (const e of m[kind] ?? []) for (const u of e.uses ?? []) if (Object.hasOwn(out, u)) out[u].usedBy.push(e.id);
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
function walk(m, ix, run, f, inherited, suite, seen) {
  const occ = [];
  for (const k of Object.keys(run ?? {})) if (!RUN.includes(k)) f.push(`run ${run.id}: unknown key ${k}`);
  if (!nonempty(run?.id)) f.push(`run ${run?.id}: not a valid identity`);
  else if (seen.has(run.id)) f.push(`run ${run.id}: duplicate identity`);
  else seen.add(run.id);
  const provenance = { ...inherited, ...(run?.provenance ?? {}) };
  const of = run?.of;
  const kind = ix.ids.plans.has(of) ? "plan" : ix.ids.suites.has(of) ? "suite" : ix.ids.cases.has(of) ? "case" : null;
  if (!kind) { f.push(`run ${run?.id}: ${of} is not a Plan, Suite or Case`); return { kind, occ }; }
  if (!Object.hasOwn(provenance, of)) f.push(`run ${run.id}: provenance does not identify ${of}`);
  if (kind === "case" && ix.ids.cases.get(of).retired) f.push(`run ${run.id}: ${of} is retired and not executable`);
  const scope = kind === "plan" ? ix.ids.plans.get(of).suites ?? [] : kind === "suite" ? [of] : [suite];
  const casesOf = (s) => (s === undefined ? [of] : ix.ids.suites.get(s)?.cases ?? []);
  const within = new Set(kind === "case" ? [of] : scope.flatMap(casesOf));
  for (const d of Object.keys(run.data ?? {})) if (!ix.data.has(d)) f.push(`run ${run.id}: Test Data ${d} is not declared`);
  for (const [c, o] of Object.entries(run.outcomes ?? {})) {
    if (!within.has(c)) { f.push(`run ${run.id}: ${c} is outside ${of}`); continue; }
    if (!OUTCOMES.includes(o)) { f.push(`run ${run.id}: ${c}: ${JSON.stringify(o)} is not an outcome`); continue; }
    const def = ix.ids.cases.get(c);
    if (!def) continue;
    if (def.retired) { f.push(`run ${run.id}: ${c} is retired and not executable`); continue; }
    let r = o === "passed" || o === "failed" ? o : "unknown";
    if (!Object.hasOwn(provenance, c)) { f.push(`run ${run.id}: provenance does not identify ${c}`); r = "unknown"; }
    else if (def.version !== undefined && provenance[c] !== def.version) r = "unknown";
    const suites = kind === "case" ? [suite] : scope.filter((s) => casesOf(s).includes(c));
    for (const s of suites) occ.push({ suite: s, case: c, r, ran: o === "passed" || o === "failed" });
  }
  for (const child of run.runs ?? []) {
    const ok = kind === "plan" ? ix.ids.suites.has(child?.of) && scope.includes(child.of) : kind === "suite" ? ix.ids.cases.has(child?.of) && within.has(child.of) : false;
    if (!ok) { f.push(`run ${run.id}: ${child?.of} cannot run within ${of}`); continue; }
    occ.push(...walk(m, ix, child, f, provenance, kind === "suite" ? of : undefined, seen).occ);
  }
  return { kind, occ };
}

export function results(m, run) {
  const findings = check(m);
  const ix = index(m);
  const { kind, occ } = walk(m, ix, run, findings, {}, undefined, new Set());
  const caseIds = kind === "plan" ? [...new Set((ix.ids.plans.get(run.of).suites ?? []).flatMap((s) => ix.ids.suites.get(s)?.cases ?? []))] : kind === "suite" ? ix.ids.suites.get(run.of).cases ?? [] : kind === "case" ? [run.of] : [];
  const live = caseIds.filter((c) => !ix.ids.cases.get(c)?.retired);
  const hits = (c, s) => occ.filter((o) => o.case === c && (s === undefined || o.suite === s));
  const of = (c, s) => hits(c, s).map((o) => o.r);
  const ran = (c, s) => hits(c, s).some((o) => o.ran);
  const suiteIds = kind === "plan" ? ix.ids.plans.get(run.of).suites ?? [] : kind === "suite" ? [run.of] : [];
  // In a Plan Run, a Case keeps a result per containing Suite, and its result aggregates them (testing/F30).
  const containing = (c) => suiteIds.filter((s) => (ix.ids.suites.get(s)?.cases ?? []).includes(c));
  const result = (c, inapplicable) => (kind === "plan" ? agg(containing(c).map((s) => (inapplicable && !ran(c, s) ? "inapplicable" : agg(of(c, s))))) : agg(of(c)));
  const cases = Object.fromEntries(live.map((c) => [c, result(c, false)]));
  const suites = Object.fromEntries(suiteIds.map((s) => [s, agg((ix.ids.suites.get(s)?.cases ?? []).filter((c) => live.includes(c)).map((c) => agg(of(c, s))))]));
  const plans = {};
  if (kind === "plan") {
    const p = ix.ids.plans.get(run.of);
    const decl = new Set((p.inapplicable ?? []).map((d) => d.case));
    const pc = Object.fromEntries(live.map((c) => [c, result(c, decl.has(c))]));
    const ps = Object.fromEntries(suiteIds.map((s) => [s, agg((ix.ids.suites.get(s)?.cases ?? []).filter((c) => live.includes(c)).map((c) => (decl.has(c) && !ran(c, s) ? "inapplicable" : agg(of(c, s)))))]));
    plans[run.of] = { result: agg(Object.values(pc)), cases: pc, suites: ps };
  }
  return { run: run?.id, of: run?.of, cases, suites, plans, data: { ...(run?.data ?? {}) }, findings };
}

export function evaluate(m, run, options = {}) {
  const r = results(m, run);
  const findings = [...r.findings];
  for (const k of Object.keys(options)) if (k !== "allowances") findings.push(`${k} is not an evaluation input`);
  const p = r.plans[run?.of];
  if (!p) findings.push(`run ${run?.id}: ${run?.of} is not a Plan`);
  const cases = p ? p.cases : r.cases;
  const list = options.allowances ?? [];
  const allowed = [], stale = [];
  if (!Array.isArray(list)) findings.push("allowances must be a list");
  else for (const a of list) {
    if (typeof a?.case !== "string" || a.cite === undefined) findings.push(`malformed allowance ${JSON.stringify(a)}`);
    else if (!Object.hasOwn(cases, a.case)) findings.push(`${a.case} is outside ${run?.of}`);
  }
  const out = { run: run?.id, plan: run?.of, cases, suites: p ? p.suites : r.suites, allowed, stale, findings };
  if (findings.length) return { ...out, result: "unknown" };
  for (const a of list) (cases[a.case] === "failed" ? allowed : cases[a.case] === "unknown" ? [] : stale).push(a);
  const allow = new Set(allowed.map((a) => a.case));
  return { ...out, result: agg(Object.entries(cases).map(([c, v]) => (allow.has(c) ? "passed" : v))) };
}
