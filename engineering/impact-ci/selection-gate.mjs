// Selective entry point retains #764's target policy and fail-closed main behavior.
import { judgeExecution } from './execution-gate.mjs';
import { assuranceForTarget } from './target-policy.mjs';
import { judgeSelection } from './selection-contract.mjs';
export { judgeSelection };

export function judgeAggregate(expected, manifest, observations, context) {
  // Context comes independently from the runner event, never from the candidate manifest.
  const assurance = assuranceForTarget(context);
  if (assurance !== 'impact-aware') return {
    verdict: 'unresolved', stage: 'target', errors: [
      assurance === 'full-assurance'
        ? 'full assurance requires independent complete-matrix validation'
        : 'unknown target or event',
    ],
  };
  if (expected?.event !== context.event || expected?.baseRef !== context.baseRef)
    return { verdict: 'failed', stage: 'target', errors: ['target context mismatch'] };
  const selection = judgeSelection(expected, manifest);
  if (selection.verdict !== 'passed')
    return { ...selection, stage: 'selection' };
  return { ...judgeExecution(manifest, observations), stage: 'execution' };
}
