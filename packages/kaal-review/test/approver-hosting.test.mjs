// review/C8, the refusal shown against Hosting's delivered contract: a real grant minted through Hosting's public `mintToken` against a local stand-in of GitHub, the facts read with it by
// `readPullRequestFacts`, and the delivered `judgeApproval` over them. Nothing here reaches the network, and the key pair is generated inside the run.
import assert from 'node:assert/strict';
import { createPublicKey, createVerify, generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as hosting from '@kaihacksai/kaal-hosting';
import { judgeApproval } from '../13-source/scripts/judge-approval.mjs';

const HEAD = '1'.repeat(40);
const BASE = '2'.repeat(40);
const MAIN = '3'.repeat(40);
const DEFAULT = MAIN;
const NOW = 1_800_000_000_000;
const SOON = new Date(NOW + 3_600_000).toISOString().replace(/\.\d+Z$/, 'Z');
const PATH = 'packages/kaal-review/13-source/github-apps/approver.json';
const declaration = JSON.parse(readFileSync(fileURLToPath(new URL('../13-source/github-apps/approver.json', import.meta.url)), 'utf8'));
const pair = generateKeyPairSync('rsa', { modulusLength: 2048, privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
const verify = (jwt) => { const [h, p, s] = jwt.split('.'); return createVerify('RSA-SHA256').update(`${h}.${p}`).verify(createPublicKey(pair.publicKey), Buffer.from(s, 'base64url')); };
const SLUG = 'kaal-approver';
const run = (conclusion = 'success') => ({ id: 11, name: 'verify Sync', head_sha: HEAD, status: 'completed', conclusion, started_at: '2026-11-27T05:00:00Z', app: { slug: 'kaal-inspector', id: 24680 } });

/** GitHub as far as the Approver reads it, with the author of the pull request as GitHub words it. */
function github(author, runs = [run()]) {
  const requests = [];
  let minted = 0;
  const reply = (status, json) => new Response(JSON.stringify(json), { status, headers: { 'content-type': 'application/json' } });
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname);
    const method = init.method ?? 'GET';
    const auth = String((init.headers ?? {}).authorization ?? (init.headers ?? {}).Authorization ?? '').replace(/^Bearer /, '');
    requests.push({ method, path });
    if (auth.split('.').length === 3 && !verify(auth)) return reply(401, { message: 'Bad credentials' });
    if (method === 'GET' && path === '/app') return reply(200, { id: 67890, slug: SLUG, name: 'KAAL Approver' });
    if (method === 'GET' && path === '/repos/o/r/installation') return reply(200, { id: 99, app_id: 67890, app_slug: SLUG, permissions: { metadata: 'read', contents: 'read', pull_requests: 'write', checks: 'read' }, repository_selection: 'selected' });
    if (method === 'POST' && path === '/app/installations/99/access_tokens') {
      minted += 1;
      return reply(201, { token: minted === 1 ? 'ghs_BOOT' : 'ghs_GRANT', expires_at: SOON, permissions: JSON.parse(init.body).permissions, repository_selection: 'selected', repositories: [{ name: 'r' }] });
    }
    if (path === '/repos/o/r') return reply(200, { default_branch: 'main' });
    if (path === '/repos/o/r/commits/main') return reply(200, { sha: MAIN });
    if (path === `/repos/o/r/git/trees/${DEFAULT}`) return reply(200, { truncated: false, tree: [{ path: PATH, type: 'blob', sha: 'e'.repeat(40) }] });
    if (path === `/repos/o/r/contents/${PATH}`) return reply(200, { encoding: 'base64', content: Buffer.from(JSON.stringify({ ...declaration, appId: '67890' })).toString('base64') });
    if (path === '/repos/o/r/pulls/7') return reply(200, { number: 7, user: author, head: { ref: 'claude/w', sha: HEAD }, base: { ref: 'kaal/review/x', sha: BASE, repo: { default_branch: 'main' } } });
    if (path === `/repos/o/r/commits/${HEAD}`) return reply(200, { sha: HEAD, parents: [{ sha: BASE }, { sha: MAIN }] });
    if (path === `/repos/o/r/commits/${HEAD}/check-runs`) return reply(200, { total_count: runs.length, check_runs: runs });
    return reply(404, { message: 'Not Found' });
  };
  return { fetch, api: 'https://stand-in.invalid', requests };
}

async function judged(author, runs) {
  const world = github(author, runs);
  const grant = await hosting.mintToken({ app: 'approver', appId: '67890', privateKey: pair.privateKey, repo: 'o/r', abilities: ['read-contents', 'read-pull-requests', 'read-checks'], }, { fetch: world.fetch, api: world.api, now: () => NOW });
  const facts = await hosting.readPullRequestFacts({ repo: 'o/r', number: 7, check: 'verify Sync' }, { grant, fetch: world.fetch, api: world.api });
  const evidence = { pr: { head: HEAD, base: BASE }, execution: { trigger: 'workflow_run', codeRevision: facts.main, checkedOutHead: false } };
  return { grant, facts, answer: judgeApproval(evidence, facts, grant), evidence };
}
const kinds = (a) => a.findings.map((f) => f.kind);

it('review/C8: the delivered judgement refuses the Approver\'s own pull request, read as Hosting delivers it', async () => {
  const { grant, facts, answer } = await judged({ login: `${SLUG}[bot]`, type: 'Bot' });
  assert.deepEqual(facts.author, { login: `${SLUG}[bot]`, type: 'Bot' }, 'Hosting\'s author fact is { login, type } in GitHub\'s words');
  assert.equal(hosting.grantIdentity(grant).login, `${SLUG}[bot]`, 'the Approver\'s identity is the bot login of the grant');
  assert.equal(answer.decision, 'abstain');
  assert.deepEqual(kinds(answer), ['own-pull-request']);
});

it('review/C8: the delivered judgement approves a clean SYNC of another author, read as Hosting delivers it', async () => {
  const { answer } = await judged({ login: 'claude-bot', type: 'Bot' });
  assert.deepEqual(answer, { decision: 'approve', findings: [] });
});

it('review/C8: a run signed by the Inspector App slug is what counts, and a failure of it is not approved', async () => {
  const { answer } = await judged({ login: 'claude-bot', type: 'Bot' }, [run(), run('failure')]);
  assert.equal(answer.decision, 'abstain');
  assert.ok(kinds(answer).includes('check-not-pass'));
});

it('review/C8: without the grant Hosting minted the delivered judgement abstains', async () => {
  const { facts, evidence } = await judged({ login: 'claude-bot', type: 'Bot' });
  for (const g of [undefined, { app: 'approver', login: 'claude-bot' }]) {
    const a = judgeApproval(evidence, facts, g);
    assert.equal(a.decision, 'abstain');
    assert.ok(kinds(a).includes('grant-untrusted'));
  }
});
