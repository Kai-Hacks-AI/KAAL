// Case release/T1253 tests: release/F79
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
const RM = join(repo, 'engineering/release-management');
const draft = (name) => readFileSync(join(RM, '00-changes/C102-inspector-app/interface.md'), 'utf8').split(new RegExp(`^## Draft of ${name.replace('.', '\\.')}$`, 'm'))[1].match(/^`````\n([\s\S]*?)\n`````$/m)[1];
const MANIFEST = join(RM, '05-src/inspector/app.json');
const WRITE = /^(write|admin)$/;
const ALLOWED = { checks: 'write', contents: 'read', pull_requests: 'read', metadata: 'read' };
// The judgement of a manifest: the list of what it holds beyond the least privilege. Empty means it holds only that.
const problems = (m) => {
  const out = [];
  const perms = m.default_permissions ?? {};
  for (const [k, v] of Object.entries(perms)) if (ALLOWED[k] !== v) out.push(`permission ${k}: ${v}`);
  for (const k of Object.keys(ALLOWED)) if (!(k in perms)) out.push(`permission ${k} is absent`);
  if ((m.default_events ?? []).length > 0) out.push('it subscribes to events');
  if (m.hook_attributes?.active !== false) out.push('it has an active webhook');
  if (m.name !== 'KAAL Inspector') out.push('its name is not KAAL Inspector');
  return out;
};
export const id = 'release/T1253';
export const tests = ['release/F79'];
export const title = 'release/F79: the Inspector manifest equals its draft and holds only checks write and three reads; a manifest with one more permission, an event or a webhook is refused';
export async function run() {
  assert.ok(existsSync(MANIFEST), 'app.json is absent');
  const text = readFileSync(MANIFEST, 'utf8');
  assert.equal(text, `${draft('app.json')}\n`, 'app.json differs from the draft');
  const real = JSON.parse(text);
  assert.deepEqual(problems(real), [], 'the real manifest holds more than the least privilege');
  for (const k of Object.keys(real.default_permissions)) assert.ok(!WRITE.test(real.default_permissions[k]) || k === 'checks', `${k} must not be write`);
  // Hand-made negatives: each must be refused by the same judgement.
  const mutate = (f) => { const m = structuredClone(real); f(m); return m; };
  assert.ok(problems(mutate((m) => { m.default_permissions.contents = 'write'; })).length > 0, 'contents write is not refused');
  assert.ok(problems(mutate((m) => { m.default_permissions.pull_requests = 'write'; })).length > 0, 'pull_requests write is not refused');
  assert.ok(problems(mutate((m) => { m.default_permissions.administration = 'write'; })).length > 0, 'administration is not refused');
  assert.ok(problems(mutate((m) => { m.default_permissions.statuses = 'write'; })).length > 0, 'statuses write is not refused');
  assert.ok(problems(mutate((m) => { m.default_events = ['pull_request']; })).length > 0, 'a subscribed event is not refused');
  assert.ok(problems(mutate((m) => { m.hook_attributes.active = true; })).length > 0, 'an active webhook is not refused');
  assert.ok(problems(mutate((m) => { delete m.default_permissions.checks; })).length > 0, 'a missing permission is not refused');
}
