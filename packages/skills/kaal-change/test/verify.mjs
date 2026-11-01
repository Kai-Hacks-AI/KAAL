// Consumer verification: Hosting for I/O, Foundation for hashes, node:test for observation.
// Matching this inventory is consistency evidence, not publication provenance.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { observe } from './observe.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const exit = { verified: 0, failed: 1, 'cannot verify': 2 }, causes = [];
let provenance = {};
function finish(result, cases = []) {
  for (const c of cases) console.log(c.outcome + ': ' + c.name);
  console.log('kaal-change-verification ' + JSON.stringify({ result, exit: exit[result], cases, causes, provenance }));
  process.exit(exit[result]);
}
let host, sha256;
try {
  host = await import('kaal-hosting');
  ({ sha256 } = await import('@kaihacksai/kaal-foundation/sha256'));
  await import('kaal-graph');
} catch (e) { causes.push('verification provider unavailable: ' + e.code); finish('cannot verify'); }
let manifest;
try {
  const pkg = JSON.parse((await host.readFile(join(root, 'package.json'))).toString('utf8'));
  const bytes = await host.readFile(join(root, 'test/verify.json'));
  provenance = { package: pkg.name, version: pkg.version, location: root, manifestSha256: sha256(bytes) };
  manifest = JSON.parse(bytes.toString('utf8'));
} catch (e) { causes.push('verification inventory unavailable: ' + (e.code ?? e.message)); finish('cannot verify'); }
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
if (!object(manifest.files) || !Array.isArray(manifest.cases) || !manifest.cases.length ||
    !manifest.cases.every(c => typeof c === 'string' && c) ||
    new Set(manifest.cases).size !== manifest.cases.length) {
  causes.push('malformed verification inventory'); finish('cannot verify');
}
const expected = Object.keys(manifest.files).sort();
const observed = ['LICENSE', 'README.md', 'package.json', 'test/verify.mjs', 'test/observe.mjs'];
try {
  for (const directory of ['capability', 'payload', 'skills', 'lib', 'docs', 'test/embed', 'test/fixtures'])
    for (const path of Object.keys(await host.read(join(root, directory))))
      observed.push(directory + '/' + path);
  if (JSON.stringify(observed.sort()) !== JSON.stringify(expected)) causes.push('delivered file inventory differs');
  for (const path of expected) {
    if (path.split('/').some(s => !s || s === '.' || s === '..') || /[\\:]/.test(path) ||
        !/^[0-9a-f]{64}$/.test(manifest.files[path])) { causes.push('invalid inventory path/digest'); continue; }
    if (sha256(await host.readFile(join(root, path))) !== manifest.files[path]) causes.push(path + ' differs');
  }
  if (causes.length) finish('cannot verify');
  const api = await import('@kaihacksai/kaal-change/isolation');
  if (typeof api.isolate !== 'function') { causes.push('public isolation export unavailable'); finish('cannot verify'); }
} catch (e) { causes.push('delivered interface cannot be read: ' + (e.code ?? e.message)); finish('cannot verify'); }
const files = Object.keys(await host.read(join(root, 'test/embed')))
  .filter(p => !p.includes('/') && p.endsWith('.test.mjs')).sort().map(p => join(root, 'test/embed', p));
const run = await observe(files);
const names = run.cases.map(c => c.name);
if (JSON.stringify([...names].sort()) !== JSON.stringify([...manifest.cases].sort()) ||
    new Set(names).size !== names.length || run.cases.some(c => ['skip', 'todo'].includes(c.outcome))) {
  causes.push('required Cases missing, duplicate, undeclared or unexecuted'); finish('cannot verify', run.cases);
}
if (run.failures.length) { causes.push(...run.failures); finish('failed', run.cases); }
finish('verified', run.cases);
