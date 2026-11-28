#!/usr/bin/env node
// release/C58 adapter: the commands the workflow runs for verify Sync, approve Sync and review Sync. It supplies facts and acts on
// the decisions of verify.mjs, approve.mjs and review.mjs, and decides nothing itself. release/C65: only `verify` reads the
// candidate, as Git objects, in a job that holds no token and calls no API; it runs nothing of it. `approve` and `review` run where
// a token can write and read no Git object of the candidate: they take the verdict of `verify` as data and check it against the
// pull request and the base as GitHub says they are now. Usage: node cli.mjs verify | approve | review
// Environment: KAAL_REPO, KAAL_PR, KAAL_BASE, KAAL_DEFAULT; verify: KAAL_HEAD, KAAL_BODY; approve and review: GH_TOKEN, KAAL_VERDICT;
// KAAL_SYNC_APPROVE (approve); KAAL_SYNC_REVIEWER (review, a fallback reviewer).
// The commands take their effects as `deps` so a Case can run them without GitHub.
import { spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { verifySync } from './verify.mjs';
import { decideApproveNow, classifyRefusal } from './approve.mjs';
import { decideReview, chooseReviewer, ownersOf, cleanVerdict, LABEL } from './review.mjs';
import { gatherFacts } from './facts.mjs';
import { checkProvenance, VERIFY_PATH } from './provenance.mjs';
import { sign as signCheck } from './sign.mjs';

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
  readFile: (path) => { try { return readFileSync(path, 'utf8'); } catch { return null; } },
  writeFile: (path, text) => writeFileSync(path, text),
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
  return { number: pr.number, state: pr.state, headRepo: pr.head.repo?.full_name ?? null, head: pr.head.sha, base: pr.base.ref, title: pr.title ?? '', body: pr.body ?? '', requested: (pr.requested_reviewers ?? []).map((u) => u.login), author: pr.user?.login ?? null };
}
const isSync = (pull, base) => pull.title.startsWith('SYNC:') && pull.base === base;

// The base's tip as GitHub says it is now.
function readBaseTip(env, deps) {
  const ref = JSON.parse(deps.api([`repos/${env.KAAL_REPO}/git/ref/heads/${env.KAAL_BASE}`]));
  return ref?.object?.sha ?? null;
}

// release/C65: the verdict of verify Sync, from the Git objects the job fetched and the event's own head and body. No API call.
export function verify(env, deps = realDeps()) {
  needed(env, ['KAAL_PR', 'KAAL_BASE', 'KAAL_HEAD', 'KAAL_DEFAULT']);
  const facts = gatherFacts({
    git: deps.git, baseRef: env.KAAL_BASE, baseTipRef: 'refs/kaal/base', mainRef: `refs/remotes/origin/${env.KAAL_DEFAULT}`,
    headSha: env.KAAL_HEAD, currentHead: env.KAAL_HEAD, body: env.KAAL_BODY ?? '',
  });
  const verdict = verifySync(facts);
  const text = [`${verdict.control}: ${verdict.outcome}`, ...verdict.reasons.map((r) => `- ${r.code}: ${r.detail}`)];
  deps.log(text.join('\n'));
  deps.out('verdict', JSON.stringify(verdict));
  // release/C173: the verdict leaves the token-free job as data in a file that names its run, pull request, head and base ref.
  if (env.KAAL_VERDICT_FILE) deps.writeFile(env.KAAL_VERDICT_FILE, JSON.stringify({ runId: env.KAAL_RUN_ID ?? null, pr: Number(env.KAAL_PR), head: env.KAAL_HEAD, baseRef: env.KAAL_BASE, verdict }));
  deps.summary(text);
  return STATUS[verdict.outcome] ?? STATUS.UNKNOWN;
}

