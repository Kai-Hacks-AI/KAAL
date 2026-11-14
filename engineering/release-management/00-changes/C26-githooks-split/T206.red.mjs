// Case release/T206 tests: A46
import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T206';
export const tests = ['release/A46'];
export const title = 'the dispatcher runs the legacy hook and every new hook with the same arguments and refs, runs all of them, and fails closed if the legacy hook is missing or any hook cannot run';

const rcVar = (name) => `rc_${name.replace(/\W/g, '_')}`;
const stub = (name) => `#!/bin/sh\necho "${name} $* <$(cat | paste -sd'|' -)>" >> "$LOG"\nexit \${${rcVar(name)}:-0}\n`;

// Runs a dispatcher text against stub hooks: `old` is the legacy hook, `news` the files of new/pre-push.d.
export function scenario(dispatcher, { oldRc = 0, oldMode = 'executable', news = {}, plain = [], readme = false, noNewDir = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'dispatch-'));
  try {
    const hooks = join(dir, '.githooks');
    mkdirSync(join(hooks, 'old'), { recursive: true });
    writeFileSync(join(hooks, 'pre-push'), dispatcher, { mode: 0o755 });
    if (oldMode !== 'missing') writeFileSync(join(hooks, 'old/pre-push'), stub('old'), { mode: oldMode === 'executable' ? 0o755 : 0o644 });
    if (!noNewDir) mkdirSync(join(hooks, 'new/pre-push.d'), { recursive: true });
    const env = { ...process.env, LOG: join(dir, 'log'), [rcVar('old')]: String(oldRc) };
    for (const [name, rc] of Object.entries(news)) {
      writeFileSync(join(hooks, 'new/pre-push.d', name), stub(name), { mode: 0o755 });
      env[rcVar(name)] = String(rc);
    }
    for (const name of plain) { writeFileSync(join(hooks, 'new/pre-push.d', name), stub(name)); chmodSync(join(hooks, 'new/pre-push.d', name), 0o644); }
    if (readme) writeFileSync(join(hooks, 'new/pre-push.d/README.md'), 'Installed new hooks only.\n');
    writeFileSync(join(dir, 'log'), '');
    const r = spawnSync('sh', [join(hooks, 'pre-push'), 'origin', 'git@example:kaal.git'], { input: 'refs/heads/a 1 refs/heads/a 0\nrefs/heads/b 2 refs/heads/b 0\n', env, cwd: dir, encoding: 'utf8' });
    return { status: r.status, log: readFileSync(join(dir, 'log'), 'utf8').trim().split('\n').filter(Boolean) };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// What a good dispatcher does in each scenario.
export function check(dispatcher) {
  const fail = [];
  const expect = (what, got, status, names) => {
    if ((got.status === 0) !== (status === 0)) fail.push(`${what}: status ${got.status}`);
    const ran = got.log.map((l) => l.split(' ')[0]).join(',');
    if (ran !== names.join(',')) fail.push(`${what}: ran ${ran || 'nothing'}, wanted ${names.join(',')}`);
    for (const n of names) if (!got.log.some((l) => l.startsWith(`${n} origin git@example:kaal.git <refs/heads/a 1 refs/heads/a 0|refs/heads/b 2 refs/heads/b 0>`))) fail.push(`${what}: ${n} did not get the same arguments and refs`);
  };
  expect('both pass', scenario(dispatcher, { news: { '10-a': 0, '20-b': 0 } }), 0, ['old', '10-a', '20-b']);
  expect('the legacy hook fails', scenario(dispatcher, { oldRc: 1, news: { '10-a': 0 } }), 1, ['old', '10-a']);
  expect('a new hook fails', scenario(dispatcher, { news: { '10-a': 1, '20-b': 0 } }), 1, ['old', '10-a', '20-b']);
  expect('no directory of new hooks', scenario(dispatcher, { noNewDir: true }), 0, ['old']);
  expect('the README of the directory', scenario(dispatcher, { news: { '10-a': 0 }, readme: true }), 0, ['old', '10-a']);
  expect('the legacy hook is missing', scenario(dispatcher, { oldMode: 'missing', news: { '10-a': 0 } }), 1, ['10-a']);
  expect('the legacy hook is not executable', scenario(dispatcher, { oldMode: 'plain', news: { '10-a': 0 } }), 1, ['10-a']);
  expect('a new hook is not executable', scenario(dispatcher, { news: { '10-a': 0 }, plain: ['15-x'] }), 1, ['old', '10-a']);
  return fail;
}

export const good = `#!/bin/sh
dir=$(cd "$(dirname "$0")" && pwd)
input=$(mktemp)
cat > "$input"
status=0
old="$dir/old/pre-push"
if [ -f "$old" ] && [ -x "$old" ]; then "$old" "$@" < "$input" || status=1; else echo "pre-push: the legacy hook $old is missing or not executable" >&2; status=1; fi
for hook in "$dir"/new/pre-push.d/*; do
  [ -e "$hook" ] || continue
  case $hook in */README.md) continue ;; esac
  if [ -f "$hook" ] && [ -x "$hook" ]; then "$hook" "$@" < "$input" || status=1; else echo "pre-push: $hook is not executable" >&2; status=1; fi
done
rm -f "$input"
exit $status
`;
const bad = {
  'one that never runs the new hooks': good.replace('"$dir"/new/pre-push.d/*', ''),
  'one that stops at the first failure': good.replace('|| status=1', '|| exit 1'),
  'one that ignores a failure': good.replace('|| status=1', '|| true'),
  'one that gives the next hook no refs': good.replace('"$hook" "$@" < "$input"', '"$hook" "$@" < /dev/null'),
  'one that skips a missing or non-executable legacy hook': good.replace('else echo "pre-push: the legacy hook $old is missing or not executable" >&2; status=1; fi', 'fi'),
  'one that skips a new hook that is not executable': good.replace('else echo "pre-push: $hook is not executable" >&2; status=1; fi', 'fi'),
};

export function run() {
  assert.deepEqual(check(good), [], 'the harness rejects a good dispatcher');
  for (const [what, text] of Object.entries(bad)) assert.notDeepEqual(check(text), [], `the harness accepts ${what}`);
  const path = join(repo, '.githooks/pre-push');
  assert.ok(existsSync(join(repo, '.githooks/old/pre-push')), 'the legacy hook .githooks/old/pre-push is absent, so .githooks/pre-push is not a dispatcher');
  const text = readFileSync(path, 'utf8');
  assert.ok(!text.includes('kaal-guard'), 'the dispatcher holds policy: it names kaal-guard');
  assert.ok(text.split('\n').length <= 30, 'the dispatcher is not thin');
  assert.deepEqual(check(text), [], 'the dispatcher does not behave as specified');
}
