// hosting/C113 delivered cases: raising a pull request from the rules its type's owners declare
// (hosting/F97; hosting/T310 to hosting/T317). They reach Hosting by its name and inject only the transport: a stand-in for GitHub's API.
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { it } from "node:test";
import { join } from "node:path";
import { mkdtempSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import * as hosting from "@kaihacksai/kaal-hosting";
import { BASE, CHANGED, DO, HEAD, HOTFIX, PATHS, SYNC, chapters, declarations, options, policy, posts, reads, request, world, worldServer } from "./pull-request-fixtures.mjs";

it("hosting/T310: raisePullRequest reads the revision and the owners' policy from the base, then opens the pull request, then enables the declared auto-merge", async () => {
  const w = world();
  const result = await hosting.raisePullRequest(request, options(w));
  assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);
  const firstPost = w.requests.findIndex((r) => r.method === "POST");
  assert.ok(w.requests.slice(0, firstPost).every((r) => r.method === "GET"), "every read precedes the first write");
  const read = reads(w.requests);
  for (const expected of ["/repos/o/r/commits/claude/work", "/repos/o/r/commits/kaal/hosting/gen", `/repos/o/r/compare/${BASE}...${HEAD}`,
    `/repos/o/r/contents/${PATHS.typeList}@${BASE}`, `/repos/o/r/contents/${PATHS.declaration("kaal-change")}@${BASE}`, `/repos/o/r/contents/${PATHS.writeAreas}@${BASE}`]) assert.ok(read.includes(expected), expected);
  const [open, merge] = w.requests.filter((r) => r.method === "POST");
  assert.deepEqual(open.body, { title: request.title, head: "claude/work", base: "kaal/hosting/gen", body: hosting.renderBody(DO, chapters), draft: false });
  assert.equal(open.headers.authorization, "Bearer ghp_SECRET_TOKEN_VALUE");
  assert.match(merge.body.query, /enablePullRequestAutoMerge/);
  assert.deepEqual(merge.body.variables, { pullRequestId: "PR_node7", mergeMethod: "SQUASH" });
  assert.deepEqual(result, { number: 7, url: "https://github.com/o/r/pull/7", steps: ["open", "auto-merge"] });
  assert.equal(SYNC.raise.autoMerge, "merge");
  assert.ok(CHANGED.length === 1 && policy()[PATHS.typeList]);
});

const withDeclaration = (declaration, other = {}) => world({ files: { [BASE]: policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [declaration, HOTFIX] }), ...other }), [HEAD]: policy() } });

it("hosting/T311: the declared method is what is enabled, none or absent enables nothing, and nothing merges, reviews or approves", async () => {
  for (const [method, enum_] of [["squash", "SQUASH"], ["merge", "MERGE"], ["rebase", "REBASE"]]) {
    const w = withDeclaration({ ...DO, raise: { ...DO.raise, autoMerge: method } });
    await hosting.raisePullRequest(request, options(w));
    assert.equal(w.requests.at(-1).body.variables.mergeMethod, enum_, method);
    for (const r of w.requests) {
      assert.doesNotMatch(r.path, /\/merge$|\/reviews?$|\/requested_reviewers$/);
      assert.notEqual(r.method, "PUT");
      assert.doesNotMatch(JSON.stringify(r.body ?? {}), /approvePullRequest|mergePullRequest|APPROVE/);
    }
  }
  for (const raise of [{ ...DO.raise, autoMerge: "none" }, { head: DO.raise.head, base: DO.raise.base }]) {
    const w = withDeclaration({ ...DO, raise });
    await hosting.raisePullRequest(request, options(w));
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls"], JSON.stringify(raise));
    assert.equal(w.requests.find((r) => r.method === "POST").body.draft, false);
  }
  const hotfix = world({ changed: ["packages/kaal-hosting/13-source/a.ts"], refs: { "hotfix/x": HEAD, main: BASE } });
  await hosting.raisePullRequest({ ...request, type: "HOTFIX", chapters: { Change: "d" }, head: "hotfix/x", base: "main", title: "Fix a defect" }, options(hotfix));
  assert.equal(hotfix.requests.find((r) => r.method === "POST").body.draft, true, "the declared draft flag");
});

