// Produce/check the delivered inventory from npm's actual pack list and an observed run.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, readFile, kind, reconcile } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { observe } from '../observe.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const packed = await execute('npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], { cwd: root });
if (packed.status !== 0) throw new Error(packed.stderr);
const paths = JSON.parse(packed.stdout)[0].files.map(f => f.path).filter(p => p !== 'test/verify.json').sort();
const files = {};
for (const path of paths) files[path] = sha256(await readFile(join(root, path)));
const run = await observe([join(root, 'test/embed/isolation.test.mjs')]);
if (!run.cases.length || run.cases.some(c => c.outcome !== 'pass') || new Set(run.cases.map(c => c.name)).size !== run.cases.length)
  throw new Error('Cannot create a verification manifest from incomplete/failing Cases: ' + JSON.stringify(run));
const bytes = Buffer.from(JSON.stringify({ files, cases: run.cases.map(c => c.name).sort() }, null, 2) + '\n');
const path = 'test/verify.json', at = join(root, path);
const old = await kind(at) === 'file' ? await readFile(at) : undefined;
if (process.argv.includes('--check')) {
  if (!old?.equals(bytes)) throw new Error('test/verify.json is stale');
} else await reconcile(root, { write: [{ path, bytes, expect: old ? sha256(old) : 'absent' }], remove: [] });
console.error('test/verify.json is current');
