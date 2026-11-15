// The HOTFIX trace judge (release/C31): one HOTFIX, one identified Defect.
// Two judgments are kept apart. Trace validity is structural: the Defect is recorded and names a
// reproducing Case that exists. Correction evidence is revision-bound: the Case RED against the
// baseline and GREEN against the corrected revision. The judge only reads facts; the caller supplies
// the lookups. It never answers PASS: the Case-to-Defect correspondence, minimality and unrelated
// work are for the reviewer and are always listed as not judged.

export const NOT_JUDGED = [
  'whether the Case corresponds to the Defect is not judged: the review decides it',
  'whether the correction is minimal is not judged: the diff and the review decide it',
  'whether the diff holds no unrelated work is not judged: the diff and the review decide it',
];

const rootOf = (path) => {
  const parts = String(path).split('/');
  return (parts[0] === 'packages' || parts[0] === 'engineering') && parts[1] ? `${parts[0]}/${parts[1]}` : parts[0];
};

// Evidence is usable only when it is bound to the revision it is read for.
const part = (evidence, key, rev) => {
  const p = evidence?.[key];
  if (!p || (p.result !== 'RED' && p.result !== 'GREEN')) return undefined;
  return p.rev === rev ? p : undefined;
};

export function judgeHotfixTrace(facts) {
  const { defects = [], paths = [], baseRev, headRev, lookupDefect, caseExists, caseEvidence } = facts ?? {};
  const findings = [];
  const attention = [];
  const notJudged = [...NOT_JUDGED];

  if (paths.length === 0) findings.push('the diff is empty: a HOTFIX changes something');
  if (defects.length === 0) findings.push('the HOTFIX names no Defect: a HOTFIX corrects one identified Defect');
  if (defects.length > 1) findings.push(`the HOTFIX names ${defects.length} Defects: a HOTFIX corrects one Defect`);

  let caseId;
  if (defects.length === 1) {
    const recorded = lookupDefect?.(defects[0]);
    if (!recorded) findings.push(`the Defect ${defects[0]} is not recorded`);
    else if (!Array.isArray(recorded.cases) || recorded.cases.length === 0) {
      findings.push(`the Defect ${defects[0]} names no reproducing Case`);
    } else {
      caseId = recorded.cases[0];
      for (const c of recorded.cases) {
        if (!caseExists?.(c)) findings.push(`the reproducing Case ${c} of ${defects[0]} does not exist`);
      }
    }
  }
  const trace = findings.length === 0 ? 'VALID' : 'BROKEN';

  const roots = [...new Set(paths.map(rootOf))];
  if (roots.length > 1) attention.push(`the diff spans ${roots.length} capability roots (${roots.join(', ')}): the HOTFIX justifies why one Defect needs them`);

  // Correction evidence. RED at the baseline is expected; GREEN at the head alone proves nothing.
  let correction = 'UNKNOWN';
  if (trace === 'VALID') {
    const evidence = caseEvidence?.(caseId);
    const base = part(evidence, 'baseline', baseRev);
    const head = part(evidence, 'head', headRev);
    if (head?.result === 'RED') {
      correction = 'NOT VERIFIED';
      findings.push(`the Case ${caseId} is still RED on the corrected head: the correction is not verified`);
    } else if (base?.result === 'GREEN') {
      correction = 'NOT VERIFIED';
      findings.push(`the Case ${caseId} is GREEN at the baseline: it did not reproduce the defect`);
    } else if (base?.result === 'RED' && head?.result === 'GREEN') {
      correction = 'VERIFIED';
    } else {
      notJudged.push(`the correction evidence of ${caseId} is missing or bound to another revision: RED at the baseline and GREEN at the corrected head are not both read`);
    }
  } else {
    notJudged.push('the correction evidence is not read: the trace is broken');
  }

  return { verdict: findings.length > 0 ? 'FAIL' : 'UNKNOWN', trace, correction, findings, attention, notJudged };
}
