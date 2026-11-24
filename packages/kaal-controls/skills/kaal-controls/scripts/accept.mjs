// Judges whether delivery may be permitted given control results and the acceptances in force.
// An accepted failure stays FAIL; an acceptance covers only its own control and Test Case.
const str = (x) => typeof x === 'string' && x.trim() !== '';
const FIELDS = ['control', 'testCase', 'defect', 'owner', 'reason'];

export function judgeAcceptance({ results, acceptances } = {}) {
  if (!Array.isArray(results) || !Array.isArray(acceptances)) return { verdict: 'UNKNOWN' };
  const reasons = [];
  const valid = [];
  for (const a of acceptances) {
    if (!FIELDS.every((f) => str(a?.[f]))) reasons.push({ kind: 'bad-acceptance', control: a?.control, testCase: a?.testCase });
    else if (!a.voided) valid.push(a);
  }
  const used = new Set();
  const report = results.map((r) => {
    const cited = r.status === 'FAIL' && Array.isArray(r.failing) ? r.failing : [];
    const uncovered = cited.filter((t) => {
      const covering = valid.filter((a) => a.control === r.control && a.testCase === t);
      covering.forEach((a) => used.add(a));
      return covering.length === 0;
    });
    return { control: r.control, status: r.status, accepted: r.status === 'FAIL' && cited.length > 0 && uncovered.length === 0, uncovered };
  });
  const blocked = report.some((e) => e.status === 'UNKNOWN' || (e.status === 'FAIL' && !e.accepted));
  const unused = acceptances.filter((a) => !used.has(a) && (a.voided || valid.includes(a)));
  return { verdict: blocked ? 'BLOCK' : 'PERMIT', report, unused, reasons };
}