// release/C173: with KAAL_VERDICT_FILE the verdict is read from the verify run's artifact and trusted only when its provenance holds
// (provenance.mjs). Without it, the verdict is the text of KAAL_VERDICT (the release/C65 shape). A refused verdict is null and says why.
// The blob of the verify workflow at the run's head and on the default branch, as GitHub says (read only, no checkout).
function workflowBlobs(env, deps) {
  const blob = (ref) => { try { return JSON.parse(deps.api([`repos/${env.KAAL_REPO}/contents/${VERIFY_PATH}?ref=${encodeURIComponent(ref)}`])).sha ?? null; } catch { return null; } };
  return { blobAtHead: env.KAAL_RUN_HEAD ? blob(env.KAAL_RUN_HEAD) : null, blobOnDefault: env.KAAL_DEFAULT ? blob(env.KAAL_DEFAULT) : null };
}
function loadVerdict(env, deps, pull, baseTip, { requireSuccess }) {
  if (!env.KAAL_VERDICT_FILE) return { verdict: parseVerdict(env.KAAL_VERDICT ?? ''), refusals: [] };
  const text = deps.readFile(env.KAAL_VERDICT_FILE);
  const envelope = text == null ? null : parseVerdict(text);
  const run = { id: env.KAAL_RUN_ID, name: env.KAAL_RUN_NAME, conclusion: env.KAAL_RUN_CONCLUSION, head: env.KAAL_RUN_HEAD, event: env.KAAL_RUN_EVENT, path: env.KAAL_RUN_PATH, ...workflowBlobs(env, deps) };
  const r = checkProvenance({ envelope, run, pull: pull && { ...pull, baseRef: pull.base, baseSha: baseTip }, repo: env.KAAL_REPO, requireSuccess });
  for (const x of r.refusals) deps.log(`verdict refused: ${x.code}: ${x.detail}`);
  return { verdict: r.verdict, refusals: r.refusals };
}

