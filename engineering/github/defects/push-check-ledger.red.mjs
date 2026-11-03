// engineering/T83: the pre-push check must judge a ledger-admitted change as CI does.
//
// Identities in this file, one per leaf test: engineering/T83 is the RED Case and the only Case D2 names
// in `tests`. engineering/T87 (the checker admits the fixture's change with the target's ledger),
// engineering/T88 (the checker refuses the same change without a ledger) and engineering/T89 (the checker
// and the pre-push check both refuse a change the ledger does not admit) are its controls, each with an
// identity of its own. T89 is the rejected side of the agreement with CI, and must keep passing after the
// correction, so a fix that admits everything does not turn D2 answered.
//
// Applicability: Linux and macOS, with git, node and a POSIX sh. Inapplicable on Windows, because
// push-check.sh is a POSIX shell script that the pre-push hook runs under sh. On Windows the file reports
// that and exits 3, the repository's "does not apply" status; it neither skips a leaf nor passes one.
//
// Proves engineering/D2 (see D2-push-check-ledger.md). The Case builds a scratch repository whose target
// branch holds a transition ledger entry for one exact multi-owner change, and a head that is exactly
// that change. It then runs `engineering/github/push-check.sh`, the pre-push hook's check, as the hook
// would. The same change is admitted in CI, where `engineering/github/change-isolation.sh` passes the
// target's ledger to the checker.
//
//   expected (the contract):  the pushed change is admitted, exit 0, as CI admits it;
//   observed today (RED):     Change Isolation refuses it ("Core travels alone"), exit 1.
//
// Controls (pass today): the checker admits the fixture's change with the ledger and refuses it without
// one, so the fixture is a real ledger-admitted change and the RED result is the hook, not the fixture.
// This file is a Case that is RED by design. No suite, lane or script names it, so required CI does not
// run it; run it by hand:
//
//   node --test engineering/github/defects/push-check-ledger.red.mjs
//
// It is answered when this file is GREEN, unchanged, in the Change that makes the hook pass the target's
// ledger. Do not edit it to pass, and do not close D2 before then. The identity, version and confirming
// Run of this Case are recorded in D2-push-check-ledger.md.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

if (process.platform === "win32") {
  console.log("engineering/T83: inapplicable on win32: push-check.sh is a POSIX sh script run by the pre-push hook");
  process.exit(3);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SCRIPT = join(ROOT, "engineering", "github", "push-check.sh");
const CHECKER = join(ROOT, "engineering", "change-isolation", "check.mjs");
const LINEAGE = join(ROOT, "engineering", "github", "lineage.ts");
const LEDGER = "engineering/change-isolation/transitions.json";
const ZERO = "0".repeat(40);

const git = (cwd, args, input) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", input, env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" } });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const blob = (cwd, text) => git(cwd, ["hash-object", "--stdin"], text);

