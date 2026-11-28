// The judge of the package lane (controls/F231). Pure: compareExpectations of testing does the comparing, this decides.
import { compareExpectations } from 'kaal-testing/expectations';

const caseOf = (id) => id.split(' > ').at(-1);

/** `changes` is the list of { id, open, cases } that changesOf gives; an entry must name an open Change and a Case that belongs to it. */
export function judgeLane({ report, register, changes = [] }) {
  for (const e of register.expected ?? []) if (typeof e.reference !== 'string' || !/^controls\/C\d+$/.test(e.reference)) throw new Error(`register entry ${e.id} has no reference naming a Change (controls/C<n>)`);
  const c = compareExpectations(report, register);
  const listed = new Set(register.expected.map((e) => e.id));
  const findings = [];
  if (!report.execution.complete) findings.push('incomplete');
  for (const e of c.notHolding) findings.push(`green:${e.id}`);
  for (const e of c.unconfirmed) findings.push(`error:${e.id}`);
  for (const e of c.absent) findings.push(`absent:${e.id}`);
  for (const e of c.unexpected) findings.push(`red:${e.id}`);
  for (const t of report.tests) if (t.actual === 'UNKNOWN' && !listed.has(t.id)) findings.push(`unknown:${t.id}`);
  for (const e of register.expected) {
    const change = changes.find((x) => x.id === e.reference);
    if (!change) findings.push(`nochange:${e.id}`);
    else if (!change.open) findings.push(`closed:${e.id}`);
    else if (!change.cases.includes(caseOf(e.id))) findings.push(`foreign:${e.id}`);
  }
  return { ok: findings.length === 0, findings, held: c.held.map((h) => h.id) };
}
