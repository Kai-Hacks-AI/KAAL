// The step of a ratchet, told from the files. Pure: it reads no file, runs no command and knows no repository, Git ref or tool.
// The caller reads the baseline and the history at the base and at the head (as Git data, the base's never from the change
// under review) and passes their text, `null` for a file the revision does not have. The Changes the step carries come from the
// changed paths and never from a title or a body. The judgement of each step stays in `ratchet.mjs`; this chooses the step.
import { judgeAdoption, judgeProgress, judgeRetirement } from './ratchet.mjs';

const unknown = () => ({ verdict: 'UNKNOWN', reason: 'could-not-judge' });
const names = (x) => Array.isArray(x) && x.every((f) => typeof f === 'string' && f) && new Set(x).size === x.length;
const text = (x) => x === null || typeof x === 'string';
const time = (x) => typeof x === 'string' && !Number.isNaN(Date.parse(x));
const span = (w) => w !== null && typeof w === 'object' && !Array.isArray(w) && time(w.from) && time(w.to);

// One side: the baseline as a list (null when the file is absent) and the history as whole JSON lines (a missing file is an empty one).
// Anything unreadable gives null, which is never the same as absent.
function read(side) {
  if (!side || typeof side !== 'object' || !text(side.baseline) || !text(side.history)) return null;
  try {
    const baseline = side.baseline === null ? null : JSON.parse(side.baseline);
    if (baseline !== null && !names(baseline)) return null;
    const history = side.history === null ? [] : side.history.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
    if (!history.every((l) => l !== null && typeof l === 'object' && !Array.isArray(l))) return null;
    return { baseline, history, raw: side };
  } catch { return null; }
}

export function judgeRatchetStep({ base, head, carried, window } = {}) {
  // 1. Validation, before any shortcut: the same unreadable text on both sides is unknown, never unchanged.
  const b = read(base), h = read(head);
  if (!b || !h || !span(window) || !Array.isArray(carried)) return unknown();
  // 2. Nothing changed, or no ratchet on either side: nothing to judge and no Change is needed.
  if (b.raw.baseline === h.raw.baseline && b.raw.history === h.raw.history) return { verdict: 'PASS', step: 'unchanged' };
  if (h.baseline === null && b.baseline === null) return { verdict: 'PASS', step: 'unchanged' };
  // 3. The step.
  if (h.baseline === null) return { ...judgeRetirement({ base: { baseline: b.baseline, history: b.history }, head: { history: h.history } }), step: 'retirement' };
  if (carried.length !== 1) return unknown();
  const input = { base: { baseline: b.baseline, history: b.history }, head: { baseline: h.baseline, history: h.history }, change: carried[0], window };
  const adoption = b.baseline === null || (b.history.length === 0 && h.history.length > 0);
  return adoption ? { ...judgeAdoption(input), step: 'adoption' } : { ...judgeProgress(input), step: 'progress' };
}
