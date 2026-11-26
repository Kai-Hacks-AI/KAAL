// hosting/C113 shared fixtures for the draft Cases (T303 to T317). Plain data and a local stand-in for GitHub's API;
// nothing here reaches the network. The stand-in is the only thing a Case injects: the transport (`fetch`, `api`).
// Authority (the type list, the declarations, the write areas and the changed paths) is never injected as data; it
// is read by Hosting from the base revision through the stand-in, as in production. The DO moves what the delivered
// Cases need beside them and removes this file.
import { createServer } from "node:http";

export const DO = {
  type: "DO",
  intro: "A DO pull request. Exactly three chapters.",
  chapters: [
    { name: "Change", guidance: "One line: the id and name." },
    { name: "Implement", guidance: "What this DO delivers." },
    { name: "Refactor", guidance: "What improves while behaviour stays." },
  ],
  raise: { head: ["claude/*"], base: ["kaal/*/*"], autoMerge: "squash", draft: false, title: { forbid: ["\\bC\\d+\\b"] } },
};
export const HOTFIX = {
  type: "HOTFIX",
  chapters: [{ name: "Change", guidance: "The Defect." }],
  raise: { head: ["hotfix/*"], base: ["main"], autoMerge: "none", draft: true },
};
export const SYNC = {
  type: "SYNC",
  chapters: [{ name: "Change", guidance: "The primary incoming Change." }, { name: "Reason", guidance: "Why now." }],
  raise: { head: ["sync/*"], base: ["kaal/*/*"], autoMerge: "merge" },
};
export const declarations = [DO, HOTFIX, SYNC];

export const HEAD = "1".repeat(40);
export const BASE = "2".repeat(40);
export const PATHS = {
  typeList: "packages/kaal-engineering/skills/kaal-engineering/references/pull-request-types.json",
  writeAreas: "packages/kaal-engineering/skills/kaal-engineering/references/write-areas.json",
  declaration: (owner) => `packages/${owner}/13-source/pull-request-types/${owner}.json`,
};
const typeList = { types: [{ type: "DO", owner: "kaal-change" }, { type: "HOTFIX", owner: "kaal-change" }, { type: "SYNC", owner: "kaal-release" }], invalid: ["DEFAULT"] };
// The shape of engineering/C36's write-areas.json, abridged.
const writeAreas = {
  areas: [
    { path: "10-intent", phase: "PLAN" }, { path: "13-source", phase: "DO" }, { path: "02-learnings/retros", phase: "ACT" },
    { path: "01-changes", delegatedTo: "kaal-change" }, { path: "package.json", phase: "DO" },
  ],
  legacy: { "01-intent": "10-intent", "05-src": "13-source", "00-changes": "01-changes" },
  pullRequests: [{ type: "DO", may: ["DO"] }, { type: "HOTFIX", may: ["PLAN", "DO"] }, { type: "SYNC", may: [] }],
};
/** The policy files of the base revision, by path. `extra` replaces or adds files. */
export const policy = (extra = {}) => ({
  [PATHS.typeList]: JSON.stringify(typeList),
  [PATHS.writeAreas]: JSON.stringify(writeAreas),
  [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [DO, HOTFIX] }),
  [PATHS.declaration("kaal-release")]: JSON.stringify({ types: [SYNC] }),
  ...extra,
});

export const chapters = { Implement: "Adds the generator.", Change: "hosting generator", Refactor: "None planned." };
export const request = { repo: "o/r", type: "DO", chapters, head: "claude/work", base: "kaal/hosting/gen", title: "Render pull request templates" };
export const CHANGED = ["packages/kaal-hosting/13-source/a.ts"];

/**
 * A recording stand-in for the API with a repository in it. `refs` maps branch to sha; `files` maps sha to { path: text };
 * `changed` is what the compare of BASE...HEAD lists; `script(req, n)` may override any answer, or throw for a network error.
 */
export function world({ refs = { "claude/work": HEAD, "kaal/hosting/gen": BASE, main: BASE }, files = { [BASE]: policy(), [HEAD]: policy() }, changed = CHANGED, script = () => undefined } = {}) {
  const requests = [];
  const answer = (req, n) => {
    const scripted = script(req, n);
    if (scripted) return scripted;
    const p = decodeURIComponent(req.path);
    let m;
    if (req.method === "GET" && (m = p.match(/^\/repos\/o\/r\/commits\/(.+)$/))) return refs[m[1]] ? { status: 200, json: { sha: refs[m[1]] } } : { status: 404, json: { message: "Not Found" } };
    if (req.method === "GET" && (m = p.match(/^\/repos\/o\/r\/compare\/(\w+)\.\.\.(\w+)$/))) return { status: 200, json: { files: changed.map((c) => (typeof c === "string" ? { filename: c, status: "modified" } : c)) } };
    if (req.method === "GET" && (m = p.match(/^\/repos\/o\/r\/contents\/(.+)$/))) {
      const text = files[req.query.ref]?.[m[1]];
      return text === undefined ? { status: 404, json: { message: "Not Found" } } : { status: 200, json: { encoding: "base64", content: Buffer.from(text).toString("base64") } };
    }
    if (req.method === "POST" && p.endsWith("/pulls")) return { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7", head: { sha: refs[req.body.head] ?? HEAD }, base: { sha: refs[req.body.base] ?? BASE } } };
    if (p.endsWith("/graphql")) return { status: 200, json: { data: { enablePullRequestAutoMerge: { pullRequest: { number: 7 } } } } };
    return { status: 404, json: { message: "unexpected" } };
  };
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const req = { method: init.method ?? "GET", path: u.pathname, query: Object.fromEntries(u.searchParams), headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])), body: init.body ? JSON.parse(init.body) : undefined };
    requests.push(req);
    const { status, json } = answer(req, requests.length);
    return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch, requests, api: "https://stand-in.invalid" };
}
export const options = (w, extra = {}) => ({ token: "ghp_SECRET_TOKEN_VALUE", fetch: w.fetch, api: w.api, ...extra });
export const posts = (requests) => requests.filter((r) => r.method !== "GET").map((r) => `${r.method} ${decodeURIComponent(r.path)}`);
export const reads = (requests) => requests.filter((r) => r.method === "GET").map((r) => decodeURIComponent(r.path) + (r.query.ref ? `@${r.query.ref}` : ""));

/** The same stand-in as a real local HTTP server, for the command line. */
export async function worldServer(config) {
  const inner = world(config);
  const server = createServer((rq, rs) => {
    let text = "";
    rq.on("data", (c) => (text += c));
    rq.on("end", async () => {
      const r = await inner.fetch(`http://x${rq.url}`, { method: rq.method, headers: rq.headers, body: text || undefined });
      rs.writeHead(r.status, { "content-type": "application/json" });
      rs.end(await r.text());
    });
  });
  await new Promise((go) => server.listen(0, "127.0.0.1", go));
  return { requests: inner.requests, api: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}
