// The stations of this repository (release/C175): the adopter names them, the controls library does not know them (controls/C161).
// One list, no import, for every caller (the entry helper, Engineering). release/T1690 ties it to the stage declaration and the ruleset sources.
export const STATIONS = ['Developing', 'Collecting', 'Integrating', 'Hotfixing', 'Wiring', 'Promoting', 'Publishing'];

// The station of the target of a pull request (release/C201): the one mapping, beside the list it belongs to. The default branch is where a promotion lands; the lineages, hotfixes and wires have their own.
// A target at no station answers undefined: nothing of this repository is judged there, and an entry never takes that for a pass.
const FOLDERS = [['kaal/', 'Collecting'], ['hotfix/', 'Hotfixing'], ['wire/', 'Wiring']];
export function stationOf({ baseRef, defaultBranch } = {}) {
  if (typeof baseRef !== 'string' || baseRef === '' || typeof defaultBranch !== 'string' || defaultBranch === '') return undefined;
  if (baseRef === defaultBranch) return 'Promoting';
  const hit = FOLDERS.find(([prefix]) => baseRef.startsWith(prefix) && baseRef.length > prefix.length);
  return hit?.[1];
}
