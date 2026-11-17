// Fixtures of release/C59: the agreed structure of release/C35, with one stage declaring an extra check.
import { GOOD } from '../C35-stages/helper.mjs';
export const EXTRA = 'analyze Vulnerabilities (Promoting)';
export { judge } from '../C35-stages/helper.mjs';
// the agreed structure where Promoting declares EXTRA and its ruleset requires it after its own check
export function declared() {
  const f = GOOD();
  f.stages.stages.find((s) => s.name === 'Promoting').also = [EXTRA];
  f.rulesets.Promoting.rules[0].parameters.required_status_checks = [
    { context: 'verify Stages (Promoting)', integration_id: 15368 },
    { context: EXTRA, integration_id: 15368 },
  ];
  return f;
}
