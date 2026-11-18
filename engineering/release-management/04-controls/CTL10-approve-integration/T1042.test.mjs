// Case release/T1042 tests: release/CTL10
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const folder = (dir, p) => readdirSync(join(RM, dir)).find((n) => n.startsWith(p + '-'));
const read = (dir, p) => { const f = folder(dir, p); assert.ok(f && existsSync(join(RM, dir, f, p + '.md')), p + ' is absent from ' + dir); return readFileSync(join(RM, dir, f, p + '.md'), 'utf8'); };
const flat = (s) => s.replace(/\s+/g, ' ');
export const id = 'release/T1042';
export const tests = ['release/CTL10'];
export const title = 'release/CTL10 has the Intents I36 and I46, and the chain behind I46 holds: F63 serves I46 and A58 addresses F63';
export async function run() {
  const ctl = readFileSync(join(RM, '04-controls/CTL10-approve-integration/CTL10.md'), 'utf8');
  assert.match(ctl, /^has: \[release\/I36, release\/I46\]$/m, 'CTL10 does not have both Intents');
  assert.match(flat(ctl), /requires every review thread to be resolved/, 'CTL10 does not state the thread requirement');
  assert.match(read('01-intent', 'I46'), /^id: release\/I46$/m);
  assert.match(read('02-requirements', 'F63'), /^serves: \[release\/I46\]$/m, 'F63 does not serve I46');
  assert.match(read('03-architecture', 'A58'), /^addresses: \[release\/F63\]$/m, 'A58 does not address F63');
}
