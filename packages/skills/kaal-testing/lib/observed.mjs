// What accept() observed in each run it returned, kept where only Testing's
// own modules reach it. The package does not export this module. A run counts
// only as the very object accept() produced in this process, and only through
// this snapshot, so neither a copy nor a later change to the object is
// evidence.

const runs = new WeakMap();

/** Record what accept() observed for the `run` it is about to return. */
export function remember(run, snapshot) {
  runs.set(run, structuredClone(snapshot));
}

/** What accept() observed for `run`, or undefined when `run` is not one it returned. */
export function recall(run) {
  return run !== null && typeof run === "object" ? runs.get(run) : undefined;
}
