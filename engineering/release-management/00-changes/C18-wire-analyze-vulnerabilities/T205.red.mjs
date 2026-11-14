// Case release/T205 tests: G59
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const wiring = join(repo, 'engineering/release-management/05-src/wiring');
const list = (dir, ext) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(ext)).sort() : []);
export const id = 'release/T205';
export const tests = ['release/G59'];
export const title = 'gap release/G59 is closed: the wiring source area holds many controls side by side, named by control and target';

export const workflowName = (f) => /^[a-z][a-z0-9-]*-(integration|promotion|publishing)\.yml$/.test(f);
export const rulesetName = (f) => /^(integration|promotion|publishing)\.json$/.test(f);
export function run() {
  assert.equal(workflowName('analyze-vulnerabilities-promotion.yml'), true);
  assert.equal(workflowName('another-control-integration.yml'), true, 'a second control cannot sit beside the first');
  assert.equal(workflowName('promotion.yml'), false);
  assert.equal(rulesetName('promotion.json'), true);
  assert.equal(rulesetName('analyze-vulnerabilities.json'), false);
  const w = list(join(wiring, 'workflows'), '.yml');
  const r = list(join(wiring, 'rulesets'), '.json');
  assert.ok(w.length > 0 && r.length > 0, 'the wiring source area is empty');
  for (const f of w) assert.ok(workflowName(f), `${f} is not named by control and target`);
  for (const f of r) assert.ok(rulesetName(f), `${f} is not named by target`);
}
