// Source: every declared source suite. Installed: only the delivered verification.
// Artifact probes require caller-packed inputs and are outside the source suite plan.
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const parent = dirname(root);
const installed = basename(parent) === 'node_modules' ||
  (basename(parent).startsWith('@') && basename(dirname(parent)) === 'node_modules');
function refuse(why) {
  console.log('cannot verify: ' + why);
  console.log(installed ? 'kaal-change-verification ' + JSON.stringify({ result: 'cannot verify', exit: 2,
    cases: [], causes: [why] }) : 'cannot verify');
  process.exit(2);
}
let host;
try { host = await import('kaal-hosting'); }
catch (e) { refuse('verification provider unavailable: ' + (e.code ?? e.message)); }
try {
  const markers = [];
  for (const path of ['plan', 'test/publisher']) if (await host.kind(join(root, path)) !== 'missing') markers.push(path);
  if (installed && markers.length) refuse('an installed package carries source markers: ' + markers.join(', '));
  if (!installed && markers.length !== 2) refuse('a source checkout needs plan/ and test/publisher/');
  const pkg = JSON.parse(await host.readFile(join(root, 'package.json')));
  const suites = Object.keys(pkg.scripts ?? {}).filter(name => name.startsWith('test:') &&
    !['test:all', 'test:package-only'].includes(name));
  if (!suites.includes('test:embedded') || (!installed && !suites.includes('test:publisher')))
    refuse('the declared Test Plan needs test:embedded and, in source, test:publisher');
  const cli = process.env.npm_execpath;
  if (!cli || !isAbsolute(cli) || !/\.[cm]?js$/.test(cli)) refuse('run through npm test: npm_execpath must name its CLI');
  const statuses = [];
  for (const suite of installed ? ['test:embedded'] : suites) {
    const run = await host.execute(process.execPath, [cli, 'run', suite], { cwd: root });
    await new Promise(done => process.stdout.write(run.stdout, done));
    await new Promise(done => process.stderr.write(run.stderr, done));
    statuses.push(run.status);
  }
  const result = statuses.includes(1) ? 'failed' : statuses.some(status => status !== 0) ? 'cannot verify' : 'verified';
  if (!installed) console.log(result);
  process.exit({ verified: 0, failed: 1, 'cannot verify': 2 }[result]);
} catch (e) { refuse('Test Plan could not run: ' + (e.code ?? e.message)); }
