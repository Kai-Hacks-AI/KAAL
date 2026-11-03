// Synthetic provider/cryptographic fixtures. No GitHub credentials or live claims.
import { webcrypto } from 'node:crypto'; // signatures only; all KAAL digests use Foundation
import { fixture, snapshot } from '../full-fixtures.mjs';
import { establishFullMatrix, fullExpected, fullManifest, digest } from '../full-policy.mjs';
import { createAuthenticator } from './auth.mjs';
import { createAcquirer } from './acquire.mjs';
const { subtle } = webcrypto, encoder = new TextEncoder();
const pair = await subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048,
  publicExponent: new Uint8Array([1,0,1]), hash: 'SHA-256' }, false, ['sign', 'verify']);
const webhookKey = await subtle.generateKey({ name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
export const attestorSha = '9'.repeat(40), attestorRef = `Kai-Hacks-AI/KAAL/.github/workflows/attestor.yml@${attestorSha}`;
let serial = 0;
export async function token(claims, header = {}) {
  const text = b64({ alg: 'RS256', typ: 'JWT', kid: 'fixture', ...header }) + '.' + b64(claims);
  const signature = await subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, encoder.encode(text));
  return text + '.' + Buffer.from(signature).toString('base64url');
}
export async function signedBody(payload) {
  const bytes = encoder.encode(JSON.stringify(payload));
  const signature = 'sha256=' + Buffer.from(await subtle.sign('HMAC', webhookKey, bytes)).toString('hex');
  return { bytes, headers: { signature, deliveryId: 'delivery-1' } };
}
export function authFixture(options = {}) {
  const used = new Set();
  return createAuthenticator({ subtle, webhookKey, issuerKeys: { fixture: pair.publicKey },
    audience: 'kaal-ci-shadow', attestorRef, attestorSha, installationId: 777,
    replay: { async claim(id) { if (used.has(id)) return false; used.add(id); return true; } }, ...options });
}
export function claimsFor(f, w, p) {
  const sec = Math.floor(f.now / 1000);
  return { iss: 'https://token.actions.githubusercontent.com', aud: `kaal-ci-shadow/${f.authority.contextDigest}`,
    iat: sec - 5, nbf: sec - 5, exp: sec + 120, jti: `fixture-${++serial}`,
    job_workflow_ref: attestorRef, job_workflow_sha: attestorSha, repository_id: String(f.context.repositoryId),
    run_id: String(p.runId), run_attempt: String(p.attempt), workflow_sha: p.workflowSha,
    workflow_ref: `${f.context.repository}/${w.path}@${p.ref}`, event_name: w.event,
    check_run_id: String(p.attestorCheckRunId), ref: p.ref,
    base_ref: f.context.event === 'pull_request' ? f.context.baseRef : '' };
}
export function providerFixture(event = 'pull_request', target = 'main') {
  const f = fixture(event, target);
  f.context.evidenceSchema = 'kaal.full-evidence/v2'; f.context.headRepositoryId = 123;
  if (event === 'push') f.context.pushIdentity = digest({ fixturePush: 1 });
  const workflows = fullExpected(f.authority).workflows;
  workflows.forEach((w, i) => Object.assign(f.context.producers[w.path], {
    workflowSha: 'f'.repeat(40), governanceSha: 'e'.repeat(40),
    testedSha: w.event === 'pull_request_target' ? f.context.headSha : f.context.testedSha,
    testedTreeSha: w.event === 'pull_request_target' ? '7'.repeat(40) : f.context.testedTreeSha,
    providerRunSha: f.context.headSha, providerCheckSha: f.context.testedSha,
    attestorCheckRunId: 5000 + i * 100, ref: w.event === 'pull_request' ? 'refs/pull/800/merge' : `refs/heads/${target}`,
  }));
  f.authority = establishFullMatrix(f.context, snapshot()); f.manifest = fullManifest(f.authority);
  const runs = [], jobs = new Map(), checks = new Map(), sources = snapshot().sources, requests = [];
  workflows.forEach((w, i) => {
    const p = f.context.producers[w.path];
    runs.push({ id: p.runId, workflow_id: w.id, path: w.path, event: w.event, run_attempt: p.attempt,
      head_sha: p.providerRunSha, repository: { id: f.context.repositoryId }, check_suite_id: 200 + i,
      status: 'completed', conclusion: 'success', run_started_at: new Date(f.context.startedAt).toISOString() });
    jobs.set(p.runId, w.jobs.map((j, k) => {
      const checkId = 5000 + i * 100 + k;
      checks.set(checkId, { id: checkId, name: j.check, app: { id: w.appId }, check_suite: { id: 200 + i },
        head_sha: p.providerCheckSha, status: 'completed', conclusion: 'success' });
      return { id: 1000 + i * 100 + k, run_id: p.runId, run_attempt: p.attempt, name: j.check,
        labels: j.labels, check_run_url: `https://api.github.com/repos/Kai-Hacks-AI/KAAL/check-runs/${checkId}`,
        status: 'completed', conclusion: 'success', started_at: new Date(f.context.startedAt + 1000).toISOString(),
        completed_at: new Date(f.context.startedAt + 30000).toISOString() };
    }));
  });
  let hook, receiptOverride, proofOverride, current = structuredClone(f.context);
  const transport = { async request(req) {
    requests.push(req);
    const url = new URL(req.path, 'https://api.github.com'), path = url.pathname.replace('/repos/Kai-Hacks-AI/KAAL', '');
    let body;
    if (path === '/') body = { id: f.context.repositoryId, full_name: f.context.repository };
    else if (path.startsWith('/pulls/')) body = { number: f.context.pr, state: 'open',
      base: { repo: { id: f.context.repositoryId }, sha: f.context.baseSha, ref: f.context.baseRef },
      head: { sha: f.context.headSha, repo: { id: f.context.headRepositoryId } }, merge_commit_sha: f.context.testedSha };
    else if (path === '/git/ref/heads/main') body = { object: { sha: f.context.headSha } };
    else if (path === '/actions/runs') {
      const population = runs.filter(r => r.head_sha === url.searchParams.get('head_sha'));
      const page = Number(url.searchParams.get('page')); body = { total_count: population.length, workflow_runs: population.slice((page-1)*100, page*100) };
    } else if (/\/attempts\/\d+\/jobs$/.test(path)) {
      const all = jobs.get(Number(path.split('/')[3])); const page = Number(url.searchParams.get('page'));
      body = { total_count: all.length, jobs: all.slice((page-1)*100, page*100) };
    } else if (path.startsWith('/actions/runs/')) body = runs.find(r => r.id === Number(path.split('/').at(-1)));
    else if (path.startsWith('/check-runs/')) body = checks.get(Number(path.split('/').at(-1)));
    else if (path.startsWith('/contents/')) body = { encoding: 'base64', content: Buffer.from(sources[path.slice(10)]).toString('base64') };
    else throw new Error(`unexpected fixture request ${req.path}`);
    const response = { status: 200, origin: 'https://api.github.com', body: structuredClone(body) };
    return hook ? await hook(req, response) ?? response : response;
  } };
  const ports = { transport, authenticator: authFixture(), clock: { now: () => f.now }, readCurrent: async () => structuredClone(current),
    receiptStore: { async get(runId) {
      const w = workflows.find(w => f.context.producers[w.path].runId === runId), p = f.context.producers[w.path];
      return token({ ...claimsFor(f, w, p), ...receiptOverride });
    } }, proofReader: { async read({ context, producer: p }) { return proofOverride ?? { ...p,
      repositoryId: context.repositoryId, headRepositoryId: context.headRepositoryId,
      contextDigest: digest(context) }; } } };
  return { f, runs, jobs, checks, requests, ports, onRequest(fn) { hook = fn; },
    overrideReceipt(value) { receiptOverride = value; }, overrideProof(value) { proofOverride = value; },
    setCurrent(value) { current = value; }, acquirer: createAcquirer(ports),
    acquire() { return this.acquirer.acquire(f.context, snapshot(), f.now); } };
}
