import { findControls } from './find-controls.mjs';
import { judgeEvidence } from './evidence.mjs';
export const DIRT = ['designed', 'implemented', 'running', 'tested'];
// Without records the check only reads declarations. With records, every control that claims `tested` must have its minimum met.
export function checkControls(files, records = null) {
  const { controls } = findControls(files);
  const problems = controls.flatMap((c) => c.problems.map((p) => ({ path: c.path, id: c.id, ...p })));
  for (const c of records ? controls.filter((x) => x.status === 'tested' && x.valid) : []) {
    const v = judgeEvidence(c, records);
    if (v.verdict !== 'PASS') problems.push({ path: c.path, id: c.id, field: 'status', reason: `tested is not shown: ${v.reason}`, recovery: 'Record the evidence the control declares as its minimum, or claim running until it is recorded. See references/judging-status.md.' });
  }
  return { ok: problems.length === 0, controls, problems };
}
