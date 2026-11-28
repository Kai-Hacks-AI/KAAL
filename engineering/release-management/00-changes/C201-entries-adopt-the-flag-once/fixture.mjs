// The fixtures the Cases of release/C201 share: the seven adopting entries with facts that violate their rule and facts that satisfy it, control records that declare a station, and flag files of the instance's format.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
export const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const SRC = join(repo, 'engineering/release-management/05-src');
export const load = (rel) => import(pathToFileURL(join(SRC, rel)).href);
export const JUDGED = ['Collecting', 'Hotfixing', 'Promoting', 'Wiring'];
// The target a station is the station of, with the default branch `main`.
export const TARGET = { Promoting: 'main', Collecting: 'kaal/release/x', Hotfixing: 'hotfix/x', Wiring: 'wire/x' };
export const record = (id, stations) => `---\nid: ${id}\ntitle: a control\ndescription: It reveals a fact.\ntype: preventive\nstatus: designed\nhas: [release/I50]\n${stations ? `stations: [${stations}]\n` : ''}evidence: [fixture:2, real:2, provoked:1:fail]\n---\n# ${id}\n`;
// A flag file with one entry for each of `ids` at each of `places`, all of `value` (a value, or a function of id and place); `skip` leaves one entry out.
export const flags = (ids, places, value, skip) => JSON.stringify({ schema: 'kaal-controls/flags@1', flags: ids.flatMap((control) => places.map((place) => ({ control, place, name: `${control}@${place}`, value: typeof value === 'function' ? value(control, place) : value }))).filter((e) => !(skip && e.control === skip[0] && e.place === skip[1])) });
export function files({ id, recordText, flagsText }) {
  const dir = mkdtempSync(join(tmpdir(), 'c201-'));
  const env = { KAAL_DEFAULT: 'main', GITHUB_RUN_ID: '7', KAAL_FLAGS: join(dir, 'flags.json'), KAAL_CONTROL_RECORD: join(dir, 'record.md') };
  if (recordText !== undefined) writeFileSync(env.KAAL_CONTROL_RECORD, recordText);
  if (flagsText !== undefined) writeFileSync(env.KAAL_FLAGS, flagsText);
  return { dir, env };
}

const sha = (c) => c.repeat(40);
const head = '0123456789abcdef0123456789abcdef01234567';
const promo = { repo: 'o/r', defaultBranch: 'main', baseRef: 'main', headRepo: 'o/r', headRef: 'kaal/release/x', head };
const green = { required: [{ context: 'Engineering' }], runs: [{ id: 1, name: 'Engineering', status: 'completed', conclusion: 'success', headSha: head }] };
const red = { required: [{ context: 'Engineering' }], runs: [{ id: 1, name: 'Engineering', status: 'completed', conclusion: 'failure', headSha: head }] };
const fresh = { defaultBranch: 'main', defaultTip: sha('a'), headRef: 'kaal/release/x', head: sha('b'), headTree: 'T', containsTip: true, merge: { clean: true, tree: 'T', conflicts: [] } };
const syncOk = { defaultBranch: 'main', lineage: 'kaal/release/x', defaultTip: sha('a'), lineageTip: sha('b'), head: sha('c'), merged: sha('a'), marker: null, onLineageTip: true, carriesDefault: true, markerOnDefault: true, adopted: [], advances: true, incorporated: sha('d'), expected: { clean: true, tree: 'T', conflicts: [] }, differing: [] };
// The entries, in the order of the workflow sources: [module, id, how the module is called, facts that violate the rule, facts that satisfy it].
// Each rule is the checker the legacy workflow runs (engineering/github/lineage.ts, engineering/change-isolation/check.mjs); the entry only wraps it.
export const ENTRIES = [
  ['change-isolation/judge-github-alone.mjs', 'release/CTL42', 'paths', { paths: ['.github/workflows/a.yml', 'README.md'] }, { paths: ['README.md'] }],
  ['change-isolation/judge-delivery.mjs', 'release/CTL23', 'paths', { paths: ['.github/workflows/a.yml', 'engineering/a.md'] }, { paths: ['engineering/a.md'] }],
  ['lineage/judge-freshness.mjs', 'release/CTL37', 'facts', { ...fresh, containsTip: false }, fresh],
  ['lineage/judge-synchronization.mjs', 'release/CTL38', 'facts', { ...syncOk, advances: false }, syncOk],
  ['lineage/judge-auto-merge.mjs', 'release/CTL39', 'facts', { baseRef: 'main', head, expected: 'squash', enabled: 'merge' }, { baseRef: 'main', head, expected: 'squash', enabled: 'squash' }],
  ['promotion-source/judge-origin.mjs', 'release/CTL40', 'facts', { ...promo, headRepo: 'f/r' }, promo],
  ['promotion-source/judge-head-evidence.mjs', 'release/CTL41', 'facts', { ...promo, checks: red }, { ...promo, checks: green }],
];
export const IDS = ENTRIES.map((e) => e[1]);
// Runs the entry's check the way its command line does after the helper has answered: the helper's mode and flag, the library's exit.
export async function exitOfRun({ module, id, how, facts, entry }) {
  const { withFlag, exitOf } = await load('lib/entry-flag.mjs');
  const m = await load(module);
  const boundary = withFlag({ x: 'real', run: '7', sha: sha('a') }, entry.flag);
  const answer = how === 'paths' ? await m.check({ ...facts, mode: entry.mode, boundary }) : await m.check(facts, { mode: entry.mode, boundary });
  return { answer, exit: exitOf({ id, station: entry.station, answer }) };
}
