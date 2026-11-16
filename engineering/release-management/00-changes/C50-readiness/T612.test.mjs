// Case release/T612 tests: release/CTL3
import assert from 'node:assert/strict';
import { declaration, directory, manifest, registry, judge } from './fixtures.mjs';
export const id = 'release/T612';
export const tests = ['release/CTL3'];
export const title = 'a manifest that holds everything is verified, and each missing or wrong field gives its own named finding, in a fixed order, without changing its input';
const WRONG = {
  private: [{ private: true }, 'private'],
  scope: [{ name: '@other/kaal-example' }, 'scope', { '@other/kaal-example': [] }],
  version: [{ version: '1.0' }, 'version'],
  access: [{ publishConfig: {} }, 'access'],
  'repository-url': [{ repository: { type: 'git', url: 'git+https://example.org/x.git', directory } }, 'repository-url'],
  'repository-directory': [{ repository: { type: 'git', url: declaration.repository, directory: 'packages/other' } }, 'repository-directory'],
  license: [{ license: undefined }, 'license'],
  engines: [{ engines: undefined }, 'engines'],
  files: [{ files: [] }, 'files'],
};
export async function run() {
  const mod = await judge();
  assert.ok(mod, 'judge.mjs is absent');
  const good = mod.judgeReadiness({ manifest: manifest(), directory, registry: registry() }, declaration);
  assert.deepEqual(good, { result: 'verified', findings: [], path: 'trusted' });
  for (const [rule, [change, , known]] of Object.entries(WRONG)) {
    const m = manifest(change);
    const before = JSON.stringify(m);
    const out = mod.judgeReadiness({ manifest: m, directory, registry: registry(known) }, declaration);
    assert.equal(out.result, 'failed', `${rule}: not failed`);
    assert.deepEqual(out.findings.map((f) => f.rule), [rule], `${rule}: the finding is not the one rule`);
    assert.equal(out.findings[0].kind, 'failed');
    assert.equal(before, JSON.stringify(m), `${rule}: the input changed`);
  }
  const two = mod.judgeReadiness({ manifest: manifest({ license: undefined, files: [] }), directory, registry: registry() }, declaration);
  assert.deepEqual(two.findings.map((f) => f.rule), ['license', 'files'], 'the order is not fixed');
}
