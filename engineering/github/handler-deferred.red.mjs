// engineering/T162 to T167: Cases for the approval-event handler's judgment under deferred attestation (B1 F5, plan of
// 7 November 2026, approved by the CPO with the conditions named here). Run by hand; no suite or lane names this file:
//
//   node --test engineering/github/handler-deferred.red.mjs
//
// The third trial window found that `.github/workflows/change-isolation-review.yml` re-judged a ledger-bearing pull request
// in STRICT mode on every approval, wrote a failing `Change Isolation` run over the pull request job's deferred pass, and so
// stopped an unattested promotion before it could reach the merge queue and `Change Isolation (review)`. F5 adds the literal
// `KAAL_ATTESTATION: deferred` to the handler's judging step and nowhere else. An explicit attestation is still verified first.
//
// The executable Cases read the environment the handler's judging step really sets (the `env:` of that step in the workflow
// file under test), then run the real judging script (engineering/github/change-isolation.sh) with it, on a scratch repository
// that holds the real checker, with the handler's inputs: no line, a correct line, a wrong digest, a malformed entry, and paths
// an entry may never admit. KAAL_ROOT=<dir> points the Cases at another checkout (for the RED run on a tree without F5).
// They show the handler's judgment, not GitHub's behaviour; the live proof is Case 6. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT = process.env.KAAL_ROOT ? resolve(process.env.KAAL_ROOT) : SRC;
const WF = join(ROOT, ".github", "workflows");
const HANDLER = "change-isolation-review.yml";
const STEP = "Judge the complete change against the target";
const LEDGER = "engineering/change-isolation/transitions.json";
const strip = (t) => t.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
const text = (name) => strip(readFileSync(join(WF, name), "utf8"));
const names = readdirSync(WF).filter((f) => f.endsWith(".yml")).sort();
const step = (t, name) => {
  const start = t.indexOf(`      - name: ${name}\n`);
  assert.ok(start >= 0, `step "${name}" exists`);
  const rest = t.slice(start + 8);
  const next = rest.search(/\n      - /);
  return t.slice(start, start + 8 + (next < 0 ? rest.length : next));
};
const JUDGE = step(text(HANDLER), STEP);
/** The environment the handler's judging step sets as literals (expressions are the workflow's own facts). */
const literalEnv = () => {
  const block = JUDGE.slice(JUDGE.indexOf("env:\n"), JUDGE.indexOf("run:"));
  return Object.fromEntries([...block.matchAll(/^ {10}([A-Z_]+): ([^$\n{]+)$/gm)].map((m) => [m[1], m[2].trim()]));
};

const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
const git = (cwd, args) => {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", env });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};
const doc = (ts) => JSON.stringify({ version: 1, transitions: ts }, null, 2) + "\n";
const { entryDigest } = await import(pathToFileURL(join(ROOT, "engineering", "change-isolation", "check.mjs")).href);

/** A scratch origin whose main holds the real checker and an empty ledger; a head carrying `files` and, when asked, its entry. */
function scenario({ files, carry = true, tamper } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "handler-"));
  const origin = join(dir, "origin.git");
  const work = join(dir, "work");
  git(dir, ["init", "-q", "--bare", "-b", "main", origin]);
  git(origin, ["config", "uploadpack.allowAnySHA1InWant", "true"]);
  git(dir, ["clone", "-q", origin, work]);
  git(work, ["config", "user.email", "t@example.com"]); git(work, ["config", "user.name", "t"]);
  const put = (path, body) => { mkdirSync(dirname(join(work, path)), { recursive: true }); writeFileSync(join(work, path), body); };
  for (const p of ["engineering/change-isolation/check.mjs", "engineering/change-isolation/attestation.mjs", ["packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs", "packages/kaal-foundation/lib/sha256.mjs"].find((q) => existsSync(join(ROOT, q)))]) {
    mkdirSync(dirname(join(work, p)), { recursive: true }); cpSync(join(ROOT, p), join(work, p));
  }
  put(LEDGER, doc([])); put("packages/kaal-core/x.txt", "before\n");
  git(work, ["add", "-A"]); git(work, ["commit", "-q", "-m", "base"]); git(work, ["push", "-q", "origin", "HEAD:main"]);
  const base = git(work, ["rev-parse", "HEAD"]);
  const changed = files ?? { "packages/kaal-core/x.txt": "after\n", "engineering/y.txt": "new\n" };
  for (const [p, body] of Object.entries(changed)) put(p, body);
  git(work, ["add", "-A"]);
  const paths = Object.keys(changed).sort();
  const blob = (p) => { const r = spawnSync("git", ["rev-parse", "--verify", "-q", `${base}:${p}`], { cwd: work, encoding: "utf8", env }); return r.status === 0 ? r.stdout.trim() : null; };
  const entry = { id: "carry-1", paths, pre: Object.fromEntries(paths.map((p) => [p, blob(p)])), post: Object.fromEntries(paths.map((p) => [p, git(work, ["hash-object", p])])) };
  if (tamper) tamper(entry);
  if (carry) put(LEDGER, doc([entry]));
  git(work, ["add", "-A"]); git(work, ["commit", "-q", "-m", "head"]); git(work, ["push", "-q", "origin", "HEAD:refs/heads/candidate"]);
  const head = git(work, ["rev-parse", "HEAD"]);
  git(work, ["fetch", "-q", "origin", "main"]);
  return {
    entry,
    /** Run the judging script as the handler does: the step's literal env, and KAAL_ATTESTED exported from the derived line ("" for none). */
    judge(attested) {
      const r = spawnSync("bash", [join(ROOT, "engineering", "github", "change-isolation.sh")], {
        cwd: work, encoding: "utf8",
        env: { ...env, ...literalEnv(), GUARD_HEAD: head, GUARD_BASE: base, GUARD_BASE_REF: "main", KAAL_DEFAULT: "main", KAAL_ATTESTED: attested },
      });
      return { status: r.status, out: `${r.stdout}${r.stderr}` };
    },
    done() { rmSync(dir, { recursive: true, force: true }); },
  };
}
const withScenario = (opts, body) => { const s = scenario(opts); try { body(s); } finally { s.done(); } };