it("hosting/T312: an unlisted type, DEFAULT, a head or base outside raise, a title rule and bad chapters are refused with the rule and the owner, and nothing is written", async () => {
  const cases = [
    ["an unlisted type", { ...request, type: "ACT" }, "type-list", "engineering"],
    ["DEFAULT", { ...request, type: "DEFAULT" }, "type-list", "engineering"],
    ["a head outside raise", { ...request, head: "main" }, "head", "kaal-change"],
    ["a base outside raise", { ...request, base: "main" }, "base", "kaal-change"],
    ["a Change id in the title", { ...request, title: "C113 renders templates" }, "title", "kaal-change"],
    ["a missing chapter", { ...request, chapters: { Change: "x" } }, "chapters", "kaal-change"],
  ];
  for (const [why, input, rule, owner] of cases) {
    const w = world();
    await assert.rejects(hosting.raisePullRequest(input, options(w)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule && e.owner === owner, why);
    assert.deepEqual(posts(w.requests), [], `${why}: nothing was written`);
  }
});

const run = async (changed, input = request, config = {}) => { const w = world({ changed, ...config }); const p = hosting.raisePullRequest(input, options(w)); return { p, w }; };
const refused = async (changed, rule, text, input, config) => {
  const { p, w } = await run(changed, input, config);
  await assert.rejects(p, (e) => e.code === "RAISE_REFUSED" && e.rule === rule && e.owner === "engineering" && (!text || text.test(e.message)));
  assert.deepEqual(posts(w.requests), [], "nothing was written");
};

it("hosting/T313: a path outside the type's phases or in no area is refused and named; legacy names read through; an empty diff is refused", async () => {
  await refused(["packages/kaal-hosting/13-source/a.ts", "packages/kaal-hosting/10-intent/intent.md"], "write-areas", /10-intent\/intent\.md/);
  await refused(["packages/kaal-hosting/99-unknown/a.md"], "write-areas", /99-unknown/);
  await refused([".github/workflows/x.yml"], "write-areas", /\.github/);
  await refused(["packages/kaal-hosting/13-source-extra/a.ts"], "write-areas", /13-source-extra/, request);
  await refused(["packages/kaal-hosting/01-changes/C1/x.md"], "write-areas", /01-changes/, request);
  await refused([], "write-areas", /no changed path/);
  for (const ok of [["packages/a/13-source/x/y/z.ts", "packages/b/13-source/t.mjs"], ["packages/a/05-src/legacy.ts"], ["packages/a/package.json"]]) {
    const { p, w } = await run(ok);
    await p;
    assert.deepEqual(posts(w.requests).slice(0, 1), ["POST /repos/o/r/pulls"], ok.join());
  }
  // A SYNC may carry no phase (engineering/C36: may []), so its diff cannot be judged by areas: it refuses, fail closed.
  await refused(["packages/a/13-source/x.ts"], "write-areas", undefined, { ...request, type: "SYNC", chapters: { Change: "x", Reason: "y" }, head: "sync/a", title: "Sync" }, { refs: { "sync/a": "1".repeat(40), "kaal/hosting/gen": "2".repeat(40) } });
});

const raise = (w) => hosting.raisePullRequest(request, options(w)).then(() => null, (e) => e);

it("hosting/T314: a refused first step ends there; a refused second step names the pull request that exists and undoes nothing; a moved head enables nothing", async () => {
  const first = world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 422, json: { message: "Validation Failed" } } : undefined) });
  const e1 = await raise(first);
  assert.equal(e1?.code, "STEP_FAILED");
  assert.deepEqual(e1.steps, []);
  assert.equal(e1.failed, "open");
  assert.deepEqual(posts(first.requests), ["POST /repos/o/r/pulls"], "no retry and no second step");

  for (const [why, script] of [
    ["an HTTP refusal", (r) => (r.path.endsWith("/graphql") ? { status: 403, json: { message: "forbidden" } } : undefined)],
    ["a GraphQL error in a 200", (r) => (r.path.endsWith("/graphql") ? { status: 200, json: { errors: [{ message: "Pull request is in clean status" }] } } : undefined)],
    ["a network error", (r) => { if (r.path.endsWith("/graphql")) throw new Error("socket hang up"); }],
  ]) {
    const w = world({ script });
    const e = await raise(w);
    assert.equal(e?.code, "STEP_FAILED", why);
    assert.deepEqual(e.steps, ["open"], why);
    assert.equal(e.failed, "auto-merge", why);
    assert.deepEqual({ number: e.number, url: e.url }, { number: 7, url: "https://github.com/o/r/pull/7" }, `${why}: the pull request that exists is named`);
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls", "POST /graphql"], `${why}: no retry, no merge, no close, no delete`);
    assert.doesNotMatch(e.message, /ghp_SECRET/);
  }

  const moved = world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7", head: { sha: "9".repeat(40) } } } : undefined) });
  const e3 = await raise(moved);
  assert.equal(e3?.code, "STEP_FAILED");
  assert.equal(e3.failed, "revision");
  assert.deepEqual(e3.steps, ["open"]);
  assert.equal(e3.number, 7);
  assert.deepEqual(posts(moved.requests), ["POST /repos/o/r/pulls"], "the head the pull request opened with is not the head that was checked: no auto-merge, no close");
  assert.notEqual("9".repeat(40), HEAD);
});

