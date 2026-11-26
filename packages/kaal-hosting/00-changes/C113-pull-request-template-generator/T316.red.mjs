// hosting/T316 draft (hosting/C113): the command line, `kaal-hosting-pull-request`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { it } from "node:test";
import { chapters, posts, worldServer } from "./fixtures.mjs";

it("hosting/T316: the CLI raises from the chapters file and the token, takes no authority, merge or draft option, and refuses with a non-zero exit and the named rule", async () => {
  const cli = fileURLToPath(new URL("./pull-request-cli.mjs", import.meta.resolve("@kaihacksai/kaal-hosting")));
  const dir = mkdtempSync(join(tmpdir(), "hosting-c113-cli-"));
  const chaptersFile = join(dir, "ch.json");
  writeFileSync(chaptersFile, JSON.stringify(chapters));
  const base = ["--repo", "o/r", "--type", "DO", "--head", "claude/work", "--base", "kaal/hosting/gen", "--title", "Render templates", "--chapters", chaptersFile];
  const server = await worldServer();
  const run = (args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", env: { ...process.env, GITHUB_TOKEN: "ghp_SECRET_TOKEN_VALUE", KAAL_GITHUB_API: server.api } });
  try {
    const ok = run(base);
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /https:\/\/github\.com\/o\/r\/pull\/7/);
    assert.deepEqual(posts(server.requests), ["POST /repos/o/r/pulls", "POST /graphql"]);
    for (const opt of ["--auto-merge", "--merge-method", "--draft", "--merge", "--declarations", "--types", "--write-areas", "--changed", "--policy"]) {
      const before = server.requests.length;
      const r = run([...base, opt, "x"]);
      assert.notEqual(r.status, 0, opt);
      assert.equal(server.requests.length, before, `${opt}: nothing was sent`);
    }
    const before = server.requests.length;
    const bad = run(base.map((a) => (a === "claude/work" ? "main" : a)));
    assert.notEqual(bad.status, 0);
    assert.match(bad.stderr, /head/);
    assert.equal(posts(server.requests.slice(before)).length, 0);
    for (const r of [ok, bad]) assert.doesNotMatch(r.stdout + r.stderr, /ghp_SECRET/);
  } finally { server.close(); }
});
