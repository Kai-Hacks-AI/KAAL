// verify Plan: judges whether a PLAN is valid. Returns PASS, FAIL or UNKNOWN with findings and a Recovery. UNKNOWN never passes.
import { report } from './report.mjs';
import { evaluate } from './rules.mjs';
import { index } from './resolve.mjs';

// The plan model is readable when every collection is a list of objects. Anything else is unavailable input, not a crash.
const COLLECTIONS = ['intents', 'requirements', 'architecture', 'defects', 'gaps', 'changes', 'cases', 'evidence'];
function unreadableParts(plan) {
  const parts = [];
  const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
  for (const name of COLLECTIONS) {
    if (plan[name] === undefined) continue;
    if (!Array.isArray(plan[name]) || !plan[name].every(isObject)) parts.push(name);
  }
  if (Array.isArray(plan.changes) && plan.changes.every(isObject) && plan.changes.some((change) => change.closes !== undefined && !Array.isArray(change.closes))) parts.push('changes.closes');
  return parts;
}

export async function judge(plan) {
  if (plan === null || typeof plan !== 'object' || plan.unreadable) {
    const input = plan && typeof plan === 'object' && typeof plan.unreadable === 'string' ? plan.unreadable : 'the plan';
    return report([{ rule: 'F1/8', id: input, status: 'unknown', message: `${input} is unreadable`, recovery: `Make ${input} readable and run verify Plan again.` }]);
  }
  const parts = unreadableParts(plan);
  if (parts.length > 0) {
    return report(parts.map((name) => ({ rule: 'F1/8', id: name, status: 'unknown', message: `${name} is not a list of objects`, recovery: `Make ${name} a list of objects and run verify Plan again.` })));
  }
  return report(evaluate(plan, index(plan)));
}
