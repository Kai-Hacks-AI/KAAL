#!/usr/bin/env node
// KAAL's Promotion Source judgment of one pull request, as a KAAL-owned check that the Promotion
// Source job runs through kaal-guard (.kaal/config/guard/Promotion-Source.md). The job's former body, moved: the
// rule and its verdict live in engineering/github/lineage.ts. Its first argument is that checker, which
// Guard takes from the base revision KAAL's job supplies: the default branch's tip (trusted).
// This is the port of promotion-source.sh (engineering/github/ports/PLAN.md R3): the same inputs, output and exit codes.
//
// Facts from Guard: GUARD_BASE_REF, the target branch. From KAAL's job: KAAL_REPO, this repository;
// KAAL_DEFAULT, the default branch; KAAL_HEAD_REPO and KAAL_HEAD_REF, the source repository and branch.
// Exits as lineage.ts does: 0 pass, 1 fail, 3 not applicable; anything else is 2, cannot judge.
import { spawnSync } from "node:child_process";

const lineage = process.argv[2];
const { GUARD_BASE_REF, KAAL_REPO, KAAL_DEFAULT, KAAL_HEAD_REPO, KAAL_HEAD_REF } = process.env;
if (![lineage, GUARD_BASE_REF, KAAL_REPO, KAAL_DEFAULT, KAAL_HEAD_REPO, KAAL_HEAD_REF].every((v) => typeof v === "string" && v !== "")) {
  console.log("cannot judge: the job supplied no checker, target, repository, default branch or source");
  process.exit(2);
}
// The checker's standard error goes to standard output, as the shell's 2>&1 did: the verdict's guidance is one stream.
const run = spawnSync(process.execPath, [lineage, "source", KAAL_REPO, KAAL_DEFAULT, GUARD_BASE_REF, KAAL_HEAD_REPO, KAAL_HEAD_REF], { stdio: [0, 1, 1] });
process.exit(run.status === 0 || run.status === 1 || run.status === 3 ? run.status : 2);
