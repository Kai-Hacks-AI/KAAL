// Fixtures of release/C99: a stand-in `gh` on PATH that behaves like the cloud session (GraphQL refused with HTTP 403, REST answered from a canned repository),
// and a way to run the Show WIP command against it. POSIX only: the Engineering job that runs these Cases is Linux.
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(import.meta.url).split('/engineering/')[0];
export const DIR = join(repo, 'engineering/release-management/05-src/show-wip');
export const REPO = 'owner/sample';
const GRAPHQL_REFUSED = 'gh: GitHub GraphQL is not available from Claude Code sessions; use the REST API (gh api repos/{owner}/{repo}/...). (HTTP 403)';

const pull = (number, title, from, into) => ({
  number, title, draft: false, state: 'open', mergeable_state: 'clean', auto_merge: null,
  head: { ref: from, sha: `${String(number).repeat(40).slice(0, 40)}`, repo: { full_name: REPO } }, base: { ref: into },
});
export const PULLS = [pull(7, 'PLAN: A sample change', 'claude/sample-plan', 'kaal/release/sample'), pull(8, 'DO: A sample change', 'claude/sample-do', 'kaal/release/sample')];

// `mode` is "cloud" (GraphQL refused, REST answered) or "down" (every call fails with a gateway error).
const STAND_IN = (log, mode) => `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify(args) + '\\n');
const fail = (text) => { process.stderr.write(text + '\\n'); process.exit(1); };
if (${JSON.stringify(mode)} === 'down') fail('gh: HTTP 502 Bad Gateway');
if (args[0] !== 'api') fail('gh: unsupported');
const route = args[1] ?? '';
if (route === 'graphql') fail(${JSON.stringify(GRAPHQL_REFUSED)});
const pulls = ${JSON.stringify(PULLS)};
const out = (value) => process.stdout.write(JSON.stringify(value));
const path = route.replace(/^repos\\/[^/]+\\/[^/]+\\//, '').split('?')[0];
if (path === 'pulls' && /state=open/.test(route)) out(pulls);
else if (path === 'pulls' && /state=all/.test(route)) out([]);
else if (/^pulls\\/\\d+$/.test(path)) out(pulls.find((p) => path.endsWith('/' + p.number)));
else if (/^pulls\\/\\d+\\/reviews$/.test(path)) out([]);
else if (/^commits\\/[0-9a-f]+\\/check-runs$/.test(path)) out({ total_count: 0, check_runs: [] });
else if (/^commits\\/[0-9a-f]+\\/status$/.test(path)) out({ state: 'pending', statuses: [] });
else fail('gh: Not Found (HTTP 404)');
`;

export function standIn(mode = 'cloud') {
  const dir = mkdtempSync(join(tmpdir(), 'c99-'));
  const log = join(dir, 'calls.log');
  writeFileSync(log, '');
  writeFileSync(join(dir, 'gh'), STAND_IN(log, mode));
  chmodSync(join(dir, 'gh'), 0o755);
  return {
    // The calls the command made to `gh`, each as its argument list.
    calls: () => readFileSync(log, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line)),
    show: () => spawnSync(process.execPath, ['run.mjs', REPO, 'show-wip.json'], {
      cwd: DIR, encoding: 'utf8', timeout: 60_000,
      env: { ...process.env, PATH: `${dir}${delimiter}${process.env.PATH}`, SHOW_WIP_PAUSE_MS: '0' },
    }),
    cleanup: () => rmSync(dir, { recursive: true, force: true }),
  };
}
