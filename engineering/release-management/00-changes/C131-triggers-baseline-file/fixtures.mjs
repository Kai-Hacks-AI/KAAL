// Fixtures of release/C131. The judge of verify Triggers reads two baseline files as Git data, so a Case that builds two trees of workflows
// must also say what the baseline file of each side holds. `honest` gives the side an author who keeps the file in step with the workflows would:
// the base holds the findings of the base, the head holds the base's findings that the head still has. That is what the judge used to derive,
// so a Case of a verdict written before C131 keeps its meaning.
import { BASELINE, findingsOf, judge } from '../../05-src/triggers/verify-triggers.mjs';

export const BASELINE_PATH = BASELINE;
export function honest({ base, head }) {
  if (!base || !head || !Object.keys(base).length) return { base, head };
  const before = findingsOf(base);
  const after = findingsOf(head);
  return {
    base: { ...base, [BASELINE]: JSON.stringify(before) },
    head: { ...head, [BASELINE]: JSON.stringify(before.filter((f) => after.includes(f))) },
  };
}
export const judgeHonest = (sides) => judge(honest(sides));
