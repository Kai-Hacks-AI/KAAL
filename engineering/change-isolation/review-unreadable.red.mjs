// engineering/T111: when the merge group's review job cannot read what it must judge, it ends red and passes nothing on its
// behalf (B1 plan, Case B1-5, script half). Run by hand; no suite or lane names this file:
//
//   node --test engineering/change-isolation/review-unreadable.red.mjs
//
// The job's three reads of GitHub (the branch's rules, the queued pull request, the reviews) are each run against a GitHub
// that fails every read: a stub `gh` on PATH for the two shell steps, a failing `fetch` for the attestation adapter. Each must
// end with exit status 2 (cannot judge) and with no attestation printed. The workflow itself must hold no condition,
// continue-on-error or unconditional success that could turn such an exit into a pass. The live half of B1-5 is the
// queue: a failed or missing job blocks the entry. The Cases always read the checkout they sit in; to try another tree, copy this
// file into it. No path derived from this file's location or from the environment is ever part of a shell command: the two shell
// scripts are copied into a scratch directory and run there by a constant name. Do not edit a Case to make it pass.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW = readFileSync(join(ROOT, ".github", "workflows", "merge-group-review.yml"), "utf8");
const SHA = "a".repeat(40);

// The `run: |` script of one named step, dedented as the runner would see it.
const script = (name) => {
  const at = WORKFLOW.indexOf(`      - name: ${name}\n`);
  assert.ok(at >= 0, `step "${name}" exists`);
  const rest = WORKFLOW.slice(at + 8);
  const end = rest.search(/\n      - /);
  const step = rest.slice(0, end < 0 ? rest.length : end);
  const lines = step.split("\n");
  const from = lines.findIndex((l) => /^ {8}run: \|\s*$/.test(l));
  assert.ok(from >= 0, `step "${name}" has a multi-line run`);
  return lines.slice(from + 1).map((l) => l.replace(/^ {10}/, "")).join("\n");
};

const scratch = () => {
  const dir = mkdtempSync(join(tmpdir(), "t111-"));
  const bin = join(dir, "bin");
  mkdirSync(bin);
  writeFileSync(join(bin, "gh"), "#!/usr/bin/env bash\necho \"gh: HTTP 503 (stub: every read fails)\" >&2\nexit 1\n");
  chmodSync(join(bin, "gh"), 0o755);
  return { dir, bin };
};
const childEnv = (bin, env) => ({ PATH: `${bin}:${process.env.PATH}`, HOME: process.env.HOME, ...env });

test("engineering/T111 B1-5: with every read failing, the wait step ends in exit 2 and names why", () => {
  const { dir, bin } = scratch();
  writeFileSync(join(dir, "wait.sh"), script("Wait for the group's other required checks"));
  const r = spawnSync("bash", ["-e", "./wait.sh"], { cwd: dir, encoding: "utf8",
    env: childEnv(bin, { GH_TOKEN: "x", GITHUB_REPOSITORY: "o/r", BASE_REF: "main", GROUP_HEAD: SHA }) });
  assert.equal(r.status, 2, `exit 2 (cannot judge), not ${r.status}: ${r.stderr}`);
  assert.match(r.stdout + r.stderr, /::error title=Change Isolation \(review\): cannot judge::the branch's required checks cannot be read/);
});

test("engineering/T111 B1-5: with every read failing, binding the group to its pull request ends in exit 2", () => {
  const { dir, bin } = scratch();
  copyFileSync(join(ROOT, ".github", "scripts", "bind-group.sh"), join(dir, "bind-group.sh"));
  const r = spawnSync("bash", ["./bind-group.sh", "review"], { cwd: dir, encoding: "utf8",
    env: childEnv(bin, { GH_TOKEN: "x", GITHUB_REPOSITORY: "o/r", GITHUB_ENV: "env",
      GROUP_REF: `refs/heads/gh-readonly-queue/main/pr-1162-${SHA}`, GROUP_HEAD: SHA, GROUP_BASE_SHA: "b".repeat(40), GROUP_BASE_REF: "refs/heads/main" }) });
  assert.equal(r.status, 2, `exit 2 (cannot judge), not ${r.status}: ${r.stderr}`);
  assert.match(r.stdout + r.stderr, /Change Isolation \(review\): cannot judge::pull request 1162 cannot be read/);
});

test("engineering/T111 B1-5: with the reviews unreadable, the attestation adapter ends in exit 2 and prints no attestation", () => {
  const { dir, bin } = scratch();
  writeFileSync(join(dir, "fetch-fails.mjs"), "globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => ({}) });\n");
  const r = spawnSync(process.execPath, ["engineering/change-isolation/attest.mjs", "--pr", "1162"], { cwd: ROOT, encoding: "utf8",
    env: childEnv(bin, { GH_TOKEN: "x", GITHUB_REPOSITORY: "o/r", NODE_OPTIONS: `--import ${join(dir, "fetch-fails.mjs")}` }) });
  assert.equal(r.status, 2, `exit 2 (cannot judge), not ${r.status}: ${r.stderr}`);
  assert.doesNotMatch(r.stdout, /attested=/, "no attestation is printed");
  assert.match(r.stderr, /cannot judge: GitHub API \/repos\/o\/r\/pulls\/1162: 503/);
});

test("engineering/T111 B1-5: nothing in the review job can turn a failed read into a pass", () => {
  const code = WORKFLOW.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
  assert.doesNotMatch(code, /\n\s+if:|continue-on-error|always\(\)|failure\(\)|\|\|\s*true/, "no condition or tolerated failure");
  const successes = code.match(/exit 0/g) ?? [];
  assert.equal(successes.length, 1, "exactly one exit 0 in the whole job");
  assert.match(script("Wait for the group's other required checks"), /\[ "\$pending" = 0 \] && exit 0/, "and it is the wait step's, taken only when every other required check has succeeded");
  assert.doesNotMatch(WORKFLOW, /checks:\s*write/, "no write that could leave a success standing");
  assert.match(script("Read the approvals again and require the same answer"), /attest\.mjs --pr "\$PR_NUMBER" > \/dev\/null \|\| exit 2/, "the final read exits 2 when it cannot read");
  assert.match(WORKFLOW, /ATTESTED: \$\{\{ steps\.first\.outputs\.attested \}\}/, "the judging step takes its attestation only from the first read, which must have succeeded");
});
