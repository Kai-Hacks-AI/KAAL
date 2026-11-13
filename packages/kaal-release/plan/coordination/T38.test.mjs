// Case coordination/T38 tests: F9 (the command through the host's command line, proved against a stand-in for it)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { config, deliveryDir, node, page } from './fixtures.mjs';
export const id = 'coordination/T38';
export const tests = ['coordination/F9'];
export const title = 'the command reads the host through its command line with read calls only, prints one line per open piece and exits 0, reads a gateway failure again, and exits 2 naming the host error; proved against a stand-in for the command line, not against the host';
const stand = (work, behave) => {
  const file = join(work, 'gh');
  writeFileSync(file, `#!/usr/bin/env node
const { appendFileSync, existsSync, readFileSync, writeFileSync } = require('node:fs');
const args = process.argv.slice(2);
appendFileSync(process.env.STAND_LOG, args.join(' ') + '\\n');
const counter = process.env.STAND_LOG + '.n';
const n = (existsSync(counter) ? Number(readFileSync(counter, 'utf8')) : 0) + 1;
writeFileSync(counter, String(n));
const fail = (message) => { process.stderr.write(message + '\\n'); process.exit(1); };
const out = (v) => { process.stdout.write(JSON.stringify(v)); process.exit(0); };
${behave}
`);
  chmodSync(file, 0o755);
};
const answering = (pages) => `
if (args[0] !== 'api' || args[1] !== 'graphql') fail('unexpected command');
const pages = ${JSON.stringify(pages)};
out(pages[Math.min(n, pages.length) - 1]);
`;
export async function run() {
  const work = mkdtempSync(join(tmpdir(), 'show-wip-'));
  const log = join(work, 'calls.log');
  const reset = () => { writeFileSync(log, ''); writeFileSync(log + '.n', '0'); };
  const configFile = join(work, 'show-wip.json');
  writeFileSync(configFile, JSON.stringify(config()));
  const env = { ...process.env, PATH: `${work}:${process.env.PATH}`, STAND_LOG: log, SHOW_WIP_PAUSE_MS: '0' };
  const command = (args = ['o/r', configFile]) => spawnSync(process.execPath, [join(deliveryDir, 'run.mjs'), ...args], { encoding: 'utf8', env });

  reset();
  stand(work, answering([page([node(1, { autoMergeRequest: { enabledAt: 'x' } }), node(2, { title: 'PROMOTION: p', mergeStateStatus: 'DIRTY' })], 'c1'), page([node(3, { isDraft: true })])]));
  const ok = command();
  assert.equal(ok.status, 0, `the command failed: ${ok.stderr}`);
  assert.match(ok.stdout, /^#1 +DO +work-1 → col\/a +WAIT +/m);
  assert.match(ok.stdout, /^#2 +PROMOTION +work-2 → col\/a +WORK +.*conflict/mi);
  assert.match(ok.stdout, /^#3 +DO +work-3 → col\/a +WORK +.*draft/mi);
  const calls = readFileSync(log, 'utf8');
  assert.equal(calls.trim().split('\n').length, 2, 'the pages were not read once each');
  assert.ok(calls.trim().split('\n').every((c) => /^api graphql /.test(c)), 'a call is not a read of the host API');
  assert.ok(!/(-X|--method|PATCH|POST|PUT|DELETE|mutation)/i.test(calls), 'the command makes a call that could write');

  reset();
  stand(work, `if (n <= 2) fail('gh: HTTP 502 Bad Gateway'); ${answering([page([node(1)])])}`);
  const retried = command();
  assert.equal(retried.status, 0, `a gateway failure was not read again: ${retried.stderr}`);
  assert.equal(readFileSync(log, 'utf8').trim().split('\n').length, 3);

  reset();
  stand(work, `fail('gh: HTTP 401 Bad credentials');`);
  const failing = command();
  assert.equal(failing.status, 2, 'an unreadable host did not fail with 2');
  assert.match(failing.stderr, /show WIP: .*Bad credentials/i, 'the failure does not name the host error');
  assert.equal(failing.stdout, '', 'a partial report was printed');

  const usage = command(['o/r']);
  assert.equal(usage.status, 2);
  assert.match(usage.stderr, /show WIP: .*(expected|usage)/i);
}
