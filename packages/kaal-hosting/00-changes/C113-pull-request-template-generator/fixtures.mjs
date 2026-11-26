// hosting/C113 shared fixtures for the draft Cases (T303 to T316). Plain data and a local stand-in for GitHub's API;
// nothing here reaches the network. The DO moves what the delivered Cases need beside them and removes this file.
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
export const SYNC = {
  type: "SYNC",
  chapters: [{ name: "Change", guidance: "The primary incoming Change." }, { name: "Reason", guidance: "Why now." }],
  raise: { head: ["sync/*"], base: ["kaal/*/*", "hotfix/*"], autoMerge: "merge" },
};
export const HOTFIX = {
  type: "HOTFIX",
  chapters: [{ name: "Change", guidance: "The Defect." }],
  raise: { head: ["hotfix/*"], base: ["main"], autoMerge: "none", draft: true },
};
export const declarations = [DO, SYNC, HOTFIX];
export const typeList = { types: [{ type: "DO", owner: "kaal-change" }, { type: "SYNC", owner: "kaal-release" }, { type: "HOTFIX", owner: "kaal-change" }], invalid: ["DEFAULT"] };
export const writeAreas = { DO: ["packages/*/05-src/**", "packages/*/04-test/**"], SYNC: ["**"], HOTFIX: ["packages/**"] };
export const chapters = { Implement: "Adds the generator.", Change: "hosting generator", Refactor: "None planned." };
export const request = { repo: "o/r", type: "DO", chapters, head: "claude/work", base: "kaal/hosting/gen", title: "Render pull request templates" };
export const options = (extra = {}) => ({ token: "ghp_SECRET_TOKEN_VALUE", typeList, writeAreas, changedPaths: ["packages/kaal-hosting/05-src/a.ts"], ...extra });

/** A recording stand-in for the API. `script(req, n)` may return `{ status, json }` or throw to simulate a network error. */
export function standIn(script = () => undefined) {
  const requests = [];
  const respond = (req, n) => {
    const scripted = script(req, n);
    if (scripted) return scripted;
    if (req.method === "POST" && req.path.endsWith("/pulls")) return { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7" } };
    if (req.path.endsWith("/graphql")) return { status: 200, json: { data: { enablePullRequestAutoMerge: { pullRequest: { number: 7 } } } } };
    return { status: 404, json: { message: "unexpected" } };
  };
  const fetch = async (url, init = {}) => {
    const u = new URL(url);
    const req = { method: init.method ?? "GET", path: u.pathname, headers: Object.fromEntries(Object.entries(init.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v])), body: init.body ? JSON.parse(init.body) : undefined };
    requests.push(req);
    const { status, json } = respond(req, requests.length);
    return new Response(JSON.stringify(json), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch, requests, api: "https://stand-in.invalid" };
}

/** The same stand-in as a real local HTTP server, for the command line. */
export async function standInServer(script) {
  const inner = standIn(script);
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

export const names = (requests) => requests.map((r) => `${r.method} ${r.path}`);
