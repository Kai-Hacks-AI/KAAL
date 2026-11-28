// The flag of an entry (release/C167): what an entry of a replaced check reads before it runs and what it hands the controls adapter.
// Release declares the mode a control is meant to run in, at a station, in the control's own record (`stations: [<Station>:<mode>]`); the controls instance owns the flag
// (engineering/14-operations/controls/flags.json); the controls library decides what the combination means (controls/C164). This file reads both, validates, and returns the library's answer:
// it maps no flag value to a mode, defaults no missing value, carries no mode literal of a control and sets no exit code of its own.
import { readFileSync } from 'node:fs';
import { STATIONS, stationOf } from './stations.mjs';
import { findControls } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs';
import { parseFlags, flagSource, validateFlags, decideOutcome } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/flags.mjs';
import { toBoundary } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/stamp.mjs';

export { STATIONS };

export const DETECTIVE = 'detective';
export const PREVENTIVE = 'preventive';

// The mode a record declares for a station. A control with no declaration for the station is never preventive.
export const declaredMode = (control, station) => (control?.stations?.find((s) => s.station === station)?.mode === PREVENTIVE ? PREVENTIVE : DETECTIVE);

const readText = (path) => { try { return readFileSync(path, 'utf8'); } catch { return undefined; } };

// The job engages the flag by supplying KAAL_FLAGS (the path of the flag file as the base holds it), KAAL_STATION (the place of the control) and KAAL_CONTROL_RECORD (the path of the control's record as the base holds it).
// A job that supplies none of them has not adopted the flag, and behaves as it did.
export const engaged = (env) => env.KAAL_FLAGS !== undefined;

// Before the entry runs: { mode, flag } to run with, or { stop, exit, lines } when nothing runs.
//   a record that cannot be read answers UNKNOWN (exit 2); a flag file missing, unparsable, with no entry or with an unrecognized value is the library's CONFIG_FAILED (exit 1, nothing runs, no record);
//   a stopped flag does not run the control (exit 0).
export function resolveEntry({ id, station, recordText, flagsText }) {
  const control = recordText === undefined ? undefined : findControls([{ path: `${id}.md`, text: recordText }], { stations: STATIONS }).controls.find((c) => c.id === id && c.valid);
  if (!control) return { stop: true, exit: 2, lines: [`${id}@${station}: UNKNOWN (the control record cannot be read)`] };
  const mode = declaredMode(control, station);
  let entries = [];
  if (typeof flagsText === 'string') { try { entries = parseFlags(flagsText); } catch { entries = []; } }
  const source = flagSource(entries);
  const validation = validateFlags({ controls: [{ id, type: mode, places: [station] }], source });
  if (!validation.ok) {
    const o = decideOutcome({ validation, runs: [] });
    return { stop: true, exit: o.exit, lines: [`${id}@${station}: ${o.outcome}`, ...o.reasons.map((r) => `  ${r}`)] };
  }
  const { name, value } = source.of(id, station);
  const flag = toBoundary(name, value);
  if (flag === null) return { stop: true, exit: 0, lines: [`${id}@${station}: stopped, not run`] };
  return { mode, flag };
}

// The environment form of resolveEntry, for an entry's command line. Returns undefined when the job has not adopted the flag.
// The station is the one the job supplies (KAAL_STATION), else the station of the target (release/C201). A target at no station is never a pass: the answer is UNKNOWN (exit 2) and no flag is read.
// The answer carries the station it was resolved at, so the exit of the run is the library's for that place.
export function fromEnv({ id, env, baseRef }) {
  if (!engaged(env)) return undefined;
  const station = env.KAAL_STATION ?? stationOf({ baseRef, defaultBranch: env.KAAL_DEFAULT });
  if (station === undefined) return { stop: true, exit: 2, lines: [`${id}: UNKNOWN (the target ${baseRef ?? '(none)'} is at no station)`] };
  return { ...resolveEntry({ id, station, recordText: env.KAAL_CONTROL_RECORD ? readText(env.KAAL_CONTROL_RECORD) : undefined, flagsText: env.KAAL_FLAGS ? readText(env.KAAL_FLAGS) : undefined }), station };
}

// The boundary with the flag the library hands over; a run that is not known has the flag alone.
export const withFlag = (boundary, flag) => (flag ? { ...boundary, flag } : boundary);

// The exit of an engaged run: the library's, from what the run did.
export const exitOf = ({ id, station, answer }) => decideOutcome({ validation: { ok: true, errors: [] }, runs: [{ control: id, place: station, applied: answer.applied ?? null, blocked: answer.blocked === true }] }).exit;
