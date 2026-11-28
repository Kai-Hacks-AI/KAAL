// Applies a mode to the answer of a check. Pure: it knows no repository, path or tool.
import { judgeRun } from '../ratchet.mjs';
export { applyBaseline } from '../ratchet.mjs';
const MODES = ['detective', 'preventive', 'ratchet'];
export function judgeMode({ mode, findings, baseline, previous } = {}) {
  if (!MODES.includes(mode)) return { mode, verdict: 'UNKNOWN', blocked: true, reason: 'no-mode' };
  const blocking = mode === 'preventive' || mode === 'ratchet';
  if (!Array.isArray(findings)) return { mode, verdict: 'UNKNOWN', blocked: blocking, reason: 'could-not-judge' };
  if (mode === 'detective') return { mode, verdict: findings.length ? 'REPORT' : 'PASS', blocked: false, findings };
  if (mode === 'preventive') return { mode, verdict: findings.length ? 'FAIL' : 'PASS', blocked: findings.length > 0, findings };
  return judgeRun({ findings, baseline, previous });
}