it("hosting/T315: a missing token is refused before any call, and the token is sent only in the Authorization header", async () => {
  const none = world();
  await assert.rejects(hosting.raisePullRequest(request, options(none, { token: "" })), (e) => e.code === "RAISE_REFUSED" && e.rule === "token");
  assert.equal(none.requests.length, 0);
  const w = world({ script: (r) => (r.path.endsWith("/graphql") ? { status: 403, json: { message: "no" } } : undefined) });
  const out = [];
  const log = console.log; const err = console.error;
  console.log = (...a) => out.push(a.join(" ")); console.error = (...a) => out.push(a.join(" "));
  let error;
  try { await hosting.raisePullRequest(request, options(w)); } catch (e) { error = e; } finally { console.log = log; console.error = err; }
  for (const r of w.requests) {
    assert.equal(r.headers.authorization, "Bearer ghp_SECRET_TOKEN_VALUE", `${r.method} ${r.path}`);
    assert.doesNotMatch(JSON.stringify(r.body ?? {}) + r.path + JSON.stringify(r.query), /ghp_SECRET/);
  }
  assert.doesNotMatch(JSON.stringify({ message: error.message, stack: error.stack, steps: error.steps, out }), /ghp_SECRET/);
});

it("hosting/T316: the CLI raises from the chapters file and the token, takes no authority, merge or draft option, and refuses with a non-zero exit and the named rule", async () => {
  const cli = fileURLToPath(new URL("./pull-request-cli.mjs", import.meta.resolve("@kaihacksai/kaal-hosting")));
  const dir = mkdtempSync(join(tmpdir(), "hosting-c113-cli-"));
  const chaptersFile = join(dir, "ch.json");
  writeFileSync(chaptersFile, JSON.stringify(chapters));
  const base = ["--repo", "o/r", "--type", "DO", "--head", "claude/work", "--base", "kaal/hosting/gen", "--title", "Render templates", "--chapters", chaptersFile];
  const server = await worldServer();
  // Asynchronous: a synchronous start would block this process while it is the one serving the stand-in.
  const run = (args) => new Promise((done) => {
    const child = spawn(process.execPath, [cli, ...args], { env: { ...process.env, GITHUB_TOKEN: "ghp_SECRET_TOKEN_VALUE", KAAL_GITHUB_API: server.api } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (c) => (stdout += c));
    child.stderr.on("data", (c) => (stderr += c));
    child.on("close", (status) => done({ status, stdout, stderr }));
  });
  try {
    const ok = await run(base);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /https:\/\/github\.com\/o\/r\/pull\/7/);
    assert.deepEqual(posts(server.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);
    for (const opt of ["--auto-merge", "--merge-method", "--draft", "--merge", "--declarations", "--types", "--write-areas", "--changed", "--policy"]) {
      const before = server.requests.length;
      const r = await run([...base, opt, "x"]);
      assert.notEqual(r.status, 0, opt);
      assert.equal(server.requests.length, before, `${opt}: nothing was sent`);
    }
    const before = server.requests.length;
    const bad = await run(base.map((a) => (a === "claude/work" ? "main" : a)));
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /head/);
    assert.equal(posts(server.requests.slice(before)).length, 0);
    for (const r of [ok, bad]) assert.doesNotMatch(r.stdout + r.stderr, /ghp_SECRET/);
  } finally { server.close(); }
});

