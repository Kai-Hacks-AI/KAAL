// The aggregate's two pure functions (guard/A23): plan and fold. They read no file, run nothing and know
// no mode, flag or evidence (guard/N16). fold is the only place the pass rule lives (guard/F46).

/** The outcomes of a check's report that satisfy the fold: guard/F2's pass, shown as such, not applicable and held. */
const SATISFIED = new Set(["pass", "not applicable", "held"]);

/** The plan: the expected set, the matrix over it and what each check is judged by. Empty is not a plan (guard/F45). */
export function plan({ aggregate, run, head, always, registrations, scripts }) {
  const chosen = registrations.filter((r) => r.aggregates.includes(aggregate));
  const expected = [...new Set([...always, ...chosen.map((r) => r.id)])].sort();
  const unknown = always.filter((id) => !registrations.some((r) => r.id === id));
  return {
    problem: unknown.length > 0 ? `the always list names ${unknown.join(", ")}, which no guard.json registers` : expected.length === 0 ? `the ${aggregate} aggregate expects no check` : undefined,
    plan: {
      aggregate, run, head, expected,
      matrix: { include: expected.map((check) => ({ check })) },
      scripts: Object.fromEntries(expected.map((id) => [id, scripts[id]])),
      registrations: Object.fromEntries(chosen.concat(registrations.filter((r) => expected.includes(r.id) && !r.aggregates.includes(aggregate))).map((r) => [r.id, r.file])),
    },
  };
}

/**
 * The fold: passes only when the reported set equals the expected set exactly and every report is a
 * success of this run, of the judged revision and of the script the plan names (guard/F46). Every
 * finding names the check, the differing member and what to do.
 */
export function fold(plan, reports) {
  const findings = [];
  const expected = new Set(plan.expected ?? []);
  if (expected.size === 0) return { ok: false, findings: [{ check: "-", member: "expected", finding: "the plan expects no check", fix: "run kaal-guard plan again and give fold its plan file" }] };
  const seen = new Map();
  for (const r of reports) {
    if (seen.has(r.check)) findings.push({ check: r.check, member: "check", finding: `two reports name ${r.check}`, fix: "keep one report per check in the reports directory" });
    seen.set(r.check, r);
  }
  for (const id of [...expected].sort()) {
    const r = seen.get(id);
    const where = plan.registrations?.[id];
    if (!r) { findings.push({ check: id, member: "report", file: where, finding: `${id} has no report: it did not run, or its report was not collected`, fix: `run the ${id} job again, then fold` }); continue; }
    for (const member of ["run", "head"]) {
      if (r[member] !== plan[member]) findings.push({ check: id, member, file: where, finding: `${id} reports ${member} ${JSON.stringify(r[member])}, the plan judges ${JSON.stringify(plan[member])}: the report is stale or of another revision`, fix: `run the ${id} job again on this run and revision` });
    }
    if (r.script !== plan.scripts?.[id]) findings.push({ check: id, member: "script", file: where, finding: `${id} executed script ${JSON.stringify(r.script)}, the plan judges ${JSON.stringify(plan.scripts?.[id])}`, fix: `run the package's own npm test, then fold` });
    if (!SATISFIED.has(r.result)) findings.push({ check: id, member: "result", file: where, finding: `${id} result is ${JSON.stringify(r.result)}${r.finding ? `: ${r.finding}` : ""}`, fix: r.fix ?? `reproduce it with npm test in the folder of ${where ?? id}` });
  }
  for (const id of [...seen.keys()].sort()) {
    if (!expected.has(id)) findings.push({ check: id, member: "check", finding: `${id} reported but the plan does not expect it`, fix: "an unexpected report is a changed plan: run kaal-guard plan again, or remove the report" });
  }
  return { ok: findings.length === 0, findings };
}