export function approve(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE']);
  let pull, baseTip;
  try { pull = readPull(env, deps); baseTip = readBaseTip(env, deps); } catch (e) { deps.log(String(e.message)); }
  if (!pull) { deps.error('approve Sync: cannot judge', 'the pull request cannot be read'); return 2; }
  const { verdict, refusals } = loadVerdict(env, deps, pull, baseTip, { requireSuccess: true });
  if (refusals.length) { const line = `approve Sync: skip: the verdict is refused (${refusals.map((x) => x.code).join(', ')})`; deps.log(line); deps.summary([line]); deps.out('approval', 'skipped'); return 0; }
  const reviews = lines(deps.api([`repos/${env.KAAL_REPO}/pulls/${env.KAAL_PR}/reviews`, '--paginate', '--jq', '.[] | tojson']) || '').map((l) => JSON.parse(l));
  const approvedAtHead = reviews.some((r) => r.state === 'APPROVED' && r.commit_id === pull.head);
  const decision = isSync(pull, env.KAAL_BASE)
    ? decideApproveNow({ verdict, live: { head: pull.head, baseTip }, currentHead: pull.head, mode: env.KAAL_SYNC_APPROVE, approvedAtHead })
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

// release/C173: the Inspector signs verify Sync from the bound verdict. Hosting is the package built from the default branch.
export async function sign(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE']);
  let pull, baseTip;
  try { pull = readPull(env, deps); baseTip = readBaseTip(env, deps); } catch (e) { deps.log(String(e.message)); }
  if (!pull) { deps.error('sign Sync: cannot judge', 'the pull request cannot be read'); return 2; }
  const { verdict } = loadVerdict(env, deps, pull, baseTip, { requireSuccess: false });
  const hosting = deps.hosting ?? await import(pathToFileURL(env.KAAL_HOSTING_ENTRY).href);
  return signCheck({ verdict, head: pull.head, repo: env.KAAL_REPO, runId: env.KAAL_RUN_ID, env, hosting, out: deps.out, log: deps.log, error: deps.error });
}

// release/C173: approve Sync does not judge. Review C8 judges (`judgeApproval(evidence, facts, grant)` of kaal-review), on the facts
// Hosting reads with the Approver's own grant, and this entry only carries the answer out: Hosting's postReview at the head C8 judged,
// and only when KAAL_SYNC_APPROVE is exactly `on`. Without C8 or the Approver credential it is a dry run that says what it would ask.
// `sign Sync` has posted the check before the facts are read, or C8 abstains with check-missing.
export async function approveJudged(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR']);
  const dry = (why) => { deps.log(`approve Sync: would ask Review C8: ${why}`); deps.summary([`approve Sync: dry run: ${why}`]); deps.out('approval', 'would-approve'); return 0; };
  if (!env.KAAL_APP_APPROVER_ID || !env.KAAL_APP_APPROVER_KEY) return dry('the Approver App credential is not set');
  const judge = deps.judge ?? (env.KAAL_JUDGE_APPROVAL_ENTRY ? (await import(pathToFileURL(env.KAAL_JUDGE_APPROVAL_ENTRY).href)).judgeApproval : null);
  if (typeof judge !== 'function') return dry('the judgment of Review C8 is not installed in this repository yet');
  const hosting = deps.hosting ?? await import(pathToFileURL(env.KAAL_HOSTING_ENTRY).href);
  let grant, facts;
  try {
    grant = await hosting.mintToken({ app: 'approver', appId: env.KAAL_APP_APPROVER_ID, privateKey: env.KAAL_APP_APPROVER_KEY, repo: env.KAAL_REPO, abilities: ['approve-pull-requests'] });
    facts = await hosting.readPullRequestFacts({ repo: env.KAAL_REPO, number: Number(env.KAAL_PR), check: 'verify Sync' }, { grant });
  } catch (e) { deps.error('approve Sync: cannot read the facts', String(e?.message ?? e).slice(0, 200)); deps.out('approval', 'skipped'); return 2; }
  const evidence = { pr: { head: facts?.head?.sha, base: facts?.base?.sha }, execution: { trigger: env.KAAL_EVENT_NAME, codeRevision: deps.git(['rev-parse', 'HEAD']).stdout.trim(), checkedOutHead: false } };
  const answer = judge(evidence, facts, grant);
  deps.log(`approve Sync: Review C8 says ${answer.decision}${answer.findings?.length ? `: ${answer.findings.map((f) => f.kind).join(', ')}` : ''}`);
  if (answer.decision !== 'approve') { deps.out('approval', 'skipped'); return 0; }
  if (env.KAAL_SYNC_APPROVE !== 'on') { deps.out('approval', 'would-approve'); return 0; }
  try {
    await hosting.postReview({ revision: facts.head.sha, event: 'APPROVE' }, { grant });
    deps.out('approval', 'approved');
    return 0;
  } catch (e) { deps.out('approval', 'refused'); deps.error('approve Sync: the approval was refused', String(e?.message ?? e).slice(0, 200)); return 1; }
}

export function review(env, deps = realDeps()) {
  needed(env, ['KAAL_REPO', 'KAAL_PR', 'KAAL_BASE']);
  let pull;
  try { pull = readPull(env, deps); } catch (e) { deps.log(String(e.message)); }
  if (!pull) { deps.error('review Sync: cannot reach a person', 'the pull request cannot be read, so it cannot be put in front of anyone'); return 2; }
  if (!isSync(pull, env.KAAL_BASE)) { deps.log('review Sync: skip: the pull request is no longer a SYNC into the base that was judged'); return 0; }
  // release/C65: the verdict is data from verify Sync, read strictly and kept to what it may say; one of another head is not acted on,
  // a run for the newer head does that.
  // A refused verdict (release/C173) is no verdict: the SYNC is put in front of a person, never passed quietly.
  let baseNow = null;
  try { baseNow = readBaseTip(env, deps); } catch (e) { deps.log(String(e.message)); }
  let verdict = cleanVerdict(loadVerdict(env, deps, pull, baseNow, { requireSuccess: false }).verdict);
  if (verdict?.analyzed?.head && verdict.analyzed.head !== pull.head) { deps.log('review Sync: skip: the verdict is of another head than the current one'); return 0; }
  // A pass that judged a base which has since moved is no pass for this head: the SYNC is behind and needs a person.
  if (verdict?.passes) {
    let tip = null;
    try { tip = readBaseTip(env, deps); } catch (e) { deps.log(String(e.message)); }
    if (tip !== verdict.analyzed.base.tip) verdict = { ...verdict, outcome: 'FAIL', passes: false, reasons: [{ code: 'base-moved', detail: 'the base moved after verify Sync judged this head' }] };
  }
  const repo = env.KAAL_REPO, n = env.KAAL_PR;
  const reviewer = chooseReviewer({ owners: ownersOf(deps.codeowners()), fallback: env.KAAL_SYNC_REVIEWER || null, author: pull.author });
  const labels = JSON.parse(deps.api([`repos/${repo}/issues/${n}/labels`])).map((l) => l.name);
  const comments = lines(deps.api([`repos/${repo}/issues/${n}/comments`, '--paginate', '--jq', '.[] | tojson']) || '').map((l) => JSON.parse(l));
  const markers = comments.flatMap((c) => [...(c.body ?? '').matchAll(/<!-- review-sync:([0-9a-f]{7,40}) -->/g)].map((m) => m[1]));
  const existing = { labelled: labels.includes(LABEL), commentedHead: markers.includes(pull.head) ? pull.head : null, reviewRequested: reviewer ? pull.requested.some((r) => r.toLowerCase() === reviewer.toLowerCase()) : false };
  const actions = decideReview({ verdict, currentHead: pull.head, existing, approval: env.KAAL_APPROVAL });
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
  const command = { verify, approve, 'approve-judged': approveJudged, review, sign }[process.argv[2]];
  if (!command) { console.error('usage: cli.mjs verify | sign | approve | review'); process.exit(2); }
  try { process.exit(await command(process.env)); } catch (e) { console.error(String(e.message)); process.exit(2); }
}
