// Case release/T138 tests: F15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const cap = join(repo, 'engineering/release-management');
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/promotion.md');
const planTemplate = join(repo, '.github/PULL_REQUEST_TEMPLATE/plan.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
const headings = (text) => text.split('\n').filter((line) => line.startsWith('## ')).map((line) => line.slice(3).trim());
export const id = 'release/T138';
export const tests = ['release/F15'];
export const title = 'the hints of the promotion template state names only, the order of dependencies, and no status, approval or merge method';
export function run() {
  const text = read(template, 'the promotion template');
  const [, collector, delivers, order] = text.split(/^## .*$/m);
  assert.ok(/<collector>/.test(collector) && /<destination>/.test(collector), 'the Collector hint does not name source and destination');
  assert.ok(/<id> <PHASE>: <name>/.test(delivers) && /describe/i.test(delivers), 'the Delivers hint does not ask for names only');
  assert.ok(/companion promotion/i.test(order) && /synchroni[sz]ation/i.test(order) && /queue/i.test(order) && /none/.test(order), 'the Order hint does not name companion promotion, synchronization, queue and none');
  const lead = text.split(/^## /m)[0];
  assert.ok(/no .*merge method/i.test(lead) && /approval/i.test(lead) && /attribution/i.test(lead), 'the opening hint does not exclude merge method, approvals and attribution');
}
