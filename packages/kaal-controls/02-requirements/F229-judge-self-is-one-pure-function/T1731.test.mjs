// Case controls/T1731 tests: controls/F229
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/packages/')[0];
const dir = join(repo, 'packages/kaal-controls');
const FILE = join(dir, 'skills/kaal-controls/scripts/lib/judge-self.mjs');
export const id = 'controls/T1731';
export const tests = ['controls/F229'];
export const title = 'judgeSelf is one pure library function that gives the findings of the package on its own files, names a lagging and an overclaiming record, and throws on what it cannot judge';
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.name === 'node_modules' ? [] : e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
const own = () => walk(dir).filter((f) => /\.(md|mjs|json)$/.test(f) && !/package-lock\.json$/.test(f)).map((f) => ({ path: relative(dir, f), text: readFileSync(f, 'utf8').replace(/\r\n/g, '\n') }));
export async function run() {
  assert.ok(existsSync(FILE), 'scripts/lib/judge-self.mjs is absent');
  const src = readFileSync(FILE, 'utf8');
  assert.doesNotMatch(src, /from ['"]node:/, 'judgeSelf imports a platform module, so it is not pure');
  const { judgeSelf } = await import(pathToFileURL(FILE).href);
  assert.equal(typeof judgeSelf, 'function');
  const files = own();
  assert.deepEqual(judgeSelf({ files, revision: 'tree' }), { findings: [], unknown: [] }, 'the package does not agree with its own proof');
  const set = (status) => files.map((f) => (f.path.endsWith('CTL1-verify-adapter/CTL1.md') ? { ...f, text: f.text.replace(/^status: .*$/m, `status: ${status}`) } : f));
  assert.deepEqual(judgeSelf({ files: set('designed'), revision: 'tree' }).findings, ['implemented:lags:controls/CTL1'], 'a record below its proof is a finding named by fact and direction');
  assert.deepEqual(judgeSelf({ files: set('tested'), revision: 'tree' }).findings.sort(), ['running:overclaims:controls/CTL1', 'tested:overclaims:controls/CTL1'], 'a record above its proof is a finding for each fact it overclaims');
  assert.throws(() => judgeSelf({ files, revision: '' }), /revision/, 'a missing revision is not judged');
  assert.throws(() => judgeSelf({ files: [], revision: 'tree' }), /controls/, 'no files, no controls: nothing passes by silence');
}
