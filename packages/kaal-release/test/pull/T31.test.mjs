// Case pull/T31 tests: pull/F26, pull/F28, pull/F31 (scope of a capability collector, a DO refinement of the approved contract)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HEADINGS, declaration, evidence, file, good, retro, statusOf, walkCollectors } from './fixtures.mjs';
export const id = 'pull/T31';
export const tests = ['pull/F26', 'pull/F28', 'pull/F31'];
export const title = 'a collector declared with a scope is qualified only from its own capability: PLAN, DO, expected Cases and ACT outside the scope, inherited from main, never qualify it; both concluding-ACT record shapes of the repository are found; a real-shaped host gives a qualifying collector with complete evidence of its own and none for one that only inherits';
const dir = fileURLToPath(new URL('../../../../engineering/release-management/05-src/pull-promotion/', import.meta.url));
const ev = evidence({ act: { files: ['^plan/.*00-changes\\.md$', '(^|/)00-changes/[^/]+/act\\.md$'], headings: HEADINGS } });
const decl = (scope) => declaration({ collectors: [{ name: 'col-a', ...(scope ? { scope } : {}) }], evidence: ev });
const only = async (collector, scope) => statusOf(await walkCollectors({ collectors: [collector] }, decl(scope)), 'col-a');

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
const log = (...cases) => cases.map((c) => `2026-11-13T10:00:00.0000000Z   ✔ ${c} (1ms)`).join('\n');

export async function run() {
  // scope narrows: a collector with complete evidence of its own qualifies, and the same facts scoped to another capability do not
  const own = good('col-a');
  assert.equal((await only(own)).status, 'qualifies', 'unscoped facts, as approved, stopped qualifying');
  assert.equal((await only(own, ['^plan/', '^src/', '^test/'])).status, 'qualifies', 'a collector with its evidence inside its scope did not qualify');
  const elsewhere = await only(own, ['^docs/']);
  assert.equal(elsewhere.status, 'does not qualify', 'evidence outside the scope qualified the collector');
  assert.ok(elsewhere.missing.some((m) => /scope/.test(m)), 'the empty scope is not named');
  // PLAN, DO and the Cases inherited from main (in the tree, outside the scope) never count for a collector whose own work is elsewhere
  const inherited = good('col-a', { delta: [file('docs/note.md', 'added')], history: [{ id: 'col-a-head', paths: ['docs/note.md'] }], tree: [...good('col-a').tree, 'docs/note.md'] });
  assert.equal((await only(inherited, ['^docs/'])).status, 'does not qualify', 'PLAN, DO and Cases inherited from main qualified a collector whose scope holds none');
  // an unreadable scope is not judged
  for (const bad of [[], 'plan', [1]]) assert.equal((await only(own, bad)).status, 'not judged', `scope ${JSON.stringify(bad)} did not make the collector not judged`);
  // the ACT of the other record shape (00-changes/<change>/act.md) is found, and one of each shape in scope is two retrospectives
  const shaped = good('col-a', { delta: [...own.delta.filter((f) => f.path !== 'plan/x/00-changes.md'), file('00-changes/C1-x/act.md', 'added')], tree: [...own.tree.filter((p) => p !== 'plan/x/00-changes.md'), '00-changes/C1-x/act.md'], history: [...own.history.slice(0, -1), { id: 'col-a-head', paths: ['00-changes/C1-x/act.md'] }], texts: { '00-changes/C1-x/act.md': retro() } });
  assert.equal((await only(shaped)).status, 'qualifies', 'the 00-changes/<change>/act.md record was not found as the ACT');
  const both = await only({ ...shaped, delta: [...shaped.delta, file('plan/x/00-changes.md', 'added')], texts: { ...shaped.texts, 'plan/x/00-changes.md': retro() }, history: [...shaped.history.slice(0, -1), { id: 'col-a-4', paths: ['plan/x/00-changes.md'] }, shaped.history.at(-1)] });
  assert.equal(both.status, 'does not qualify', 'two retrospectives of different shapes counted as one');

  // end to end on a real-shaped host: the gatherer and the Script together
  const read = await import(pathToFileURL(`${dir}read.mjs`).href);
  const mk = (name, files, tree, texts, cases) => ({ name, history: [{ id: `${name.split('/').pop()}-1`, files: files.slice(0, -1) }, { id: `${name.split('/').pop()}-2`, files: files.slice(-1) }], tree, texts, log: log(...cases) });
  const mainTree = ['README.md', 'packages/kaal-other/plan/c9/requirements.md', 'packages/kaal-other/src/other.mjs', 'packages/kaal-other/test/other/T1.test.mjs'];
  const mine = ['packages/kaal-demo/plan/c1/requirements.md', 'packages/kaal-demo/plan/c1/testing.md', 'packages/kaal-demo/src/demo.mjs', 'packages/kaal-demo/test/demo/T1.test.mjs', 'packages/kaal-demo/00-changes/C1-x/act.md'];
  const branches = {
    'kaal/demo/own': mk('kaal/demo/own', mine, [...mainTree, ...mine], { 'packages/kaal-demo/00-changes/C1-x/act.md': retro() }, ['demo/T1', 'other/T1']),
    'kaal/demo/inherits': mk('kaal/demo/inherits', ['docs/note.md', 'docs/more.md'], [...mainTree, 'docs/note.md', 'docs/more.md'], {}, ['other/T1']),
  };
  const real = JSON.parse(readFileSync(`${dir}declaration.json`, 'utf8'));
  const d = { collectors: [{ name: 'kaal/demo/own', scope: ['^packages/kaal-demo/'] }, { name: 'kaal/demo/inherits', scope: ['^packages/kaal-other/'] }], evidence: { ...real.evidence, cases: { files: '^packages/[^/]+/test/([a-z-]+/T\\d+)\\.test\\.mjs$' } } };
  const { get, getText } = host(branches);
  const out = await walkCollectors(await read.readFacts('o/r', d, get, getText), d);
  assert.deepEqual(out.qualifiers, ['kaal/demo/own'], `the collector with complete evidence of its own did not qualify, or another did: ${JSON.stringify(out.collectors)}`);
  const inh = statusOf(out, 'kaal/demo/inherits');
  assert.equal(inh.status, 'does not qualify', 'a collector that only inherits evidence from main qualified');
  assert.ok(inh.missing.some((m) => /scope/.test(m)), 'the missing work inside the scope is not named');
}
