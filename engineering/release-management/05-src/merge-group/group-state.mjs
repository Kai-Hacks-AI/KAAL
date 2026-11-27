// The one judgment of a merge group's required checks (release/C164). Pure: no read, no write, no clock.
// waiting: a required context has no run or one not completed; red: one completed without success, neutral or skipped
// (the group cannot merge, whatever else is pending); green: every required context succeeded.
const PASSING = new Set(['success', 'neutral', 'skipped']);

export function groupState({ required, runs, self }) {
  const contexts = [...new Set(required)].filter((name) => name !== self);
  if (contexts.length === 0) throw new Error('the group lists no other required check to wait for');
  let waiting = false;
  for (const name of contexts) {
    const own = runs.filter((run) => run.name === name);
    if (own.some((run) => run.status === 'completed' && !PASSING.has(run.conclusion))) return { state: 'red', context: name };
    if (!own.some((run) => run.status === 'completed')) waiting = true;
  }
  return { state: waiting ? 'waiting' : 'green' };
}
