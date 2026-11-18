// Case release/T947 tests: release/C73
import assert from 'node:assert/strict';
import { src } from './fixtures.mjs';
export const id = 'release/T947';
export const tests = ['release/C73'];
export const title = 'the App manifest asks for pull requests write and metadata read and nothing else (no contents), takes no event and no webhook, and is not public';
export async function run() {
  const t = src('app-manifest.json');
  assert.ok(t, 'app-manifest.json is absent');
  const m = JSON.parse(t);
  assert.equal(m.public, false);
  assert.deepEqual(m.default_permissions, { metadata: 'read', pull_requests: 'write' });
  assert.ok(!m.default_events || m.default_events.length === 0, 'the App takes events');
  assert.equal(m.hook_attributes && m.hook_attributes.active, false, 'the App has an active webhook');
  assert.ok(!/KAAL|Dispatcher|Kai/i.test(m.name), 'the template names an instance: the name belongs to the instance map');
}