const refusedAs = async (w, input, extra, rule) => {
  await assert.rejects(hosting.raisePullRequest(input, options(w, extra)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule, rule);
  assert.equal(w.requests.length, 0, `${rule}: refused before any call, not even a read`);
};

it("hosting/T317: caller-supplied authority is refused before any call; the head's own policy and diff are never read as authority; every unknown refuses", async () => {
  // 1. Authority offered by the caller is refused, not ignored: policy, paths, merge and draft choices.
  for (const [key, value] of [["declarations", declarations], ["typeList", { types: [{ type: "DO", owner: "kaal-change" }], invalid: [] }], ["writeAreas", { DO: ["**"] }], ["changedPaths", ["packages/a/13-source/x.ts"]], ["changed", []], ["policy", {}]]) {
    await refusedAs(world(), request, { [key]: value }, "caller-authority");
    await refusedAs(world(), { ...request, [key]: value }, {}, "caller-authority");
  }
  await refusedAs(world(), { ...request, autoMerge: "squash" }, {}, "caller-merge-choice");
  await refusedAs(world(), { ...request, mergeMethod: "merge" }, {}, "caller-merge-choice");
  await refusedAs(world(), { ...request, draft: true }, {}, "caller-draft-choice");

  // 2. A permissive policy on the head (the branch being raised) is never read: only the base revision is.
  const permissive = policy({
    [PATHS.writeAreas]: JSON.stringify({ areas: [{ path: "", phase: "DO" }], legacy: {}, pullRequests: [{ type: "DO", may: ["DO", "PLAN", "ACT"] }] }),
    [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [{ ...DO, raise: { head: ["*"], base: ["*"], autoMerge: "rebase" } }, HOTFIX] }),
  });
  const hostile = world({ files: { [BASE]: policy(), [HEAD]: permissive }, changed: ["packages/kaal-hosting/10-intent/intent.md"] });
  await assert.rejects(hosting.raisePullRequest(request, options(hostile)), (e) => e.code === "RAISE_REFUSED" && e.rule === "write-areas");
  assert.deepEqual(posts(hostile.requests), []);
  assert.ok(reads(hostile.requests).every((r) => !r.endsWith(`@${HEAD}`)), "no policy file was read at the head revision");
  const allowed = world({ files: { [BASE]: policy(), [HEAD]: permissive } });
  await hosting.raisePullRequest(request, options(allowed));
  assert.equal(allowed.requests.at(-1).body.variables.mergeMethod, "SQUASH", "the base's method, not the head's rebase");

  // 3. Every unknown refuses, and nothing is written.
  const missingFile = (path) => world({ files: { [BASE]: Object.fromEntries(Object.entries(policy()).filter(([p]) => p !== path)), [HEAD]: policy() } });
  const unknowns = [
    ["the type list is missing at the base", missingFile(PATHS.typeList), "type-list"],
    ["the write areas are missing at the base", missingFile(PATHS.writeAreas), "write-areas"],
    ["the owner's declaration is missing at the base", missingFile(PATHS.declaration("kaal-change")), "declaration"],
    ["a policy file is not JSON", world({ files: { [BASE]: policy({ [PATHS.writeAreas]: "{ nope" }), [HEAD]: policy() } }), "write-areas"],
    ["the declaration does not hold the type", world({ files: { [BASE]: policy({ [PATHS.declaration("kaal-change")]: JSON.stringify({ types: [HOTFIX] }) }), [HEAD]: policy() } }), "declaration"],
    ["the head does not resolve", world({ refs: { "kaal/hosting/gen": BASE } }), "revision"],
    ["the base does not resolve", world({ refs: { "claude/work": HEAD } }), "revision"],
    ["the compare fails", world({ script: (r) => (r.path.includes("/compare/") ? { status: 500, json: {} } : undefined) }), "revision"],
    ["the compare is cut off at 300 files", world({ changed: Array.from({ length: 300 }, (_, i) => `packages/a/13-source/f${i}.ts`) }), "revision"],
  ];
  for (const [why, w, rule] of unknowns) {
    await assert.rejects(hosting.raisePullRequest(request, options(w)), (e) => e.code === "RAISE_REFUSED" && e.rule === rule, why);
    assert.deepEqual(posts(w.requests), [], `${why}: nothing was written`);
  }
});

