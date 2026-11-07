// engineering/T143 to T152: executable Cases for the step that binds a merge group to the queued pull request (B1 F3,
// plan of 7 November 2026, approved by the CPO with the refinements named here). Run by hand; no suite or lane names this file:
//
//   node --test engineering/github/bind-group.red.mjs
//
// A GitHub squash queue builds ONE commit on the base whose tree is the pull request applied to that base; a merge queue
// builds a merge commit. The first live trial failed closed because the binding assumed the second shape only.
//
// Each Case takes the REAL binding step out of the workflow it covers (merge-group.yml `branching`, merge-group-review.yml
// `change-isolation-review`), runs its `run:` text in a throwaway clone of a throwaway origin with a stubbed `gh`, and
// reads the exit status (0 binds, 2 cannot judge) and the environment the step exports. So the RED to GREEN evidence covers
// both workflows, not a standalone helper. KAAL_ROOT=<dir> points the Cases at another checkout (for the RED run on main).
// These Cases show the binding logic; they are not proof of GitHub's queue behaviour, which is the live trial.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ROOT = process.env.KAAL_ROOT ? resolve(process.env.KAAL_ROOT) : SRC;
const STEP = "Find the queued pull request and bind it to the group";
const JOBS = [
  { name: "Branching", file: "merge-group.yml", job: "branching", exports: ["PR_HEAD", "KAAL_HEAD_REF", "KAAL_AUTO_MERGE"] },
  { name: "Change Isolation (review)", file: "merge-group-review.yml", job: "change-isolation-review", exports: ["PR_NUMBER", "PR_HEAD", "BASE_REF"] },
];

