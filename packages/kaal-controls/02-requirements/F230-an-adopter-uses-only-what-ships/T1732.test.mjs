// Case controls/T1732 tests: controls/F230
import assert from 'node:assert/strict';
import { installConsumer } from './consumer.mjs';
export const id = 'controls/T1732';
export const tests = ['controls/F230'];
export const title = 'a consumer outside the repository, with its own stations, records, flag file and ratchet, runs the whole cycle from the shipped files through the public functions, and nothing returned names a station that is not its own';
const STATIONS = ['Merging', 'Shipping'];
const KAAL_STATIONS = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];
const rec = (n, type, stations, extra = '') => ({ path: `acme/controls/CTL${n}.md`, text: `---\nid: acme/CTL${n}\ntitle: verify Thing${n}\ndescription: It reveals a thing${n}.\ntype: ${type}\nstatus: designed\nhas: [acme/I1]\nstations: [${stations}]\n${extra}---\n# acme/CTL${n}\n` });
const flagsText = (...entries) => JSON.stringify({ schema: 'kaal-controls/flags@1', flags: entries.map(([control, place, value]) => ({ control, place, name: `${control}@${place}`, value })) });
export async function run() {
  const c = installConsumer();
  const { findControls } = await c.use('lib/find-controls.mjs');
  const { registryAt } = await c.use('lib/registry.mjs');
  const { parseFlags, flagSource, validateFlags, decideOutcome } = await c.use('flags.mjs');
  const { runControl } = await c.use('adapter.mjs');
  const files = [
    rec(1, 'preventive', 'Merging:preventive'),
    rec(2, 'detective', 'Shipping:detective'),
    rec(3, 'preventive', 'Promoting:preventive'),
    rec(4, 'preventive', 'Merging:preventive', 'strategy: ratchet\nbaseline-source: acme/baseline.json\nowner: acme\nexit: becomes preventive when the baseline is empty\n'),
    { path: 'acme/baseline.json', text: '["old"]' },
  ];
  const seen = [];
  const note = (v) => { seen.push(JSON.stringify(v)); return v; };

  // the declarations, against the consumer's own stations
  const { controls } = note(findControls(files, { stations: STATIONS }));
  const by = Object.fromEntries(controls.map((x) => [x.id, x]));
  assert.deepEqual(['acme/CTL1', 'acme/CTL2', 'acme/CTL4'].filter((i) => by[i]?.valid), ['acme/CTL1', 'acme/CTL2', 'acme/CTL4'], 'a valid declaration of the consumer is not listed as valid');
  assert.equal(by['acme/CTL3'].valid, false, 'a station that the consumer did not give is accepted');
  const bad = by['acme/CTL3'].problems.find((p) => p.field === 'stations');
  assert.ok(bad, 'the refusal does not name the stations field');
  assert.match(bad.recovery, /Merging/); assert.match(bad.recovery, /Shipping/);
  assert.deepEqual(registryAt(files, 'Merging', STATIONS).map((x) => x.id).sort(), ['acme/CTL1', 'acme/CTL4'], 'the registry of a station of the consumer is wrong');
  assert.deepEqual(note(registryAt(files, 'Shipping', STATIONS)).map((x) => x.mode), ['detective']);
  assert.deepEqual(registryAt(files, 'Promoting', STATIONS), [], 'a station that the consumer did not give registers nothing');

  // the flags
  const places = [{ id: 'acme/CTL1', type: 'preventive', places: ['Merging'] }];
  const ok = validateFlags({ controls: places, source: flagSource(parseFlags(flagsText(['acme/CTL1', 'Merging', 'on']))) });
  assert.equal(ok.ok, true, 'a valid flag file of the consumer is refused');
  const missing = decideOutcome({ validation: note(validateFlags({ controls: places, source: flagSource([]) })), runs: [] });
  assert.equal(missing.outcome, 'CONFIG_FAILED'); assert.equal(missing.exit, 1, 'a missing flag is not a configuration failure');
  const unknown = validateFlags({ controls: places, source: flagSource(parseFlags(flagsText(['acme/CTL1', 'Merging', 'sometimes']))) });
  assert.equal(unknown.ok, false, 'an unknown flag value passes'); note(unknown);

  // the runs, in each mode
  const on = { flag: { name: 'acme/CTL1@Merging', value: 'on' }, run: '1', sha: 'abc', x: 'real' };
  const found = () => ['bad-name'];
  const none = () => [];
  const prev = await runControl({ id: 'acme/CTL1', mode: 'preventive', check: found, input: {}, boundary: on });
  assert.equal(prev.verdict, 'FAIL'); assert.equal(prev.blocked, true, 'a preventive finding does not block');
  assert.equal((await runControl({ id: 'acme/CTL1', mode: 'preventive', check: none, input: {}, boundary: on })).verdict, 'PASS');
  const det = await runControl({ id: 'acme/CTL2', mode: 'detective', check: found, input: {}, boundary: { ...on, flag: { name: 'acme/CTL2@Shipping', value: 'on' } } });
  assert.equal(det.verdict, 'REPORT'); assert.equal(det.blocked, false, 'a detective finding blocks');
  const ratchet = (findings, baseline, previous) => runControl({ id: 'acme/CTL4', mode: 'ratchet', check: () => findings, input: {}, baseline, previous, boundary: { ...on, flag: { name: 'acme/CTL4@Merging', value: 'on' } } });
  assert.equal((await ratchet(['old'], ['old'], ['old'])).blocked, false, 'a ratchet blocks what its baseline allows');
  const grown = await ratchet(['old', 'new'], ['old'], ['old']);
  assert.equal(grown.blocked, true, 'a ratchet lets a new finding through'); assert.ok(grown.reasons.includes('new-finding'));
  assert.equal((await ratchet(['old'], ['old', 'extra'], ['old'])).blocked, true, 'a baseline that grew is accepted');
  for (const r of [prev, det, grown]) note(r);

  // nothing returned names a station that is not the consumer's own (the consumer itself declared 'Promoting' once, in the record that is refused, so that name is checked where it must not be echoed)
  const all = seen.join('\n');
  for (const s of KAAL_STATIONS.filter((n) => n !== 'Promoting')) assert.ok(!all.includes(s), `the package named a station that is not the consumer's: ${s}`);
  assert.ok(!bad.recovery.includes('Promoting') && !JSON.stringify(registryAt(files, 'Merging', STATIONS)).includes('Promoting'), 'the package echoes a station that the consumer did not give');
}
