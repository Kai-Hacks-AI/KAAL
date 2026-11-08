// The checker's deferred-attestation mode (B1: the pull request job judges everything except the attestation, which the
// separate review check judges). Cases B1-10 and the "never over-admits" family, on a real scratch repository.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { entryDigest } from "./check.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHECK = join(HERE, "check.mjs");
const LEDGER = "engineering/change-isolation/transitions.json";
const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
const git = (cwd, args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const doc = (ts) => JSON.stringify({ version: 1, transitions: ts }, null, 2) + "\n";

/** A target with the ledger, then a head touching the given files; `entry` builds the carried entry from the real blobs. */
function scenario({ files, carry = true, tamper } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "deferred-"));
  const tmp = mkdtempSync(join(tmpdir(), "deferred-tmp-"));
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["config", "user.email", "t@example.com"]);
  git(dir, ["config", "user.name", "t"]);
  const put = (path, text) => { mkdirSync(dirname(join(dir, path)), { recursive: true }); writeFileSync(join(dir, path), text); };
  put(LEDGER, doc([]));
  put("packages/kaal-core/x.txt", "before\n");
  git(dir, ["add", "-A"]); git(dir, ["commit", "-q", "-m", "base"]);
  const base = git(dir, ["rev-parse", "HEAD"]);
  writeFileSync(join(tmp, "base-ledger.json"), doc([]));
  const changed = files ?? { "packages/kaal-core/x.txt": "after\n", "engineering/y.txt": "new\n" };
  for (const [p, t] of Object.entries(changed)) put(p, t);
  git(dir, ["add", "-A"]);
  const paths = Object.keys(changed).sort();
  const blob = (p, rev) => { const r = spawnSync("git", ["rev-parse", "--verify", "-q", `${rev}:${p}`], { cwd: dir, encoding: "utf8", env }); return r.status === 0 ? r.stdout.trim() : null; };
  const entry = { id: "carry-1", paths, pre: Object.fromEntries(paths.map((p) => [p, blob(p, base)])), post: Object.fromEntries(paths.map((p) => [p, git(dir, ["hash-object", p])])) };
  if (tamper) tamper(entry);
  if (carry) put(LEDGER, doc([entry]));
  git(dir, ["add", "-A"]); git(dir, ["commit", "-q", "-m", "head"]);
  const head = git(dir, ["rev-parse", "HEAD"]);
  writeFileSync(join(tmp, "candidate-ledger.json"), carry ? doc([entry]) : doc([]));
  return { dir, tmp, entry, run(extra) {
    const diff = spawnSync("git", ["diff", "--no-renames", "--name-only", "-z", `${base}...${head}`], { cwd: dir, env });
    return spawnSync("node", [CHECK, "--ledger", join(tmp, "base-ledger.json"), "--git", base, head, ...extra], { cwd: dir, input: diff.stdout, encoding: "utf8", env }); },
    deferred() { return this.run(["--candidate-ledger", join(tmp, "candidate-ledger.json"), "--attestation", "deferred"]); },
    done() { rmSync(dir, { recursive: true, force: true }); rmSync(tmp, { recursive: true, force: true }); } };
}

test("engineering/T117 B1-10: deferred admits a well-formed carried entry without an attestation, and prints the pending line", () => {
  const s = scenario();
  try {
    assert.notEqual(s.run([]).status, 0, "control: without the entry the Core path set is refused");
    const r = s.deferred();
    assert.equal(r.status, 0, r.stderr);
    assert.ok(r.stdout.includes(`ledger-entry: carry-1 sha256:${entryDigest(s.entry)}`), r.stdout);
    const strict = s.run(["--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${"0".repeat(64)}`]);
    assert.notEqual(strict.status, 0, "control: a wrong attestation is still refused");
  } finally { s.done(); }
});

test("engineering/T118 B1-10: deferred never over-admits; a bad entry, a wrong blob or a path the entry omits is refused", () => {
  const wrongBlob = scenario({ tamper: (e) => { e.post["engineering/y.txt"] = "0".repeat(40); } });
  const omitted = scenario({ tamper: (e) => { e.paths = e.paths.slice(1); delete e.pre["engineering/y.txt"]; delete e.post["engineering/y.txt"]; } });
  try {
    assert.notEqual(wrongBlob.deferred().status, 0, "a post blob that is not the candidate's is refused");
    assert.notEqual(omitted.deferred().status, 0, "a path the entry does not list is refused");
  } finally { wrongBlob.done(); omitted.done(); }
});

test("engineering/T119 B1-10: deferred without a carried entry judges by the default rules", () => {
  const s = scenario({ carry: false });
  try {
    const r = s.deferred();
    assert.notEqual(r.status, 0, "a Core path set with no entry is refused even when attestation is deferred");
  } finally { s.done(); }
});

test("engineering/T120 B1-10: deferred never admits .github, the ledger or the checker through an entry", () => {
  for (const path of [".github/workflows/x.yml", "engineering/change-isolation/check.mjs"]) {
    const s = scenario({ files: { [path]: "x\n", "packages/kaal-core/x.txt": "after\n" } });
    try { assert.notEqual(s.deferred().status, 0, `${path} is refused`); } finally { s.done(); }
  }
});

test("engineering/T121 B1-10: the deferred flag and an explicit attestation are exclusive, and deferred needs the candidate ledger", () => {
  const s = scenario();
  try {
    const both = s.run(["--candidate-ledger", join(s.tmp, "candidate-ledger.json"), "--attested", `carry-1:${entryDigest(s.entry)}`, "--attestation", "deferred"]);
    assert.equal(both.status, 2, "both together is a usage error");
    assert.equal(s.run(["--attestation", "deferred"]).status, 2, "deferred without the candidate ledger is a usage error");
  } finally { s.done(); }
});

test("engineering/T122 B1-10: a pull request that predates a ledger addition on the target is judged by the default rules, not as a carried entry", () => {
  const s = scenario({ files: { "engineering/z.txt": "1\n" }, carry: false });
  try {
    // The target's ledger has since gained an entry the pull request never saw; the change itself does not touch the ledger.
    const later = { id: "later-1", paths: ["a/x"], pre: { "a/x": null }, post: { "a/x": "2".repeat(40) } };
    writeFileSync(join(s.tmp, "base-ledger.json"), doc([later]));
    const r = s.deferred();
    assert.equal(r.status, 0, `an ordinary change passes as it does under the default rules: ${r.stderr}`);
    assert.doesNotMatch(r.stdout, /attestation deferred/, "nothing is carried, so no pending line");
  } finally { s.done(); }
});