it("hosting/T327: a rename or a copy is judged by its source as well as its destination, and a source GitHub does not name is unknown", async () => {
  const dest = "packages/a/13-source/new.ts";
  const edit = (f) => hosting.raisePullRequest(request, options(world({ changed: [f] }))).then(() => null, (e) => e);
  // A rename out of a path the type may not write is refused and names the source.
  let e = await edit({ filename: dest, status: "renamed", previous_filename: "packages/a/10-intent/intent.md" });
  assert.equal(e?.rule, "write-areas");
  assert.match(e.message, /10-intent\/intent\.md/);
  e = await edit({ filename: dest, status: "copied", previous_filename: ".github/workflows/x.yml" });
  assert.equal(e?.rule, "write-areas");
  assert.match(e.message, /\.github/);
  // A rename whose source is missing (or not text) is unknown, whatever its destination.
  for (const f of [{ filename: dest, status: "renamed" }, { filename: dest, status: "copied", previous_filename: "" }, { filename: dest, status: "modified", previous_filename: 7 }]) {
    const w = world({ changed: [f] });
    e = await hosting.raisePullRequest(request, options(w)).then(() => null, (x) => x);
    assert.equal(e?.code, "RAISE_REFUSED", JSON.stringify(f));
    assert.equal(e.rule, "revision", JSON.stringify(f));
    assert.deepEqual(posts(w.requests), [], "nothing was written");
  }
  // A rename inside the allowed area, both paths judged, goes on.
  const ok = world({ changed: [{ filename: dest, status: "renamed", previous_filename: "packages/a/13-source/old.ts" }] });
  await hosting.raisePullRequest(request, options(ok));
  assert.deepEqual(posts(ok.requests).slice(0, 1), ["POST /repos/o/r/pulls"]);
});

it("hosting/T328: a pull request that opened against another base than the one whose policy was read gets no auto-merge", async () => {
  const opened = (base) => world({ script: (r) => (r.method === "POST" && r.path.endsWith("/pulls") ? { status: 201, json: { number: 7, html_url: "https://github.com/o/r/pull/7", node_id: "PR_node7", head: { sha: HEAD }, base } } : undefined) });
  for (const [why, base] of [["a moved base", { sha: "9".repeat(40) }], ["no base sha", {}], ["no base", undefined]]) {
    const w = opened(base);
    const e = await raise(w);
    assert.equal(e?.code, "STEP_FAILED", why);
    assert.equal(e.failed, "revision", why);
    assert.deepEqual(e.steps, ["open"], why);
    assert.equal(e.number, 7, why);
    assert.deepEqual(posts(w.requests), ["POST /repos/o/r/pulls"], `${why}: no auto-merge, no close`);
  }
  const same = opened({ sha: BASE });
  assert.equal(await raise(same), null);
  assert.deepEqual(posts(same.requests), ["POST /repos/o/r/pulls", "POST /graphql"], "the base that was read: the declared auto-merge follows");
});
