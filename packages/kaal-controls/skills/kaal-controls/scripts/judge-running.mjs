// judge Running: turns run records into the Running fact of one control. Pure: it reads no file and calls no service.
// Running describes execution, not outcome: a run that executed and judged counts whatever it found and whether its flag applied the control.
// The mode and whether the flag applied it are told beside it, so a switched-off run never reads as applied. No record is unknown, never false.
import { provenRuns } from './adapter.mjs';
const RAN = ['off', 'detective', 'preventive', 'ratchet'];
const APPLIED = ['detective', 'preventive', 'ratchet'];

// The state of a flag as a record tells it, only when the flag is consistent with itself: the state follows the value (exactly `on` is on, any other text or null is off)
// and the name is text, and an unknown flag carries neither. Anything else is malformed and is not read as on or off.
const stateOf = (f) => {
  if (f === null || typeof f !== 'object' || Array.isArray(f)) return null;
  if (f.state === 'UNKNOWN') return f.name === null && f.value === null ? 'UNKNOWN' : null;
  if (typeof f.name !== 'string' || f.name === '' || !(f.value === null || typeof f.value === 'string')) return null;
  return f.state === (f.value === 'on' ? 'on' : 'off') ? f.state : null;
};

// Whether one counted record shows the control applied: true (flag on, a mode that ran), false (switched off, mode off), or null when it is not told or contradicts itself.
const applied = (r) => (stateOf(r.flag) === 'on' && APPLIED.includes(r.mode) ? true : stateOf(r.flag) === 'off' && r.mode === 'off' ? false : null);

export function judgeRunning({ id, records, revision, established } = {}) {
  const counted = provenRuns({ id, records, revision, established });
  const each = counted.map(applied);
  return {
    id,
    running: counted.length > 0 ? true : null,
    applied: counted.length === 0 ? null : each.includes(true) ? true : each.includes(null) ? null : false,
    modes: [...new Set(counted.map((r) => r.mode).filter((m) => RAN.includes(m)))].sort(),
    runs: counted.length,
  };
}
