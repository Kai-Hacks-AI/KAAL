// The wait of the merge-group review (release/C164): reads the check runs of the group's head and asks the one judgment
// (group-state.mjs) until the group is green. Exit 0 green; 1 a required check is red; 2 cannot judge (fails closed).
// A refused read (rate limit 403, 429, 5xx) is retried with a growing wait; a read that keeps failing is exit 2.
// Environment: KAAL_GH (the gh executable), KAAL_REPO (owner/name), KAAL_ATTEMPTS (tries per read, default 5),
// KAAL_INTERVAL (0 = no real waiting, for Cases), KAAL_BUDGET (seconds to wait for the group, default 2700).
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { groupState } from './group-state.mjs';

// The wait in seconds before read n+1: 20 s for the first minute, then growing by 10 s up to 120 s.
export function schedule(n) {
  return n <= 3 ? 20 : Math.min(120, 20 + (n - 3) * 10);
}

const refused = (stderr) => /HTTP (403|429|5\d\d)|rate limit/i.test(stderr);
const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

function option(argv, name) {
  const values = [];
  argv.forEach((arg, i) => { if (arg === name) values.push(argv[i + 1]); });
  return values.flatMap((v) => String(v ?? '').split(',')).filter(Boolean);
}

export async function main(argv, env) {
  const required = option(argv, '--required');
  const [head] = option(argv, '--head');
  const [self] = option(argv, '--self');
  const gh = env.KAAL_GH || 'gh';
  const real = env.KAAL_INTERVAL !== '0';
  const attempts = Number(env.KAAL_ATTEMPTS || 5);
  const budget = Number(env.KAAL_BUDGET || 2700);
  const fail = (message) => { console.error(`::error title=Change Isolation (review): cannot judge::${message}`); return 2; };
  if (!head || !env.KAAL_REPO) return fail('the group head or the repository is not given');
  if (!required.some((name) => name !== self)) return fail('the group lists no other required check to wait for');

  const readRuns = async () => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const r = spawnSync(gh, ['api', `repos/${env.KAAL_REPO}/commits/${head}/check-runs?per_page=100`, '--paginate', '--jq', '.check_runs[] | {name, status, conclusion}'], { encoding: 'utf8' });
      if (r.status === 0) return r.stdout.split('\n').filter(Boolean).map((line) => JSON.parse(line));
      if (!refused(r.stderr || '')) return null;
      const named = /retry-after:\s*(\d+)/i.exec(r.stderr || '');
      if (attempt < attempts && real) await sleep(Math.min(120, named ? Number(named[1]) : 20 * 2 ** (attempt - 1)));
    }
    return null;
  };

  let waited = 0;
  for (let read = 1; ; read += 1) {
    const runs = await readRuns();
    if (!runs) return fail("the group's check runs cannot be read");
    const judged = groupState({ required, runs, self });
    if (judged.state === 'green') return 0;
    if (judged.state === 'red') { console.error(`::error title=Change Isolation (review)::${judged.context} did not succeed on the group, so the group cannot merge`); return 1; }
    const next = schedule(read);
    if (waited + next > budget) return fail("the group's other required checks did not finish in time");
    waited += next;
    if (real) await sleep(next);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) process.exit(await main(process.argv.slice(2), process.env));
