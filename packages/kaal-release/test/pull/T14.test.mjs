// Case pull/T14 tests: pull/F14, pull/F15
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { retro, statusOf, walkCollectors } from './fixtures.mjs';
const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));
export const id = 'pull/T14';
export const tests = ['pull/F14', 'pull/F15'];
export const title = 'the command, run on the real repository, prints a result for every declared collector and the qualifiers in the declared order, fails naming what is missing, and its gatherer issues only reads and reads the file state, the history by ancestry and the Case executions of the exact head';
// Always: the credential failure, the read-only source check and the recorded live run. With KAAL_LIVE=<owner/repo>: the command is run on the real host again.
function shows(result, names) {
  assert.deepEqual(result.collectors.map((c) => c.name), names, 'the result does not hold one entry per declared collector, in the declared order');
  for (const c of result.collectors) {
    assert.ok(['qualifies', 'does not qualify', 'not judged'].includes(c.status), `${c.name}: no status`);
    if (c.status !== 'qualifies') assert.ok(c.missing.length > 0, `${c.name}: ${c.status} without saying what is missing`);
  }
  const order = result.collectors.filter((c) => c.status === 'qualifies').map((c) => c.name);
  assert.deepEqual(result.qualifiers, order, 'the qualifiers are not those that qualify, in the declared order');
}
// A small host that answers the gatherer's reads, as the REST API does.
function host(branches) {
  const b = (name) => branches[name];
  const get = async (path) => {
    let m;
    if ((m = /\/branches\/(.+)$/.exec(path))) { if (!b(m[1])) throw new Error('HTTP 404'); return { commit: { sha: `${m[1].split('/').pop()}-2` } }; }
    const col = Object.values(branches).find((c) => path.includes(`${c.name.split('/').pop()}-2`));
    if (/\/compare\//.test(path)) return { files: col.history.flatMap((c) => c.files).map((f) => ({ filename: f, status: 'added' })), total_commits: col.history.length, commits: col.history.map((c, i) => ({ sha: c.id, parents: [{ sha: i ? col.history[i - 1].id : 'base' }] })), merge_base_commit: { sha: 'base' } };
    if (/\/git\/trees\//.test(path)) return { truncated: false, tree: col.tree.map((p) => ({ type: 'blob', path: p })) };
    if (/\/check-runs/.test(path)) return { check_runs: [{ id: col.name.length, status: 'completed', app: { slug: 'github-actions' } }] };
    if ((m = /\/commits\/([^/?]+)$/.exec(path))) return { files: Object.values(branches).flatMap((c) => c.history).find((c) => c.id === m[1]).files.map((f) => ({ filename: f, status: 'added' })) };
    if ((m = /\/contents\/([^?]+)\?/.exec(path))) return { encoding: 'base64', content: Buffer.from(col.texts[decodeURIComponent(m[1])] ?? '').toString('base64') };
    throw new Error(`HTTP 404 ${path}`);
  };
  const getText = async (path) => Object.values(branches).find((c) => path.endsWith(`/jobs/${c.name.length}/logs`)).log;
  return { get, getText };
}
const logOf = (...cases) => cases.map((c) => `2026-11-13T10:00:00.0000000Z   ✔ ${c} (1ms)`).join('\n');


export async function run() {
  const live = process.env.KAAL_LIVE;
  const dir = join(repoRoot, 'engineering/release-management/05-src/pull-promotion');
  const declared = join(dir, 'declaration.json');
  const command = (args, options = {}) => spawnSync('node', [join(dir, 'run.mjs'), ...args], { encoding: 'utf8', ...options });
  const declaration = JSON.parse(readFileSync(declared, 'utf8'));
  const names = declaration.collectors.map((c) => c.name ?? c);

  // the gatherer's reading of the host's records, on the recorded log of a real CI job and on small records of the host's comparison
  const read = await import(pathToFileURL(join(dir, 'read.mjs')).href);
  const log = readFileSync(join(dir, 'evidence/ci-log-excerpt.txt'), 'utf8');
  const runs = [{ job: 1, text: log }];
  const seen = read.executionsOf(runs, 'H');
  assert.deepEqual(seen.map((e) => e.case).sort(), ['foundation/T16', 'foundation/T17', 'foundation/T18', 'foundation/T19', 'foundation/T20', 'foundation/T21', 'release/T1', 'release/T2', 'release/T3', 'release/T4'], 'the Cases of the recorded log are not those reported under a scoped id');
  assert.ok(seen.every((e) => e.head === 'H' && e.conclusion === 'success' && /^\d{4}-\d\d-\d\dT/.test(e.at)), 'an execution does not carry its head, its conclusion and its time');
  // the newest run of a job counts; a failure of any job at the head counts against the Case
  const failed = log.replace('✔ release/T2', '✖ release/T2');
  assert.equal(read.executionsOf([{ job: 1, text: log }, { job: 2, text: failed }], 'H').find((e) => e.case === 'release/T2').conclusion, 'failure', 'a red job did not count');
  const rerun = `${failed}\n2026-11-13T16:00:00.0000000Z ✔ release/T2 (1ms)`;
  assert.equal(read.executionsOf([{ job: 1, text: rerun }], 'H').find((e) => e.case === 'release/T2').conclusion, 'success', 'the newest run of a job did not win');
  assert.deepEqual(read.executionsOf([{ job: 1, text: '2026-11-13T15:00:00.0Z   ✔ T19 (1ms)\nno marks here' }], 'H'), [], 'an unscoped name was taken for a Case');
  // history: ancestry, not order of arrival
  const c = (sha, parent) => ({ sha, parents: [{ sha: parent }] });
  assert.deepEqual(read.historyOf([c('b', 'a'), c('c', 'b')], 'a'), ['b', 'c']);
  assert.throws(() => read.historyOf([c('c', 'b'), c('b', 'a')], 'a'), /could not order the history/, 'a history out of ancestry was accepted');
  assert.deepEqual(read.historyOf([c('b', 'x')], 'a'), ['b'], 'the line starts at the first commit whose parent is not a collector commit (pull/F36)');
  // the delta keeps added, modified and removed apart, and a rename is a removal and an addition
  assert.deepEqual(read.deltaOf([{ filename: 'a', status: 'added' }, { filename: 'b', status: 'removed' }, { filename: 'n', status: 'renamed', previous_filename: 'o' }]), [{ path: 'a', status: 'added' }, { path: 'b', status: 'removed' }, { path: 'n', status: 'modified' }, { path: 'o', status: 'removed' }]);

  // no usable credential: the command fails naming what is missing (no network is needed)
  const bare = command(['some-owner/some-repo', declared], { env: { PATH: process.env.PATH, HOME: mkdtempSync(join(tmpdir(), 'pull-nohome-')) } });
  assert.equal(bare.status, 2, 'the command ran without a supported credential');
  assert.match(String(bare.stderr), /GH_TOKEN|GITHUB_TOKEN|gh auth|credential/i, 'the missing credential is not named');

  // read-only by construction: the sources of the command hold no request that is not a GET
  const sources = readdirSync(dir).filter((f) => /\.mjs$/.test(f)).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  assert.ok(!/(-X|--method)\s*['"]?(POST|PUT|PATCH|DELETE)\b/i.test(sources), 'a source holds a request that is not a GET');
  assert.ok(!/\bmutation\b/.test(sources), 'a source holds a GraphQL mutation');
  assert.ok(/'-X', 'GET'/.test(sources), 'the gatherer does not name GET for its requests');

  // the recorded run on the real repository: one entry per declared collector, in the declared order, and the qualifiers in that order
  const recorded = JSON.parse(readFileSync(join(dir, 'evidence/live-report.json'), 'utf8'));
  shows(recorded, names);
  assert.ok(existsSync(join(dir, 'evidence/live-run.md')), 'the record of the live run is missing');

  // the gatherer and the Script together, on a host that answers the reads like the real one: a collector with complete evidence of its own qualifies, one that only inherits does not
  // end to end on a real-shaped host: the gatherer and the Script together
    const mk = (name, files, tree, texts, cases) => ({ name, history: [{ id: `${name.split('/').pop()}-1`, files: files.slice(0, -1) }, { id: `${name.split('/').pop()}-2`, files: files.slice(-1) }], tree, texts, log: logOf(...cases) });
  const mainTree = ['README.md', 'packages/kaal-other/plan/c9/requirements.md', 'packages/kaal-other/src/other.mjs', 'packages/kaal-other/test/other/T1.test.mjs'];
  const mine = ['packages/kaal-demo/plan/c1/requirements.md', 'packages/kaal-demo/plan/c1/testing.md', 'packages/kaal-demo/src/demo.mjs', 'packages/kaal-demo/test/demo/T1.test.mjs', 'packages/kaal-demo/concluding-act.md'];
  const branches = {
    'kaal/demo/own': mk('kaal/demo/own', mine, [...mainTree, ...mine], { 'packages/kaal-demo/concluding-act.md': retro() }, ['demo/T1', 'other/T1']),
    'kaal/demo/inherits': mk('kaal/demo/inherits', ['docs/note.md', 'docs/more.md'], [...mainTree, 'docs/note.md', 'docs/more.md'], {}, ['other/T1']),
  };
  const real = JSON.parse(readFileSync(join(dir, 'declaration.json'), 'utf8'));
  const d = { collectors: [{ name: 'kaal/demo/own', scope: ['^packages/kaal-demo/'] }, { name: 'kaal/demo/inherits', scope: ['^packages/kaal-other/'] }], evidence: { ...real.evidence, cases: { files: '^packages/[^/]+/test/([a-z-]+/T\\d+)\\.test\\.mjs$' } } };
  const { get, getText } = host(branches);
  const out = await walkCollectors(await read.readFacts('o/r', d, get, getText), d);
  assert.deepEqual(out.qualifiers, ['kaal/demo/own'], `the collector with complete evidence of its own did not qualify, or another did: ${JSON.stringify(out.collectors)}`);
  const inh = statusOf(out, 'kaal/demo/inherits');
  assert.equal(inh.status, 'does not qualify', 'a collector that only inherits evidence from main qualified');
  assert.ok(inh.missing.some((m) => /scope/.test(m)), 'the missing work inside the scope is not named');

  // the declaration covers what each collector owns: on the recorded files of the real collectors, no file of a delta lies outside its scope,
  // and every test file of its scope is a Case or declared not to be one (the completeness the qualifier enforces)
  const files = JSON.parse(readFileSync(join(dir, 'evidence/collector-files.json'), 'utf8')).collectors;
  const matches = (list, path) => [list].flat().filter(Boolean).some((p) => new RegExp(p).test(path));
  for (const c of declaration.collectors) {
    const held = files[c.name];
    assert.ok(held, `${c.name}: no recorded files`);
    assert.deepEqual(held.delta.filter((f) => !matches(c.scope, f)), [], `${c.name}: files of its delta lie outside its scope`);
    assert.deepEqual(held.testFiles.filter((f) => matches(c.scope, f) && !matches(declaration.evidence.cases.files, f) && !matches(declaration.evidence.cases.other, f)), [], `${c.name}: test files of its scope are neither a Case nor declared otherwise`);
  }

  if (!live) return;
  const ok = command([live, declared]);
  assert.equal(ok.status, 0, `the command failed: ${ok.stderr}`);
  shows(JSON.parse(ok.stdout), names);
  assert.ok(!/\bREADY\b|may promote/i.test(ok.stdout), 'the output claims readiness or an authorization');

  // an unreadable host fails naming what could not be read
  const unreadable = command(['no-such-owner-xyz/none', declared]);
  assert.notEqual(unreadable.status, 0);
  assert.match(String(unreadable.stderr), /could not|cannot|not read|unreach/i, 'an unreadable host did not fail naming what could not be read');
}
