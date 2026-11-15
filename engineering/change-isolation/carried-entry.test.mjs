// The checker's command line with a ledger entry the candidate carries, on a real scratch repository.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { entryDigest } from "./check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECK = join(HERE, "check.mjs");
const LEDGER = "engineering/change-isolation/transitions.json";
const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
const git = (cwd, args, input) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", input, env });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const doc = (ts) => JSON.stringify({ version: 1, transitions: ts }, null, 2) + "\n";

function scenario() {
  const dir = mkdtempSync(join(tmpdir(), "carried-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.email", "t@example.com"]);
  git(dir, ["config", "user.name", "t"]);
  const put = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };
  put(LEDGER, doc([]));
  put("packages/kaal-core/x.txt", "before\n");
  git(dir, ["add", "-A"]); git(dir, ["commit", "-q", "-m", "base"]);
  const base = git(dir, ["rev-parse", "HEAD"]);
  const baseLedger = doc([]);
  put("packages/kaal-core/x.txt", "after\n"); put("engineering/y.txt", "new\n");
  const blob = (path, rev) => { const r = spawnSync("git", ["rev-parse", "--verify", "-q", `${rev}:${path}`], { cwd: dir, encoding: "utf8", env }); return r.status === 0 ? r.stdout.trim() : null; };
  git(dir, ["add", "-A"]);
  const post = (p) => git(dir, ["hash-object", p]);
  const paths = ["engineering/y.txt", "packages/kaal-core/x.txt"];
  const entry = { id: "carry-1", paths,
    pre: Object.fromEntries(paths.map((p) => [p, blob(p, base)])),
    post: Object.fromEntries(paths.map((p) => [p, post(p)])) };
  put(LEDGER, doc([entry]));
  git(dir, ["add", "-A"]); git(dir, ["commit", "-q", "-m", "head"]);
  const head = git(dir, ["rev-parse", "HEAD"]);
  const tmp = mkdtempSync(join(tmpdir(), "carried-tmp-"));
  writeFileSync(join(tmp, "base-ledger.json"), baseLedger);
  writeFileSync(join(tmp, "candidate-ledger.json"), doc([entry]));
  const changed = git(dir, ["diff", "--no-renames", "--name-only", "-z", `${base}...${head}`]);
  return { dir, tmp, base, head, entry, run(extra) {
    const diff = spawnSync("git", ["diff", "--no-renames", "--name-only", "-z", `${base}...${head}`], { cwd: dir, env });
    return spawnSync("node", [CHECK, "--ledger", join(tmp, "base-ledger.json"), "--git", base, head, ...extra],
      { cwd: dir, input: diff.stdout, encoding: "utf8", env }); },
    done() { rmSync(dir, { recursive: true, force: true }); rmSync(tmp, { recursive: true, force: true }); } };
}

test("a carried entry with its attestation is admitted; without it, or with another digest, it is refused", () => {
  const s = scenario();
  try {
    const good = ["--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${entryDigest(s.entry)}`];
    const r = s.run(good);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(s.run([]).status, 1);
    const wrong = s.run(["--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${"0".repeat(64)}`]);
    assert.equal(wrong.status, 1, wrong.stderr);
    assert.match(wrong.stderr, /attestation does not match/);
    const noLedger = s.run(["--attested", `carry-1:${entryDigest(s.entry)}`]);
    assert.equal(noLedger.status, 2);
  } finally { s.done(); }
});

test("run as a lone copy beside Foundation's SHA-256, as the wrapper scripts do", () => {
  const s = scenario();
  const lone = mkdtempSync(join(tmpdir(), "carried-lone-"));
  try {
    copyFileSync(CHECK, join(lone, "check.mjs"));
    copyFileSync(resolve(HERE, "../../", ["packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs", "packages/kaal-foundation/lib/sha256.mjs"].find((p) => existsSync(resolve(HERE, "../../", p)))), join(lone, "kaal-foundation-sha256.mjs"));
    const diff = spawnSync("git", ["diff", "--no-renames", "--name-only", "-z", `${s.base}...${s.head}`], { cwd: s.dir, env });
    const r = spawnSync("node", [join(lone, "check.mjs"), "--ledger", join(s.tmp, "base-ledger.json"), "--git", s.base, s.head,
      "--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${entryDigest(s.entry)}`],
      { cwd: s.dir, input: diff.stdout, encoding: "utf8", env });
    assert.equal(r.status, 0, r.stderr);
    rmSync(join(lone, "kaal-foundation-sha256.mjs"));
    const without = spawnSync("node", [join(lone, "check.mjs"), "--ledger", join(s.tmp, "base-ledger.json"), "--git", s.base, s.head,
      "--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${entryDigest(s.entry)}`],
      { cwd: s.dir, input: diff.stdout, encoding: "utf8", env });
    // Without Foundation's file the checker cannot judge a carried entry: exit 2, never 0 and never a silent skip.
    assert.equal(without.status, 2, without.stderr);
  } finally { s.done(); rmSync(lone, { recursive: true, force: true }); }
});

test("a __proto__ key is kept as an own property, never smuggled through the prototype", async () => {
  const { appendedEntry } = await import("./check.mjs");
  const base = JSON.stringify({ version: 1, transitions: [] });
  const smuggled = '{"__proto__":{"version":1,"transitions":[{"id":"x","paths":[],"pre":{},"post":{}}]},"a":1,"b":2}';
  const r = appendedEntry(base, smuggled);
  assert.ok(r.violation, "a document with a __proto__ key must not pass as a ledger");
  const dup = appendedEntry(base, '{"__proto__":1,"__proto__":2}');
  assert.ok(dup.violation && /duplicate/.test(dup.violation));
});