const strip = (t) => t.split("\n").filter((l) => !/^\s*#/.test(l)).join("\n");
const jobText = (text, id) => {
  const header = `\n  ${id}:\n`;
  const start = text.indexOf(header);
  assert.ok(start >= 0, `job ${id} exists`);
  const rest = text.slice(start + header.length);
  const next = rest.search(/\n  [a-z][a-z-]*:\n/);
  return next < 0 ? rest : rest.slice(0, next);
};
// The binding step of a job: its run text and its env mapping, exactly as the workflow has them.
function stepOf({ file, job }) {
  const body = jobText(strip(readFileSync(join(ROOT, ".github", "workflows", file), "utf8")), job);
  const at = body.indexOf(`- name: ${STEP}\n`);
  assert.ok(at >= 0, `${file}: the binding step exists`);
  const rest = body.slice(at + 2);
  const end = rest.search(/\n      (- |#)|\n\n/);
  const step = end < 0 ? rest : rest.slice(0, end);
  const env = Object.fromEntries([...step.matchAll(/^ {10}([A-Z_]+): (.*)$/gm)].map((m) => [m[1], m[2]]));
  const block = step.match(/\n {8}run: \|\n((?: {10,}[^\n]*\n?)+)/);
  const run = block ? block[1].replace(/^ {10}/gm, "") : step.match(/\n {8}run: ([^\n]+)/)[1];
  return { run, env };
}

const sh = (cwd, cmd, env = {}) => {
  const r = spawnSync("bash", ["-c", cmd], { cwd, env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t", ...env }, encoding: "utf8" });
  assert.equal(r.status, 0, `${cmd}\n${r.stdout}${r.stderr}`);
  return r.stdout.trim();
};

// A throwaway origin with main at B, a pull request branch from B (one commit P changing b.txt), and helpers to build groups.
function world({ advanceBase = false, conflict = false } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "bind-"));
  const origin = join(dir, "origin.git");
  const work = join(dir, "work");
  sh(dir, `git init -q --bare -b main origin.git && git clone -q origin.git work`);
  sh(work, `git checkout -q -b main && printf 'one\\ntwo\\nthree\\n' > a.txt && git add . && git commit -qm base && git push -q origin main`);
  const B = sh(work, "git rev-parse HEAD");
  sh(work, `git checkout -q -b pr && ${conflict ? "printf 'one\\nPR\\nthree\\n' > a.txt" : "printf 'b\\n' > b.txt"} && git add . && git commit -qm pr`);
  const P = sh(work, "git rev-parse HEAD");
  sh(work, "git push -q origin pr");
  let base = B;
  if (advanceBase) {
    sh(work, `git checkout -q main && ${conflict ? "printf 'one\\nBASE\\nthree\\n' > a.txt" : "printf 'c\\n' > c.txt"} && git add . && git commit -qm advance && git push -q origin main`);
    base = sh(work, "git rev-parse HEAD");
  }
  // The checkout of the default branch the workflow step runs in: a fresh clone at main (the shallow case is covered below).
  const run = join(dir, "run");
  sh(dir, `git clone -q origin.git run`);
  // The script is part of the checkout of the default branch; the Cases copy the one under test.
  if (existsSync(join(ROOT, ".github", "scripts"))) cpSync(join(ROOT, ".github", "scripts"), join(run, ".github", "scripts"), { recursive: true });
  return { dir, work, run, B, P, base };
}

// Builds a group commit in `work` and publishes it. spec: parents (commit ids), tree from a commit id or a ready tree id.
function group(w, { parents, tree }) {
  const t = tree.startsWith("tree:") ? tree.slice(5) : sh(w.work, `git rev-parse ${tree}^{tree}`);
  const args = parents.map((p) => `-p ${p}`).join(" ");
  const g = sh(w.work, `git commit-tree ${t} ${args} -m group`);
  sh(w.work, `git push -q origin ${g}:refs/heads/gh-readonly-queue/main/pr-7-${g}`);
  return g;
}

function stubGh(w, head, autoMerge = "squash") {
  const bin = join(w.dir, "bin");
  mkdirSync(bin, { recursive: true });
  const pull = { number: 7, base: { ref: "main" }, head: { sha: head, ref: "claude/pr" }, auto_merge: autoMerge ? { merge_method: autoMerge } : null };
  writeFileSync(join(w.dir, "pull.json"), JSON.stringify(pull));
  writeFileSync(join(bin, "gh"), `#!/usr/bin/env bash\n[ "$1" = api ] && [[ "$2" == repos/*/pulls/7 ]] && cat "${join(w.dir, "pull.json")}" && exit 0\necho "unexpected gh $*" >&2; exit 9\n`);
  chmodSync(join(bin, "gh"), 0o755);
  return bin;
}

// Runs the job's real binding step. Returns { status, out, env } where env is what the step exported to GITHUB_ENV.
// baseSha: a commit id, a malformed string, or null for "the event carries none".
function bind(w, j, { g, head = w.P, baseSha = w.base, groupHead = g } = {}) {
  const { run, env } = stepOf(j);
  const bin = stubGh(w, head);
  const gh = join(w.dir, "github_env");
  writeFileSync(gh, "");
  const e = {
    PATH: `${bin}:${process.env.PATH}`,
    GH_TOKEN: "x",
    GITHUB_REPOSITORY: "o/r",
    GITHUB_ENV: gh,
    GROUP_REF: `refs/heads/gh-readonly-queue/main/pr-7-${groupHead}`,
    GROUP_HEAD: groupHead,
    GROUP_BASE_REF: "refs/heads/main",
  };
  if (baseSha !== null) e.GROUP_BASE_SHA = baseSha;
  const r = spawnSync("bash", ["-e", "-c", run], { cwd: w.run, env: { ...process.env, ...e }, encoding: "utf8" });
  const exported = Object.fromEntries(readFileSync(gh, "utf8").split("\n").filter(Boolean).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]));
  return { status: r.status, out: `${r.stdout}${r.stderr}`, env: exported, mapped: env };
}

const forEach = (name, fn) => {
  for (const j of JOBS) test(`${name} [${j.name}]`, () => fn(j));
};
const fails = (r, why) => {
  assert.equal(r.status, 2, `${why}: cannot judge (exit 2), got ${r.status}\n${r.out}`);
  assert.deepEqual(r.env, {}, "nothing is exported when the group cannot be bound");
};

forEach("engineering/T143 F3: a squash group of the queued pull request on its base binds, and exports what the job needs", (j) => {
  const w = world();
  const g = group(w, { parents: [w.B], tree: w.P });
  const r = bind(w, j, { g });
  assert.equal(r.status, 0, r.out);
  for (const k of j.exports) assert.ok(k in r.env, `${k} is exported`);
  assert.equal(r.env.PR_HEAD, w.P);
});

forEach("engineering/T144 F3: a squash group whose pull request head has moved since the group was built does not bind", (j) => {
  const w = world();
  const g = group(w, { parents: [w.B], tree: w.P });
  sh(w.work, "git checkout -q pr && printf 'x\\n' > x.txt && git add . && git commit -qm moved && git push -q origin pr");
  fails(bind(w, j, { g, head: sh(w.work, "git rev-parse HEAD") }), "moved head");
});

forEach("engineering/T145 F3: a squash group carrying content beyond the pull request does not bind", (j) => {
  const w = world();
  const extra = sh(w.work, `git checkout -q pr && printf 'z\\n' > z.txt && git add . && git commit -qm extra && git rev-parse HEAD && git reset -q --hard ${w.P}`).split("\n").pop();
  const g = group(w, { parents: [w.B], tree: extra });
  fails(bind(w, j, { g }), "extra content");
});

forEach("engineering/T146 F3: a merge-commit group (two parents) containing the head on the base binds", (j) => {
  const w = world();
  const g = group(w, { parents: [w.B, w.P], tree: w.P });
  const r = bind(w, j, { g });
  assert.equal(r.status, 0, r.out);
  assert.equal(r.env.PR_HEAD, w.P);
});

forEach("engineering/T147 F3: a group whose parent is not the group's base does not bind, in either shape", (j) => {
  const w = world({ advanceBase: true });
  const squash = group(w, { parents: [w.B], tree: w.P });
  fails(bind(w, j, { g: squash }), "squash group on a stale parent");
  const merged = group(w, { parents: [w.B, w.P], tree: w.P });
  fails(bind(w, j, { g: merged }), "merge group on a stale first parent");
  // The right content on the wrong parent: only the parent test can refuse it.
  const right = sh(w.work, `git merge-tree --write-tree ${w.base} ${w.P}`);
  fails(bind(w, j, { g: group(w, { parents: [w.B], tree: `tree:${right}` }) }), "squash group with the right tree on a stale parent");
});

forEach("engineering/T148 F3: a missing or malformed group base does not bind", (j) => {
  const w = world();
  const g = group(w, { parents: [w.B], tree: w.P });
  fails(bind(w, j, { g, baseSha: null }), "missing base");
  fails(bind(w, j, { g, baseSha: "main" }), "malformed base");
});

forEach("engineering/T149 F3: a squash group on an advanced base binds when the pull request applies cleanly (the expected tree is the merge, not the head's own tree)", (j) => {
  const w = world({ advanceBase: true });
  const expected = sh(w.work, `git merge-tree --write-tree ${w.base} ${w.P}`);
  assert.notEqual(expected, sh(w.work, `git rev-parse ${w.P}^{tree}`), "the merged tree differs from the head's tree");
  const g = group(w, { parents: [w.base], tree: `tree:${expected}` });
  const r = bind(w, j, { g });
  assert.equal(r.status, 0, r.out);
  // The head's own tree on that advanced base is NOT the expected result: it would silently drop the base's advance.
  const wrong = group(w, { parents: [w.base], tree: w.P });
  fails(bind(w, j, { g: wrong }), "head tree on an advanced base");
});

forEach("engineering/T150 F3: a pull request that conflicts with the advanced base cannot be judged, which is told apart from a different tree", (j) => {
  const w = world({ advanceBase: true, conflict: true });
  const g = group(w, { parents: [w.base], tree: w.base });
  const r = bind(w, j, { g });
  fails(r, "conflict");
  assert.match(r.out, /does not merge cleanly or cannot be computed/, "the conflict is reported as such");
  const clean = world();
  const differ = bind(clean, j, { g: group(clean, { parents: [clean.B], tree: clean.B }) });
  fails(differ, "different tree");
  assert.match(differ.out, /is not pull request 7 at its head/, "a different tree is reported as such");
});

forEach("engineering/T153 F3: a merge-commit group whose second parent is not the queued pull request head does not bind", (j) => {
  const w = world();
  const other = sh(w.work, `git commit-tree ${w.B}^{tree} -p ${w.B} -m other`);
  sh(w.work, `git push -q origin ${other}:refs/heads/other`);
  fails(bind(w, j, { g: group(w, { parents: [w.B, other], tree: w.P }) }), "merge group without the head");
});

forEach("engineering/T151 F3: any other group shape does not bind", (j) => {
  const w = world();
  const other = sh(w.work, `git push -q origin $(git commit-tree ${w.B}^{tree} -p ${w.B} -m other):refs/heads/other && git rev-parse origin/other 2>/dev/null || git ls-remote origin refs/heads/other | cut -f1`).split("\n").pop();
  const three = group(w, { parents: [w.B, w.P, other], tree: w.P });
  fails(bind(w, j, { g: three }), "three parents");
  const root = group(w, { parents: [], tree: w.P });
  fails(bind(w, j, { g: root }), "no parent");
});

forEach("engineering/T152 F3: the step takes its inputs from the merge_group event of the queue and runs the default branch's script", (j) => {
  const { run, env } = stepOf(j);
  assert.equal(env.GROUP_REF, "${{ github.event.merge_group.head_ref }}");
  assert.equal(env.GROUP_HEAD, "${{ github.event.merge_group.head_sha }}");
  assert.equal(env.GROUP_BASE_SHA, "${{ github.event.merge_group.base_sha }}");
  assert.equal(env.GROUP_BASE_REF, "${{ github.event.merge_group.base_ref }}");
  assert.equal(env.GH_TOKEN, "${{ github.token }}");
  assert.match(run, /bind-group\.sh (branching|review)\s*$/, "one shared implementation");
  assert.equal(run.includes(j.job === "branching" ? "bind-group.sh branching" : "bind-group.sh review"), true, "each job names its own export set");
});
