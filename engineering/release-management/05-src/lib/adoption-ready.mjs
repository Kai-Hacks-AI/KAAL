// The readiness of a swap (release/C201): whether the files the base holds put every adopting entry under an enforcing flag at every station its check is judged at.
// It reads the plain workflow sources for the entries that adopt the flag (each supplies KAAL_CONTROL_RECORD), the control records and the instance's flags.json, and it changes nothing.
// For each adopting control and each station the helper can resolve, it asks the same helper the entry asks (`resolveEntry`) and reports a gap: the entry cannot be resolved, the record declares no `preventive` at the station, or the flag is not `on`.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATIONS } from './stations.mjs';
import { resolveEntry, PREVENTIVE } from './entry-flag.mjs';
import { findControls } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/find-controls.mjs';

// The stations a pull request's target can have, and so the places an adopting entry resolves its flag at: the ones stationOf returns.
export const JUDGED = ['Collecting', 'Hotfixing', 'Promoting', 'Wiring'];

const read = (path) => { try { return readFileSync(path, 'utf8'); } catch { return undefined; } };

// The record paths the adopting jobs of the given workflow texts supply, in order, without repeats.
export const adopting = (texts) => [...new Set(texts.flatMap((t) => [...t.matchAll(/^\s*KAAL_CONTROL_RECORD:\s*(\S+)\s*$/gm)].map((m) => m[1])))];

// { ok, gaps } where each gap is `<control>@<station>: <why>`; `recordTexts` maps a record path to its text (undefined when it cannot be read).
export function readiness({ recordPaths, recordTexts, flagsText, stations = JUDGED }) {
  const gaps = [];
  if (recordPaths.length === 0) gaps.push('no adopting entry: no workflow source supplies a control record');
  for (const path of recordPaths) {
    const text = recordTexts[path];
    const id = text === undefined ? undefined : findControls([{ path, text }], { stations: STATIONS }).controls.find((c) => c.valid)?.id;
    if (!id) { gaps.push(`${path}: the control record cannot be read`); continue; }
    for (const station of stations) {
      const r = resolveEntry({ id, station, recordText: text, flagsText });
      if (r.stop) gaps.push(`${id}@${station}: ${r.lines.length > 1 ? r.lines.slice(1).map((l) => l.trim()).join('; ') : r.lines[0].replace(`${id}@${station}: `, '')}`);
      else if (r.mode !== PREVENTIVE) gaps.push(`${id}@${station}: the record declares no preventive`);
      else if (r.flag.value !== 'on') gaps.push(`${id}@${station}: the flag is advisory, not on`);
    }
  }
  return { ok: gaps.length === 0, gaps };
}

export const SOURCES = ['change-isolation-plain.yml', 'branching-plain.yml', 'promotion-source-plain.yml'];

// The command line: `--root <dir>` (default: the current directory), `--workflows <a,b>` (default: the three plain sources). Prints each gap and exits 1, or prints that it is ready and exits 0.
export function cli({ argv = process.argv.slice(2), out = console.log } = {}) {
  const at = (k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };
  const root = at('--root') ?? process.cwd();
  const names = at('--workflows') ? at('--workflows').split(',') : SOURCES;
  const dir = join(root, 'engineering/release-management/05-src/wiring/workflows');
  const texts = names.map((n) => read(join(dir, n)));
  if (texts.some((t) => t === undefined)) { out(`a workflow source cannot be read: ${names.filter((_, i) => texts[i] === undefined).join(', ')}`); return 1; }
  const recordPaths = adopting(texts);
  const recordTexts = Object.fromEntries(recordPaths.map((p) => [p, read(join(root, p))]));
  const flagsPath = join(root, 'engineering/14-operations/controls/flags.json');
  const result = readiness({ recordPaths, recordTexts, flagsText: existsSync(flagsPath) ? read(flagsPath) : undefined });
  for (const g of result.gaps) out(g);
  out(result.ok ? `ready: ${recordPaths.length} adopting entries, ${JUDGED.length} stations each, every flag on and every record preventive` : `not ready: ${result.gaps.length} gaps`);
  return result.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(cli());
