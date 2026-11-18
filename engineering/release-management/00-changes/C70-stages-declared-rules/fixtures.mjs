// Fixtures of release/C70: the agreed structure, with each branch stage declaring its rules as data.
import { GOOD } from '../C35-stages/helper.mjs';
export { judge } from '../C35-stages/helper.mjs';
// the controls the checkout declares, each with the Intents it has
export const CONTROLS = [{ id: 'release/CTL1', has: ['release/I27'] }, { id: 'release/CTL5', has: ['release/I30'] }, { id: 'release/CTL10', has: ['release/I36'] }, { id: 'release/CTL12', has: ['release/I37'] }, { id: 'release/CTL14', has: ['release/I42'] }];
const copy = (x) => JSON.parse(JSON.stringify(x));
const check = (name, control = 'release/CTL1') => ({ name, control, integration_id: 15368 });
const statusDeclared = (names, doNotEnforceOnCreate = true) => ({ type: 'required_status_checks', control: 'release/CTL1', parameters: { strict_required_status_checks_policy: false, do_not_enforce_on_create: doNotEnforceOnCreate }, settingControls: { strict_required_status_checks_policy: 'release/CTL14', do_not_enforce_on_create: 'release/CTL14' }, checks: names.map((n) => (typeof n === 'string' ? check(n) : n)) });
const statusSource = (names, doNotEnforceOnCreate = true) => ({ type: 'required_status_checks', parameters: { strict_required_status_checks_policy: false, do_not_enforce_on_create: doNotEnforceOnCreate, required_status_checks: names.map((n) => ({ context: typeof n === 'string' ? n : n.name, integration_id: 15368 })) } });
export const RULE = { type: 'pull_request', parameters: { required_approving_review_count: 1, dismiss_stale_reviews_on_push: true } };
export const OTHER = { type: 'non_fast_forward' };
// the agreed structure with Integrating declaring its checks and `extra` further rules, each { declared: {type, control}, source: {type, parameters?} }
export function declared(extra = []) {
  const f = GOOD();
  f.controls = copy(CONTROLS);
  const integrating = f.stages.stages.find((s) => s.name === 'Integrating');
  delete integrating.requires;
  integrating.rules = [statusDeclared(['verify Stages (Integrating)', 'verify Stages (Developing)']), ...extra.map((e) => copy(e.declared))];
  for (const part of integrating.parts) part.rules = [statusDeclared([`verify Stages (${part.name})`])];
  const promoting = f.stages.stages.find((s) => s.name === 'Promoting');
  delete promoting.also;
  promoting.rules = [statusDeclared(['verify Stages (Promoting)', check('analyze Vulnerabilities (Promoting)', 'release/CTL5')], false)];
  f.rulesets.Integrating.rules = [statusSource(['verify Stages (Integrating)', 'verify Stages (Developing)']), ...extra.map((e) => copy(e.source))];
  for (const n of ['Collecting', 'Hotfixing', 'Wiring']) f.rulesets[n].rules = [statusSource([`verify Stages (${n})`])];
  f.rulesets.Promoting.rules = [statusSource(['verify Stages (Promoting)', 'analyze Vulnerabilities (Promoting)'], false)];
  return f;
}
export const approval = { declared: { type: 'pull_request', control: 'release/CTL10', parameters: copy(RULE.parameters) }, source: copy(RULE) };
export const noForcePush = { declared: { type: 'non_fast_forward', control: 'release/CTL12', parameters: {} }, source: copy(OTHER) };
export const stageOf = (f, name) => f.stages.stages.find((s) => s.name === name);
