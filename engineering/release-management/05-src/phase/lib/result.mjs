// The answer of a judge: { verdict, applies, message, ... }. verdict is PASS, FAIL or UNKNOWN, and UNKNOWN never passes.
// applies says whether the judge had anything to judge. PASS with applies false is "nothing to judge here"; PASS with applies true is "judged, and fine".
// FAIL and UNKNOWN always apply: a judge that found a fault, or could not tell, is never a judge with nothing to judge.
// What a verdict does is the place's that asks the judge, not the judge's.

const VERDICTS = ['PASS', 'FAIL', 'UNKNOWN'];

// Make an answer. Anything that is not a verdict, or an applies that is not a boolean, or an applies false with a verdict other than PASS, is refused.
export function answer(verdict, applies, message, more = {}) {
  if (!VERDICTS.includes(verdict)) throw new Error(`not a verdict: ${verdict}`);
  if (typeof applies !== 'boolean') throw new Error('applies must be true or false');
  if (!applies && verdict !== 'PASS') throw new Error(`a ${verdict} always applies`);
  return { ...more, verdict, applies, message };
}

export const pass = (message, { applies, ...more }) => answer('PASS', applies, message, more);
export const fail = (message, more) => answer('FAIL', true, message, more);
export const unknown = (message, more) => answer('UNKNOWN', true, message, more);

// Is the collector's work in this judge's hands, judged and fine? Only a PASS that applies.
export const judgedAndFine = (r) => Boolean(r) && r.verdict === 'PASS' && r.applies === true;
