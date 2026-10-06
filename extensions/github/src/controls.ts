// The controls the GitHub workflows run, one per required check. Each is Git
// mechanics (what is on the target branch, what differs) plus an invocation of
// KAAL, and reports a verdict. None knows what is in a Change, a seal or a
// Node: how KAAL decides is KAAL's, and the policy of which paths a protected
// boundary may share a change with is the only policy of this file's own.
import { changedPaths, withBaseline } from "./git.js";
import { kaal, type Verdict } from "./kaal.js";

/** Where KAAL lies in the repository, and where a Change record lies within it. */
const KAAL_DIR = ".kaal";
const RECORD = /^\.kaal\/(changes|seals\/changes|seals\/trees)\//;

/** The boundaries that travel alone: a change touching one may change nothing outside it, but its own Change record. */
export const BOUNDARIES: { name: string; paths: RegExp }[] = [
  { name: "(packages|engineering)/kaal-core/", paths: /^(packages|engineering)\/kaal-core\// },
  { name: ".github/", paths: /^\.github\// },
];

export function isolateBoundaries(cwd: string, target: string): Verdict {
  const changed = changedPaths(cwd, target);
  const messages: string[] = [];
  for (const { name, paths } of BOUNDARIES) {
    if (!changed.some((p) => paths.test(p))) continue;
    const outside = changed.filter((p) => !paths.test(p) && !RECORD.test(p));
    if (outside.length > 0) messages.push(`This change touches ${name}, so it may change nothing outside it. Also changed:`, ...outside);
  }
  return { ok: messages.length === 0, messages };
}

/** Run a KAAL command with this checkout's `.kaal` as the candidate and the target branch's as the baseline. */
const against = (command: string) => (cwd: string, target: string): Verdict =>
  withBaseline(cwd, target, KAAL_DIR, (baseline) => kaal(command, baseline, `${cwd}/${KAAL_DIR}`));

/** The candidate contains exactly one new closed Change and keeps what was closed. */
export const containChange = against("check-kaal-admission");
/** Every Change closed on the target branch is still closed here, with the same identity. */
export const preserveSealedChanges = against("preserve-kaal-changes");
/** Every Node seal and the Kernel identity on the target branch are still here. */
export const preserveSeals = against("preserve-kaal-seals");

export const CONTROLS: Record<string, (cwd: string, target: string) => Verdict> = {
  "isolate-boundaries": isolateBoundaries,
  "contain-change": containChange,
  "preserve-sealed-changes": preserveSealedChanges,
  "preserve-seals": preserveSeals,
};
