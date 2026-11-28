// Case release/T1631 tests: release/C167. The entry of a check passes the helper's mode and flag to the controls adapter and returns the library's exit, row by row of the outcome table: an unknown decision exits 1 for every control type, nothing runs and no record is written; with the flag on only a PASS exits 0; advisory does not block; stopped does not run.
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ID, STATION, flags, job } from './fixture.mjs';
const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const id = 'release/T1631';
export const tests = ['release/C167'];
export const title = 'the entries return the library\'s exit for both kinds of unknown, row by row of the outcome table';
export async function run() {
  const { cli } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lineage/lib/answer.mjs')).href);
  const { DETECTIVE } = await import(pathToFileURL(join(repo, 'engineering/release-management/05-src/lib/entry-flag.mjs')).href);
  const { runControl } = await import(pathToFileURL(join(repo, 'packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs')).href);
  // a real adapter run with a chosen verdict: the entry decides nothing about mode or flag
  const checkOf = (verdict, calls) => async (_facts, { mode: asked, boundary }) => {
    calls.push({ mode: asked, boundary });
    const mode = asked ?? DETECTIVE;
    const r = await runControl({ id: ID, mode, check: () => (verdict === 'PASS' ? [] : verdict === 'THROW' ? (() => { throw new Error('x'); })() : ['finding']), input: {}, boundary });
    return { kind: r.verdict === 'PASS' ? 'pass' : 'fail', verdict: r.verdict, mode: r.mode, applied: r.applied, blocked: r.blocked, findings: r.findings ?? [], message: null, record: r.record, log: r.log };
  };
  const go = async ({ stations, flagsText, verdict }) => {
    const calls = []; const lines = []; const { env } = job({ stations, flagsText });
    const exit = await cli({ label: 'x', id: ID, check: checkOf(verdict, calls), applies: () => true, read: () => ({}), argv: ['--head', 'HEAD1', '--base-ref', 'main'], env, cwd: repo, out: (l) => lines.push(l) });
    return { exit, calls, lines, record: lines.some((l) => l.startsWith('kaal-control ')) };
  };
  const P = `${STATION}:preventive`;
  // the unknown decision: exit 1, nothing runs, no record, for a preventive and for a detective control
  for (const [why, text] of [['file missing', undefined], ['entry missing', flags(['on', 'release/CTL99'])], ['value invalid', flags(['sometimes'])]]) {
    for (const stations of [P, undefined]) {
      const r = await go({ stations, flagsText: text, verdict: 'PASS' });
      assert.equal(r.exit, 1, `${why}, ${stations ? 'preventive' : 'detective'}: exit 1`); assert.equal(r.calls.length, 0, 'nothing runs'); assert.equal(r.record, false, 'no record');
      assert.ok(r.lines.some((l) => (stations ? /preventive-without-flag/ : /no-flag|unrecognized-flag/).test(l)), `${why}: the finding`);
    }
  }
  // the known decision
  let r = await go({ stations: P, flagsText: flags(['on']), verdict: 'PASS' });
  assert.equal(r.exit, 0, 'on and PASS exits 0'); assert.equal(r.calls[0].mode, 'preventive'); assert.equal(r.calls[0].boundary.flag.value, 'on'); assert.equal(r.record, true);
  r = await go({ stations: P, flagsText: flags(['on']), verdict: 'REPORT' });
  assert.equal(r.exit, 1, 'on and a finding blocks, authorized');
  r = await go({ stations: P, flagsText: flags(['on']), verdict: 'THROW' });
  assert.equal(r.exit, 1, 'on and no verdict (UNKNOWN) blocks as an unknown result');
  r = await go({ stations: P, flagsText: flags(['advisory']), verdict: 'REPORT' });
  assert.equal(r.exit, 0, 'advisory reports and does not block');
  r = await go({ stations: P, flagsText: flags(['advisory']), verdict: 'THROW' });
  assert.equal(r.exit, 0, 'advisory does not block an unknown result');
  r = await go({ stations: P, flagsText: flags(['stopped']), verdict: 'REPORT' });
  assert.equal(r.exit, 0, 'stopped does not block'); assert.equal(r.calls.length, 0, 'stopped does not run');
  // a job that has not adopted the flag runs as it did: detective, the entry's own exit
  const calls = []; const lines = [];
  const exit = await cli({ label: 'x', id: ID, check: checkOf('REPORT', calls), applies: () => true, read: () => ({}), argv: ['--head', 'HEAD1', '--base-ref', 'main'], env: { KAAL_DEFAULT: 'main', GITHUB_RUN_ID: '7' }, cwd: repo, out: (l) => lines.push(l) });
  assert.equal(exit, 0, 'not adopted: detective, never blocks'); assert.equal(calls[0].mode, undefined, 'not adopted: the entry asks for no mode of its own');
}
