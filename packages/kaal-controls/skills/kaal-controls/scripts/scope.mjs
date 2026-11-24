// Whole-tree evidence for a file-judging control. Pure: no file reads, no response chosen.
const stable = (list) => Array.isArray(list) && list.every((f) => typeof f === 'string') && new Set(list).size === list.length;

// Does the control's judgement of a change equal what the head adds over the base?
export function holdsProperty({ findingsOf, judge, base, head }) {
  const atBase = findingsOf(base);
  const atHead = findingsOf(head);
  if (!stable(atBase) || !stable(atHead)) return { holds: false, reason: 'unstable-findings' };
  const diff = atHead.filter((f) => !atBase.includes(f));
  const judged = judge(base, head);
  if (!stable(judged)) return { holds: false, reason: 'unstable-findings' };
  const onlyInJudge = judged.filter((f) => !diff.includes(f)).sort();
  const onlyInDiff = diff.filter((f) => !judged.includes(f)).sort();
  if (!onlyInJudge.length && !onlyInDiff.length) return { holds: true };
  return { holds: false, onlyInJudge, onlyInDiff };
}

// Is the evidence complete, and what did the whole-tree scan find? It is evidence for the
// CARE decision and nothing more: it proposes no response, baseline or history.
export function qualify({ property, provoked, scan } = {}) {
  if (!property || !provoked || !scan || !provoked.seeded || !provoked.removed || !Array.isArray(scan.findings)) return { verdict: 'UNKNOWN' };
  if (property.holds !== true) return { verdict: 'NOT_QUALIFIED', reason: 'property-fails' };
  if (provoked.seeded.found !== true || provoked.removed.cleared !== true) return { verdict: 'NOT_QUALIFIED', reason: 'not-provoked' };
  if (!stable(scan.findings)) return { verdict: 'NOT_QUALIFIED', reason: 'unstable-findings' };
  const findings = [...scan.findings].sort();
  return { verdict: 'QUALIFIED', findings, needs: findings.length ? 'review' : 'owner-go' };
}
