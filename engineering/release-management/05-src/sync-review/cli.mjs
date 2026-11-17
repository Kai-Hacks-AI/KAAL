#!/usr/bin/env node
// release/C58 adapter: the commands the workflow runs for verify Sync, approve Sync and review Sync. It supplies facts and acts on
// the decisions of verify.mjs, approve.mjs and review.mjs, and decides nothing itself. It reads Git objects of the candidate and
// runs nothing of it. Usage: node cli.mjs verify | approve | review
// Environment: KAAL_REPO, KAAL_PR, KAAL_BASE, KAAL_HEAD, KAAL_DEFAULT, GH_TOKEN; KAAL_VERDICT (approve, review); KAAL_SYNC_APPROVE (approve).
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { verifySync } from './verify.mjs';
import { decideApprove } from './approve.mjs';
import { decideReview, LABEL } from './review.mjs';
import { gatherFacts } from './facts.mjs';

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28 });
  return { status: r.status ?? 2, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
};
const git = (args) => run('git', args);
const STATUS = { PASS: 0, FAIL: 1, UNKNOWN: 2 };

function api(args) {
  const r = run('gh', ['api', ...args]);
  if (r.status !== 0) throw new Error(`gh api ${args.filter((a) => !a.startsWith('-')).join(' ')} failed: ${r.stderr.trim().split('\n')[0]}`);
  return r.stdout;
}
const apiJson = (path, extra = []) => JSON.parse(api([path, ...extra]) || 'null');

function needed(env, names) {
  const missing = names.filter((n) => !env[n]);
  if (missing.length) throw new Error(`missing environment: ${missing.join(', ')}`);
}
function readPull(env) {
  const pr = apiJson(`repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}`);
  return { head: pr.head.sha, base: pr.base.ref, title: pr.title ?? '', body: pr.body ?? '', requested: (pr.requested_reviewers ?? []).map((u) => u.login), author: pr.user?.login };
}
function parseVerdict(text) {
  try { const v = JSON.parse(text); return v && typeof v === 'object' ? v : undefined; } catch { return undefined; }
}
const isSync = (pull, base) => pull.title.startsWith('SYNC:') && pull.base === base;
const out = (name, value) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`); };
const summary = (lines) => { if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`); };

export function verify(env) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE', 'KAAL_HEAD', 'KAAL_DEFAULT']);
  let pull;
  try { pull = readPull(env); } catch (e) { console.error(String(e.message)); }
  const facts = gatherFacts({
    git, baseRef: env.KAAL_BASE, baseTipRef: 'refs/kaal/base', mainRef: `refs/remotes/origin/${env.KAAL_DEFAULT}`,
    headSha: env.KAAL_HEAD, currentHead: pull?.head, body: pull?.body,
  });
  const verdict = verifySync(facts);
  const lines = [`${verdict.control}: ${verdict.outcome}`, ...verdict.reasons.map((r) => `- ${r.code}: ${r.detail}`)];
  console.log(lines.join('\n'));
  out('verdict', JSON.stringify(verdict));
  summary(lines);
  return STATUS[verdict.outcome] ?? STATUS.UNKNOWN;
}

export function approve(env) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE']);
  const verdict = parseVerdict(env.KAAL_VERDICT ?? '');
  const pull = readPull(env);
  const reviews = JSON.parse(`[${api([`repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}/reviews`, '--paginate', '--jq', '.[] | tojson']).trim().split('\n').filter(Boolean).join(',')}]`);
  const approvedAtHead = reviews.some((r) => r.state === 'APPROVED' && r.commit_id === pull.head);
  const decision = isSync(pull, env.KAAL_BASE)
    ? decideApprove({ verdict, currentHead: pull.head, mode: env.KAAL_SYNC_APPROVE, approvedAtHead })
    : { action: 'skip', because: 'the pull request is no longer a SYNC into the base that was judged' };
  const line = `approve Sync: ${decision.action}: ${decision.because}`;
  console.log(line);
  summary([line]);
  if (decision.action === 'approve') {
    api(['-X', 'POST', `repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}/reviews`, '-f', 'event=APPROVE', '-f', `commit_id=${pull.head}`, '-f', 'body=approve Sync: verify Sync passes at this head.']);
  }
  return 0;
}

function reviewerOf(path = '.github/CODEOWNERS') {
  try {
    const line = readFileSync(path, 'utf8').split('\n').find((l) => /^\*\s/.test(l));
    return line?.split(/\s+/).slice(1).map((o) => o.replace(/^@/, '')).find((o) => o && !o.includes('/')) ?? null;
  } catch { return null; }
}

export function review(env) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE']);
  const verdict = parseVerdict(env.KAAL_VERDICT ?? '');
  const pull = readPull(env);
  if (!isSync(pull, env.KAAL_BASE)) { console.log('review Sync: skip: the pull request is no longer a SYNC into the base that was judged'); return 0; }
  const reviewer = reviewerOf();
  const labels = apiJson(`repos/${env.KAAL_REPO}/issues/${env.KAAL_PR}/labels`).map((l) => l.name);
  const comments = JSON.parse(`[${api([`repos/${env.KAAL_REPO}/issues/${env.KAAL_PR}/comments`, '--paginate', '--jq', '.[] | tojson']).trim().split('\n').filter(Boolean).join(',')}]`);
  const markers = comments.flatMap((c) => [...(c.body ?? '').matchAll(/<!-- review-sync:([0-9a-f]{7,40}) -->/g)].map((m) => m[1]));
  const existing = { labelled: labels.includes(LABEL), commentedHead: markers.includes(pull.head) ? pull.head : null, reviewRequested: reviewer ? pull.requested.includes(reviewer) : true };
  const actions = decideReview({ verdict, currentHead: pull.head, existing });
  const repo = env.KAAL_REPO, n = env.KAAL_PR;
  for (const a of actions) {
    console.log(`review Sync: ${a.action}`);
    if (a.action === 'label') api(['-X', 'POST', `repos/${repo}/issues/${n}/labels`, '-f', `labels[]=${a.label}`]);
    else if (a.action === 'unlabel') api(['-X', 'DELETE', `repos/${repo}/issues/${n}/labels/${encodeURIComponent(a.label)}`]);
    else if (a.action === 'comment') api(['-X', 'POST', `repos/${repo}/issues/${n}/comments`, '-f', `body=${a.body}`]);
    else if (a.action === 'request-review' && reviewer && reviewer !== pull.author) {
      api(['-X', 'POST', `repos/${repo}/pulls/${n}/requested_reviewers`, '-f', `reviewers[]=${reviewer}`]);
    } else if (a.action === 'request-review') console.log('review Sync: no reviewer to request (none in CODEOWNERS, or the author is the Code Owner)');
  }
  summary([`review Sync: ${actions.length ? actions.map((a) => a.action).join(', ') : 'nothing to do'}`]);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = { verify, approve, review }[process.argv[2]];
  if (!command) { console.error('usage: cli.mjs verify | approve | review'); process.exit(2); }
  try { process.exit(command(process.env)); } catch (e) { console.error(String(e.message)); process.exit(2); }
}
