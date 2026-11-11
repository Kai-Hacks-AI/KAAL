// Case release/T138 tests: F15
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const template = join(repo, '.github/PULL_REQUEST_TEMPLATE/promotion.md');
const read = (path, what) => { assert.ok(existsSync(path), `${what} is absent`); return readFileSync(path, 'utf8'); };
export const id = 'release/T138';
export const tests = ['release/F15'];
export const title = 'the hints of the promotion template ask for the stable id and phases, a reason for every named relevant Change, and exclude source, destination, status, approval, merge method and attribution';
export function run() {
  const text = read(template, 'the promotion template');
  const [lead, change, why] = text.split(/^## .*$/m);
  assert.ok(/<id> <name>: <phases/.test(change) && /stable id/i.test(change) && /describe/i.test(change), 'the Change hint does not ask for the stable id, the phases and no description');
  assert.ok(/now/i.test(why) && /later/i.test(why) && /(unblock|enable)/i.test(why) && /reason/i.test(why), 'the Why now hint does not ask for what delivering now makes possible and a reason for every named Change');
  assert.ok(/only/i.test(why) && /precedence/i.test(why) && /(backlog|history|earlier)/i.test(why), 'the Why now hint does not limit the named Changes to relevant ones, allow precedence as a reason and exclude backlog and history');
  assert.ok(/source|destination/i.test(lead) && /approval/i.test(lead) && /merge method/i.test(lead) && /attribution/i.test(lead), 'the opening hint does not exclude source, destination, approvals, merge method and attribution');
}