/** A scratch repo: origin/main (the tooling), origin/kaal/x (the target, holding the ledger) and a head that is the admitted change. */
function fixture({ tamper = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "pushcheck-"));
  git(dir, ["init", "-q", "-b", "work"]);
  git(dir, ["config", "user.email", "t@example.com"]);
  git(dir, ["config", "user.name", "t"]);
  git(dir, ["remote", "add", "origin", "https://github.com/o/r.git"]);
  const put = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); git(dir, ["add", path]); };
  const commit = (message) => { git(dir, ["commit", "-q", "-m", message]); return git(dir, ["rev-parse", "HEAD"]); };

  // main: the tooling as main holds it.
  mkdirSync(join(dir, "engineering", "github"), { recursive: true });
  mkdirSync(join(dir, "engineering", "change-isolation"), { recursive: true });
  copyFileSync(LINEAGE, join(dir, "engineering", "github", "lineage.ts"));
  copyFileSync(CHECKER, join(dir, "engineering", "change-isolation", "check.mjs"));
  git(dir, ["add", "-A"]);
  const main = commit("main");
  git(dir, ["update-ref", "refs/remotes/origin/main", main]);
  git(dir, ["symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/main"]);

  // target: main plus the two files the transition will change, and a ledger entry for that exact change.
  const paths = ["other/y.txt", "packages/kaal-core/x.txt"];
  const before = { "other/y.txt": "y1\n", "packages/kaal-core/x.txt": "x1\n" };
  const after = { "other/y.txt": "y2\n", "packages/kaal-core/x.txt": "x2\n" };
  for (const p of paths) put(p, before[p]);
  const entry = {
    id: "scratch-transition",
    paths,
    pre: Object.fromEntries(paths.map((p) => [p, blob(dir, before[p])])),
    post: Object.fromEntries(paths.map((p) => [p, blob(dir, after[p])])),
  };
  put(LEDGER, JSON.stringify({ version: 1, transitions: [entry] }, null, 2) + "\n");
  const target = commit("target with ledger");
  git(dir, ["update-ref", "refs/remotes/origin/kaal/x", target]);

  // head: exactly the admitted change.
  // tamper: one path differs from the ledger's post blob, so the ledger does not admit the change.
  for (const p of paths) put(p, tamper && p === "other/y.txt" ? "y3\n" : after[p]);
  const head = commit(tamper ? "a change the ledger does not admit" : "the admitted change");
  return { dir, target, head, paths, ledger: join(dir, LEDGER) };
}

const withFixture = (body, options) => {
  const f = fixture(options);
  try { return body(f); } finally { rmSync(f.dir, { recursive: true, force: true }); }
};

/** The checker on the fixture's change, with the target's ledger or without. */
function checker({ dir, target, head, paths, ledger }, withLedger) {
  const args = withLedger ? ["--ledger", ledger, "--git", target, head] : [];
  const r = spawnSync("node", [join(dir, "engineering", "change-isolation", "check.mjs"), ...args], { cwd: dir, input: paths.join("\0") + "\0", encoding: "utf8" });
  return { status: r.status, output: `${r.stdout}${r.stderr}`.trim() };
}

/** The pre-push hook's check, with the facts the hook supplies. */
function pushCheck({ dir, target, head }) {
  const env = { ...process.env, GUARD_HEAD: head, GUARD_BASE: target, GUARD_BASE_REF: "origin/kaal/x", KAAL_PUSH_REMOTE: "origin", KAAL_PUSH_REF: "refs/heads/work", KAAL_PUSH_REMOTE_HEAD: ZERO };
  const r = spawnSync("sh", [SCRIPT], { cwd: dir, env, encoding: "utf8" });
  return { status: r.status, output: `${r.stdout}${r.stderr}`.trim() };
}

test("engineering/T87 control: the checker admits the fixture's change with the target's ledger", () => {
  withFixture((f) => {
    const r = checker(f, true);
    assert.equal(r.status, 0, r.output);
  });
});

test("engineering/T88 control: the checker refuses the same change without a ledger", () => {
  withFixture((f) => {
    const r = checker(f, false);
    assert.equal(r.status, 1, r.output);
    assert.match(r.output, /Core/);
  });
});

test("engineering/T89 control: a change the ledger does not admit is refused by the checker and by the pre-push check", () => {
  withFixture((f) => {
    const c = checker(f, true);
    assert.equal(c.status, 1, `the checker, with the ledger: ${c.output}`);
    const r = pushCheck(f);
    assert.equal(r.status, 1, `the pre-push check: ${r.output}`);
    assert.match(r.output, /Core/);
  }, { tamper: true });
});

test("engineering/T83 RED (engineering/D2): the pre-push check admits a change the target's ledger admits", () => {
  withFixture((f) => {
    const r = pushCheck(f);
    assert.equal(r.status, 0, `the pre-push check refused a ledger-admitted change:\n${r.output}`);
  });
});
