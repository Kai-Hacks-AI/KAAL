// node dispatch.mjs decide | final | raise (release/C73; `final` is release/C93). `decide` reads facts with the token of the workflow and prints the decisions; `raise` takes them as data.
import { appendFileSync } from 'node:fs';
import { decideRaise } from './decide.mjs';
import { decideFinal } from './final-step.mjs';
import { listCollectors, gatherFacts, openPromotions } from './gather.mjs';
import { oneAtATime, readCapacity } from './seat.mjs';
import { raiseAll } from './raise.mjs';

export const withRevision = (decision, facts) => (decision.action === 'raise' ? { ...decision, revision: facts.tip } : decision);

// The one way out. It allows reading, and the creation of a pull request, and nothing else.
export function makeApi(token, fetchImpl = fetch) {
  return async (method, path, body) => {
    const create = method === 'POST' && /^repos\/[^/]+\/[^/]+\/pulls$/.test(path);
    if (method !== 'GET' && !create) throw new Error(`refused: ${method} ${path}`);
    const res = await fetchImpl(`https://api.github.com/${path}`, {
      method,
      headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'kaal-dispatcher', ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw Object.assign(new Error(`${method} ${path}: ${res.status} ${text.slice(0, 300)}`), { status: res.status });
    return text ? JSON.parse(text) : null;
  };
}

async function main(cmd, env) {
  const repo = env.KAAL_REPO;
  if (!/^[\w.-]+\/[\w.-]+$/.test(String(repo))) throw new Error('KAAL_REPO is not owner/name');
  if (cmd === 'decide') {
    const api = makeApi(env.GH_TOKEN);
    const decisions = [];
    for (const c of await listCollectors(api, repo)) {
      const facts = await gatherFacts(api, repo, c);
      decisions.push(withRevision(decideRaise(facts), facts));
    }
    const seated = oneAtATime({ decisions, openPromotions: await openPromotions(api, repo), capacity: readCapacity(env.KAAL_DISPATCH_CAPACITY) });
    const line = JSON.stringify(seated);
    console.log(line);
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `decisions=${line}\n`);
    return 0;
  }
  if (cmd === 'final') {
    const d = decideFinal({ merged: env.KAAL_PR_MERGED === 'true', base: env.KAAL_PR_BASE, mergeSha: env.KAAL_PR_MERGE_SHA, body: env.KAAL_PR_BODY });
    console.log(JSON.stringify(d));
    const line = JSON.stringify(d.action === 'raise' ? [d] : []);
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `decisions=${line}\n`);
    return 0;
  }
  if (cmd === 'raise') {
    let decisions;
    try { decisions = JSON.parse(env.KAAL_DECISIONS || '[]'); } catch { throw new Error('the decisions are not JSON'); }
    if (!Array.isArray(decisions)) throw new Error('the decisions are not a list');
    const live = env.KAAL_DISPATCH_RAISE === 'on';
    const results = await raiseAll({ api: makeApi(env.GH_TOKEN), repo, decisions, live });
    console.log(JSON.stringify({ live, results }));
    return results.some((r) => r.result === 'raised-moved') ? 1 : 0;
  }
  throw new Error('usage: dispatch.mjs decide | final | raise');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()) && process.argv[2]) {
  main(process.argv[2], process.env).then((code) => process.exit(code), (e) => { console.error(String(e.message || e)); process.exit(1); });
}
