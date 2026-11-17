#!/usr/bin/env node
// release/C58 adapter: the commands the workflow runs for verify Sync, approve Sync and review Sync. It supplies facts and acts on
// the decisions of verify.mjs, approve.mjs and review.mjs, and decides nothing itself. It reads Git objects of the candidate and
// runs nothing of it. Usage: node cli.mjs verify | approve | review
// Environment: KAAL_REPO, KAAL_PR, KAAL_BASE, KAAL_HEAD, KAAL_DEFAULT, GH_TOKEN; KAAL_VERDICT (approve, review);
// KAAL_SYNC_APPROVE (approve); KAAL_SYNC_REVIEWER (review, a fallback reviewer).
// The commands take their effects as `deps` so a Case can run them without GitHub.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { verifySync } from './verify.mjs';
import { decideApproveNow, classifyRefusal } from './approve.mjs';
import { decideReview, chooseReviewer, ownersOf, LABEL } from './review.mjs';
import { gatherFacts } from './facts.mjs';

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  return { status: r.status ?? 2, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
};
const STATUS = { PASS: 0, FAIL: 1, UNKNOWN: 2 };

export const realDeps = () => ({
  git: (args) => run('git', args),
  api(args) {
    const r = run('gh', ['api', ...args]);
    if (r.status !== 0) throw new Error(`gh api ${args.filter((a) => !a.startsWith('-')).join(' ')} failed: ${r.stderr.trim().split('\n')[0]}`);
    return r.stdout;
  },
  codeowners: () => { try { return readFileSync('.github/CODEOWNERS', 'utf8'); } catch { return null; } },
  out: (name, value) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`); },
  summary: (lines) => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`); },
  log: (line) => console.log(line),
  error: (title, line) => console.log(`::error title=${title}::${line}`),
});

const lines = (text) => text.trim().split('\n').filter(Boolean);
const needed = (env, names) => {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) throw new Error(`missing environment: ${missing.join(', ')}`);
};
const parseVerdict = (text) => { try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : undefined; } catch { return undefined; } };

function readPull(env, deps) {
  const pr = JSON.parse(deps.api([`repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}`]));
  return { head: pr.head.sha, base: pr.base.ref, title: pr.title ?? '', body: pr.body ?? '', requested: (pr.requested_reviewers ?? []).map((u) => u.login), author: pr.user?.login ?? null };
}
const isSync = (pull, base) => pull.title.startsWith('SYNC:') && pull.base === base;

// The verdict of verify Sync from facts read now: the pull request through the API, the rest from Git objects fetched as data.
function judgeNow(env, deps, headSha) {
  let pull;
  try { pull = readPull(env, deps); } catch (e) { deps.log(String(e.message)); }
  const facts = gatherFacts({
    git: deps.git, baseRef: env.KAAL_BASE, baseTipRef: 'refs/kaal/base', mainRef: `refs/remotes/origin/${env.KAAL_DEFAULT}`,
    headSha: headSha ?? pull?.head, currentHead: pull?.head, body: pull?.body,
  });
  return { verdict: verifySync(facts), pull };
}

export function verify(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE', 'KAAL_HEAD', 'KAAL_DEFAULT']);
  const { verdict } = judgeNow(env, deps, env.KAAL_HEAD);
  const text = [`${verdict.control}: ${verdict.outcome}`, ...verdict.reasons.map((r) => `- ${r.code}: ${r.detail}`)];
  deps.log(text.join('\n'));
  deps.out('verdict', JSON.stringify(verdict));
  deps.summary(text);
  return STATUS[verdict.outcome] ?? STATUS.UNKNOWN;
}

