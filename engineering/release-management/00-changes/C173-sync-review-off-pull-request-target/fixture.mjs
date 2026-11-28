// Shared scaffolding of the C173 Cases: the pure SYNC of release/C65, the verify run's own output as the file the acting workflow
// downloads, and GitHub stood in for with the facts the provenance check reads (state, head repository).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pureSync, load, repo } from '../C65-sync-split/fixtures.mjs';
export { load, repo };
export const WF = join(repo, 'engineering/release-management/05-src/wiring/workflows');
export const source = (f) => readFileSync(join(WF, f), 'utf8').split('\n').filter((l) => !l.trim().startsWith('#')).join('\n');
export const sourceExists = (f) => existsSync(join(WF, f));
export const jobOf = (code, name) => code.split(/^  (?=[a-z]+:\n    name: )/m).find((j) => j.includes(`name: ${name}`));
export const RUN = { KAAL_RUN_ID: '4242', KAAL_RUN_NAME: 'sync verify', KAAL_RUN_CONCLUSION: 'success', KAAL_RUN_EVENT: 'pull_request', KAAL_RUN_PATH: '.github/workflows/sync-verify-plain.yml' };
export const BLOBS = { head: 'b1'.repeat(20), main: 'b1'.repeat(20) };

// A world: the verify job has run (its file is `file`), and the acting jobs see the pull request through `pr` (changeable).
export async function world() {
  const { verify, approve, review } = await load('cli.mjs');
  const w = pureSync();
  let file = null;
  const pr = { number: 7, state: 'open', headRepo: 'o/r', baseRef: 'kaal/release/x' };
  const patch = (api) => (args) => {
    const a = args.join(' ');
    if (/pulls\/7$/.test(a)) {
      const base = JSON.parse(api(args));
      return JSON.stringify({ ...base, number: pr.number, state: pr.state, head: { sha: w.state.head, repo: { full_name: pr.headRepo } }, base: { ref: pr.baseRef } });
    }
    if (/contents\/\.github\/workflows\/sync-verify-plain\.yml\?ref=/.test(a)) return JSON.stringify({ sha: /ref=main$/.test(a) ? BLOBS.main : BLOBS.head });
    return api(args);
  };
  const deps = (over = {}) => w.deps({ writeFile: (_p, text) => { file = text; }, readFile: () => file, api: patch(w.deps().api), ...over });
  w.reset();
  const code = verify(w.env({ KAAL_VERDICT_FILE: '/v.json', KAAL_RUN_ID: RUN.KAAL_RUN_ID }), deps());
  const sent = file;
  const actEnv = (extra = {}) => w.env({ KAAL_VERDICT_FILE: '/v.json', ...RUN, KAAL_RUN_HEAD: w.head, KAAL_SYNC_APPROVE: 'on', ...extra });
  return {
    w, pr, verifyCode: code, sent, deps, actEnv, approve, review,
    setFile: (text) => { file = text; },
    envelope: () => JSON.parse(sent),
    run: (fn, env, over) => { w.reset(); return fn(env, deps({ git: w.noGit, ...over })); },
  };
}
