// engineering/ports Case T2: promotion-source.mjs is the port of promotion-source.sh, with identical inputs, output and exit codes
// (engineering/github/ports/PLAN.md R3, R4, R6). The table below was recorded from the SHELL running on these very inputs before it
// was removed: argument and environment, exit status, and the output text with the checker's standard error merged in (the shell's
// 2>&1). `<stub>` is the temporary checker the Case writes; the other checker rows run the real lineage.ts. A checker that does not
// exist prints Node's own message, which is Node's text, so that row pins the status and the fact, not the stack.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PORT = join(ROOT, "engineering/github/promotion-source.mjs");
const dir = mkdtempSync(join(tmpdir(), "promotion-source-"));
after(() => rmSync(dir, { recursive: true, force: true }));
const stub = join(dir, "stub.mjs");
writeFileSync(stub, 'console.log("out:" + process.argv.slice(2).join("|"));\nconsole.error("err:line");\nprocess.exit(Number(process.env.STUB_EXIT ?? 0));\n');

const RECORDED = 
[
 {
  "name": "all supplied, checker passes",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "0"
  },
  "status": 0,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 1",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "1"
  },
  "status": 1,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 3",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "3"
  },
  "status": 3,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 2",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "2"
  },
  "status": 2,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 4",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "4"
  },
  "status": 2,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 7",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "7"
  },
  "status": 2,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "checker exits 130",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x",
   "STUB_EXIT": "130"
  },
  "status": 2,
  "output": "out:source|o/r|main|main|o/r|kaal/x\nerr:line\n"
 },
 {
  "name": "no checker argument",
  "args": [],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty checker argument",
  "args": [
   ""
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "missing GUARD_BASE_REF",
  "args": [
   "STUB"
  ],
  "env": {
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty GUARD_BASE_REF",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "missing KAAL_REPO",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty KAAL_REPO",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "missing KAAL_DEFAULT",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty KAAL_DEFAULT",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "missing KAAL_HEAD_REPO",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty KAAL_HEAD_REPO",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "missing KAAL_HEAD_REF",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r"
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "empty KAAL_HEAD_REF",
  "args": [
   "STUB"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": ""
  },
  "status": 2,
  "output": "cannot judge: the job supplied no checker, target, repository, default branch or source\n"
 },
 {
  "name": "checker file missing",
  "args": [
   "engineering/github/does-not-exist.mjs"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 1,
  "contains": "Cannot find module"
 },
 {
  "name": "real checker: kaal branch into main passes",
  "args": [
   "engineering/github/lineage.ts"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 0,
  "output": "Promotion from kaal/x.\n"
 },
 {
  "name": "real checker: working branch into main fails",
  "args": [
   "engineering/github/lineage.ts"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "claude/x"
  },
  "status": 1,
  "output": "main accepts pull requests only from kaal/* branches of o/r, not from o/r:claude/x. Take this Change into a kaal/* lineage through a pull request, then promote that lineage. See engineering/github/branching.md#promote\n"
 },
 {
  "name": "real checker: fork into main fails",
  "args": [
   "engineering/github/lineage.ts"
  ],
  "env": {
   "GUARD_BASE_REF": "main",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "f/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 1,
  "output": "main accepts pull requests only from kaal/* branches of o/r, not from f/r:kaal/x. Take this Change into a kaal/* lineage through a pull request, then promote that lineage. See engineering/github/branching.md#promote\n"
 },
 {
  "name": "real checker: into a collector is not applicable",
  "args": [
   "engineering/github/lineage.ts"
  ],
  "env": {
   "GUARD_BASE_REF": "kaal/core",
   "KAAL_REPO": "o/r",
   "KAAL_DEFAULT": "main",
   "KAAL_HEAD_REPO": "o/r",
   "KAAL_HEAD_REF": "kaal/x"
  },
  "status": 3,
  "output": "Not a promotion: kaal/core is not main.\n"
 }
];

for (const row of RECORDED) {
  test(`ports/T2 [R3, R4, R6]: promotion-source.mjs, ${row.name}: same status and output as the shell recorded`, () => {
    const args = row.args.map((a) => (a === "STUB" ? stub : a));
    const run = spawnSync(process.execPath, [PORT, ...args], { cwd: ROOT, env: { PATH: process.env.PATH, ...row.env }, encoding: "utf8" });
    assert.equal(run.status, row.status);
    const output = (run.stdout + run.stderr).split(stub).join("<stub>");
    if ("contains" in row) assert.ok(output.includes(row.contains), output);
    else assert.equal(output, row.output);
  });
}