test("engineering/T162 B1 F5: the handler's judging step sets the deferred literal, once, in its own env, and nothing else in the handler does", () => {
  assert.match(JUDGE, /^ {10}KAAL_ATTESTATION: deferred$/m, "the step env holds the literal");
  assert.equal(JUDGE.match(/KAAL_ATTESTATION/g).length, 1, "set once in the step");
  assert.doesNotMatch(JUDGE, /KAAL_ATTESTATION:.*\$\{\{/, "no expression feeds it");
  assert.equal(text(HANDLER).match(/KAAL_ATTESTATION/g).length, 1, "set in no other step of the handler");
  assert.match(JUDGE, /export KAAL_ATTESTED="\$ATTESTED"/, "an explicit attestation is still exported from the derived line");
  assert.ok(JUDGE.indexOf("export KAAL_ATTESTED") < JUDGE.indexOf("--check Change-Isolation"), "and exported before the checker runs");
});

test("engineering/T163 B1 F5: no approval-event input yields a deferred pass without a structurally valid entry; a stated line is verified first", () => {
  withScenario({}, (s) => {
    const none = s.judge("");
    assert.equal(none.status, 0, `no line: deferred structural validation passes\n${none.out}`);
    assert.match(none.out, /attestation deferred: ledger-entry: carry-1 sha256:[0-9a-f]{64} \(the review check judges it\)/, "and prints the pending line");
    const good = s.judge(`${s.entry.id}:${entryDigest(s.entry)}`);
    assert.equal(good.status, 0, `a correct line passes\n${good.out}`);
    assert.doesNotMatch(good.out, /attestation deferred/, "a correct line is verified, not deferred");
  });
});

test("engineering/T164 B1 F5: an incorrect or stale attestation fails closed and is never converted into deferred admission", () => {
  withScenario({}, (s) => {
    const wrongDigest = s.judge(`${s.entry.id}:${"0".repeat(64)}`);
    assert.notEqual(wrongDigest.status, 0, `a wrong digest fails\n${wrongDigest.out}`);
    assert.doesNotMatch(wrongDigest.out, /attestation deferred/, "and is not deferred");
    const wrongId = s.judge(`other-1:${entryDigest(s.entry)}`);
    assert.notEqual(wrongId.status, 0, `a line for another entry id fails\n${wrongId.out}`);
    assert.doesNotMatch(wrongId.out, /attestation deferred/, "and is not deferred");
  });
});

test("engineering/T165 B1 F5: a malformed or over-claiming entry fails closed with no line", () => {
  withScenario({ tamper: (e) => { e.post[e.paths[0]] = "0".repeat(40); } }, (s) => {
    const r = s.judge("");
    assert.notEqual(r.status, 0, `a post blob that is not the candidate's is refused\n${r.out}`);
  });
  withScenario({ tamper: (e) => { e.paths.pop(); } }, (s) => {
    assert.notEqual(s.judge("").status, 0, "a path the entry does not list is refused");
  });
});

test("engineering/T166 B1 F5: .github, the checker and the ledger are never admitted through an entry, with or without a line", () => {
  for (const path of [".github/workflows/x.yml", "engineering/change-isolation/check.mjs"]) {
    withScenario({ files: { "packages/kaal-core/x.txt": "after\n", [path]: "changed\n" } }, (s) => {
      assert.notEqual(s.judge("").status, 0, `${path}: refused without a line`);
      assert.notEqual(s.judge(`${s.entry.id}:${entryDigest(s.entry)}`).status, 0, `${path}: refused even with a correct line`);
    });
  }
});

test("engineering/T167 B1 F5: the handler cannot override or weaken Change Isolation (review); only the judging workflows and the handler are deferred", () => {
  const holders = names.filter((n) => /KAAL_ATTESTATION/.test(text(n)));
  assert.deepEqual(holders, ["change-isolation-review.yml", "change-isolation.yml", "merge-group.yml"], "exactly the pull request job, the handler and the group's Change Isolation job name the flag");
  const h = text(HANDLER);
  assert.doesNotMatch(h, /Change Isolation \(review\)/, "the handler never names the review check");
  assert.doesNotMatch(h, /merge_group/, "and is never run for a merge group");
  assert.match(h, /name="Change Isolation"/, "it writes only the context `Change Isolation`");
  for (const n of ["merge-group-review.yml", "merge-group-admission.yml", "change-isolation-review-relay.yml"]) {
    assert.doesNotMatch(text(n), /deferred|KAAL_ATTESTATION/, `${n} stays strict`);
  }
  assert.equal(text("merge-group.yml").match(/KAAL_ATTESTATION/g).length, 1, "merge-group.yml: once, in the Change Isolation job only");
});
