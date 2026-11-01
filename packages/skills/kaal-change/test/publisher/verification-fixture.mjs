// Publisher fixtures use Hosting for host operations and Foundation for cleanup expectations.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execute, initialize, kind, read, readFile, reconcile } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import assert from 'node:assert/strict';

export const root = fileURLToPath(new URL('../../', import.meta.url));
let sequence = 0;
export async function fixture(files, use, { installed = false } = {}) {
  const prefix = 'test/publisher/.work/' + process.pid + '-' + Date.now() + '-' + sequence++;
  const relative = prefix + (installed ? '/node_modules/@kaihacksai/kaal-change' : '');
  const at = join(root, relative);
  await initialize(at, files);
  try { return await use(at); }
  finally {
    const remaining = await read(join(root, prefix));
    await reconcile(root, { write: [], remove: Object.entries(remaining).map(([path, bytes]) =>
      ({ path: prefix + '/' + path, expect: sha256(bytes) })) });
    assert.deepEqual(Object.keys(await read(join(root, prefix))), [], 'fixture cleanup must leave no files');
  }
}

export async function entryFiles({ exit = 0, publisher = 1, markers = true } = {}) {
  const pkg = JSON.parse(await readFile(join(root, 'package.json')));
  const result = exit === 0 ? 'verified' : exit === 1 ? 'failed' : 'cannot verify';
  const summary = 'kaal-change-verification ' + JSON.stringify({ result, exit, cases: [], causes: exit ? ['controlled fixture'] : [] });
  const files = {
    'package.json': Buffer.from(JSON.stringify({ name: pkg.name, type: 'module', scripts: {
      test: pkg.scripts.test,
      'test:all': pkg.scripts['test:all'],
      'test:embedded': 'node test/embed.mjs',
      'test:publisher': 'node test/publisher/fail.mjs',
      // Artifact probes need a caller's immutable tarballs; they are not source suites.
    } })),
    'test/embed.mjs': Buffer.from('console.log(' + JSON.stringify(summary) + '); process.exit(' + exit + ');\n'),
  };
  if (markers) {
    files['plan/README.md'] = Buffer.from('Controlled source fixture.\n');
    files['test/publisher/fail.mjs'] = Buffer.from("import assert from 'node:assert/strict'; console.log('publisher observed'); assert.equal(" + publisher + ", 0, 'controlled publisher failure');\n");
  }
  if (await kind(join(root, 'test/run.mjs')) === 'file')
    files['test/run.mjs'] = await readFile(join(root, 'test/run.mjs'));
  return files;
}

export const npmTest = cwd => execute(process.execPath, [process.env.npm_execpath, 'test', '--silent'], { cwd,
  env: { ...process.env, npm_config_update_notifier: 'false' } });
