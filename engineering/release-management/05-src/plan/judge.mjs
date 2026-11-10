// verify Plan: judges whether a PLAN is valid. Returns PASS, FAIL or UNKNOWN with findings and a Recovery. UNKNOWN never passes.
import { report } from './report.mjs';
import { evaluate } from './rules.mjs';
import { index } from './resolve.mjs';

export async function judge(plan) {
  if (plan === null || typeof plan !== 'object' || plan.unreadable) {
    const input = plan && typeof plan === 'object' && typeof plan.unreadable === 'string' ? plan.unreadable : 'the plan';
    return report([{ rule: 'F1/8', id: input, status: 'unknown', message: `${input} is unreadable`, recovery: `Make ${input} readable and run verify Plan again.` }]);
  }
  return report(evaluate(plan, index(plan)));
}