export function approve(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE', 'KAAL_DEFAULT']);
  const verdict = parseVerdict(env.KAAL_VERDICT ?? '');
  const { verdict: fresh, pull } = judgeNow(env, deps);
  if (!pull) { deps.error('approve Sync: cannot judge', 'the pull request cannot be read'); return 2; }
  const reviews = lines(deps.api([`repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}/reviews`, '--paginate', '--jq', '.[] | tojson']) || '').map((l) => JSON.parse(l));
  const approvedAtHead = reviews.some((r) => r.state === 'APPROVED' && r.commit_id === pull.head);
  const decision = isSync(pull, env.KAAL_BASE)
    ? decideApproveNow({ verdict, fresh, currentHead: pull.head, mode: env.KAAL_SYNC_APPROVE, approvedAtHead })
    : { action: 'skip', because: 'the pull request is no longer a SYNC into the base that was judged' };
  const line = `approve Sync: ${decision.action}: ${decision.because}`;
  deps.log(line);
  deps.summary([line]);
  if (decision.action !== 'approve') { deps.out('approval', decision.action === 'would-approve' ? 'would-approve' : 'skipped'); return 0; }
  // read the head once more immediately before submitting, and attach the approval to exactly that commit
  const last = readPull(env, deps);
  if (last.head !== pull.head) { deps.log('approve Sync: skip: the head moved while deciding'); deps.out('approval', 'skipped'); return 0; }
  try {
    deps.api(['-X', 'POST', `repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}/reviews`, '-f', 'event=APPROVE', '-f', `commit_id=${pull.head}`, '-f', 'body=approve Sync: verify Sync passes at this head.']);
  } catch (e) {
    // Only the refusal that names a setting is named; every other failure stays what it is.
    if (classifyRefusal(e?.message) !== 'actions-not-permitted') throw e;
    deps.out('approval', 'refused');
    deps.error('approve Sync: Actions may not approve', 'turn on "Allow GitHub Actions to create and approve pull requests" in the repository settings, or in the organization settings if it is blocked there; this SYNC is put in front of a person meanwhile');
    return 1;
  }
  deps.out('approval', 'approved');
  return 0;
}

export function review(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE', 'KAAL_DEFAULT']);
  const { verdict: fresh, pull } = judgeNow(env, deps);
  if (!pull) { deps.error('review Sync: cannot reach a person', 'the pull request cannot be read, so it cannot be put in front of anyone'); return 2; }
  if (!isSync(pull, env.KAAL_BASE)) { deps.log('review Sync: skip: the pull request is no longer a SYNC into the base that was judged'); return 0; }
  const repo = env.KAAL_REPO, n = env.KAAL_PR;
  const reviewer = chooseReviewer({ owners: ownersOf(deps.codeowners()), fallback: env.KAAL_SYNC_REVIEWER || null, author: pull.author });
  const labels = JSON.parse(deps.api([`repos/${repo}/issues/${n}/labels`])).map((l) => l.name);
  const comments = lines(deps.api([`repos/${repo}/issues/${n}/comments`, '--paginate', '--jq', '.[] | tojson']) || '').map((l) => JSON.parse(l));
  const markers = comments.flatMap((c) => [...(c.body ?? '').matchAll(/<!-- review-sync:([0-9a-f]{7,40}) -->/g)].map((m) => m[1]));
  const existing = { labelled: labels.includes(LABEL), commentedHead: markers.includes(pull.head) ? pull.head : null, reviewRequested: reviewer ? pull.requested.some((r) => r.toLowerCase() === reviewer.toLowerCase()) : false };
  const actions = decideReview({ verdict: fresh, currentHead: pull.head, existing, approval: env.KAAL_APPROVAL });
  for (const a of actions) {
    deps.log(`review Sync: ${a.action}`);
    if (a.action === 'label') deps.api(['-X', 'POST', `repos/${repo}/issues/${n}/labels`, '-f', `labels[]=${a.label}`]);
    else if (a.action === 'unlabel') deps.api(['-X', 'DELETE', `repos/${repo}/issues/${n}/labels/${encodeURIComponent(a.label)}`]);
    else if (a.action === 'comment') {
      const note = reviewer ? '' : '\n\nNo reviewer could be requested: no Code Owner other than the author is listed. A person must be asked by hand.';
      deps.api(['-X', 'POST', `repos/${repo}/issues/${n}/comments`, '-f', `body=${a.body}${note}`]);
    } else if (a.action === 'request-review' && reviewer) deps.api(['-X', 'POST', `repos/${repo}/pulls/${n}/requested_reviewers`, '-f', `reviewers[]=${reviewer}`]);
  }
  deps.summary([`review Sync: ${actions.length ? actions.map((a) => a.action).join(', ') : 'nothing to do'}`]);
  // A SYNC that needs a person and has no one to ask is a red run, never a quiet pass.
  if (actions.length && !reviewer && actions.some((a) => a.action === 'request-review')) {
    deps.error('review Sync: no eligible reviewer', 'this SYNC needs a person and no Code Owner other than its author is listed: add one to .github/CODEOWNERS or set the repository variable KAAL_SYNC_REVIEWER, then ask for a review by hand');
    return 1;
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = { verify, approve, review }[process.argv[2]];
  if (!command) { console.error('usage: cli.mjs verify | approve | review'); process.exit(2); }
  try { process.exit(command(process.env)); } catch (e) { console.error(String(e.message)); process.exit(2); }
}
