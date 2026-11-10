# Development hooks: one thin entry per Git hook, no new judgments (PLAN)

PLAN, nothing is built. The Owner likes all the common client-side Git hooks (10 November). This PLAN argues each one from Intent, says which Guard checks it would call and what it needs, and says plainly where there is no argument. It builds on the Development stage and the feedback, evidence and authorization distinction of the lifecycle assessment, and on the `development/` boundary recommended in #1354 (which the Owner has not yet decided).

## What every hook shares

- **Feedback only.** Every client-side hook can be skipped (`git commit --no-verify`, `git push --no-verify`; the `post-*` hooks and `pre-rebase` are not skipped by `--no-verify` but are advisory too), and a hook result is never evidence for a CI gate. A hook says "not verified locally" where a fact is missing, never a pass.
- **Thin.** A hook file in `.githooks/` holds no judgment. It names its hook point and calls Guard for the checks registered for that point. All judgment stays in the controls (lineage, change isolation, and so on), which CI also runs. A Case fails a hook file that contains a judgment.
- **USE versus BUILD.** Guard's `runs: [hook]` today means the one `pre-push` hook: the declaration has no hook point, and Guard supplies `head`, `base`, `base-ref` and `changed` only at push time. Guard's declaration format is a strict subset: an unknown member is refused. So the point of a check cannot be added to a declaration without a change to the package. Birth in KAAL: a KAAL-side table maps each hook point to the Guard checks it calls, held in `development/` (or in `.githooks/` until that folder exists), and a Case checks that every check it names is declared `runs: [hook]`. Moving the point into Guard's declaration is the later abstraction. Whether `kaal-guard run --hook` accepts `--check <name>` to run a named subset is to be confirmed in the RED; if not, that is a Guard gap to raise, not to work around.
- **Facts.** Only `pre-push` has facts today (head, base, base-ref, changed). Each other hook has different ones (staged paths, the message file, the previous and new head). A check may declare only facts the hook point supplies; a Case reads the declaration and the table and fails a check that needs a fact its hook point cannot give (the same registry reading as `earliestStage` of #1352).
- **Latency.** The hooks run on every commit or checkout, so each has a time budget set by a Case at RED and approved by the Owner. No number is chosen here.

## Each hook, argued from Intent

Intent I1 is that only an approved, correctly shaped change reaches `main`, by the lineage. A local hook has an argument when it finds, earlier, something CI would also find, or when it keeps the local feedback honest.

| Hook | Argument from Intent | Calls | Needs | Verdict |
| --- | --- | --- | --- | --- |
| `pre-push` | Exists. The branching and Change Isolation judgments on each pushed ref, before CI sees it (I1). | `push` (today) | head, base, base-ref, changed | Keep; already a thin adapter in substance but long (target resolution in shell): the Case for thin applies, and the target resolution moves into the check. |
| `pre-commit` | Argument: the path rule of Change Isolation is decided by the paths of the change, which exist at staging; finding a path outside a Change's scope there is the earliest place for the same judgment CI makes (I1, isolate Change). | `isolate Change` on the staged paths | staged paths as `changed` (Guard does not supply it at this point: a Guard gap) | Plan, after the gap is decided. Lint, format and secrets: **no argument yet**. KAAL declares no lint or format control, and secrets are covered by GitHub's own push protection and `scan Vulnerabilities`, which are not hook checks; a local copy would be a second implementation. Say so, do not fill. |
| `commit-msg` | Argument only if the repository has a commit message convention a control judges. The only candidate is the `Version:` convention of version Package (T1 to T3), still an open Owner decision. | none yet | the message file | **No argument until the convention is decided**; then a check on the message, not a new judgment in the hook. |
| `prepare-commit-msg` | A template fills a message; it does not judge, so it is not a Guard check and has no verdict to register. Its only use is to pre-fill the convention that `commit-msg` would judge. | none | the message file | **No argument on its own**; a possible companion of `commit-msg` once the convention exists. |
| `post-checkout`, `post-merge` | Argument: the feedback must not lie. `pre-push` already reports "Not verified: kaal-guard is not installed in this clone" when `node_modules` is stale or absent. A hook that reports (never runs `npm ci`) when the lockfile changed and the installed controls may be out of date prevents a stale local verdict. | a report only: lockfile or `packages/` changed since the install | previous and new head | Plan as a report. No automatic install: a hook that runs a package manager has side effects the Owner has not asked for. |
| `pre-rebase` | Argument: lineage integrity (audit Lineage; the Owner's rule never to rewrite history of a shared line). Refusing or warning on a rebase of a `kaal/*` branch that other work builds on keeps the history the lineage controls judge intact. | a check on the branch being rebased | the upstream and the branch | Plan as a warning that names why; advisory like the rest. |

## Evidence in the history (not theory)

The Owner's point is that the project history already justifies the hooks. What I found in the repository's pull requests, cited only as far as I read them:

| Hook | Incident or origin in the history |
| --- | --- |
| `pre-push` | #25 created it: "fast local feedback on Change Isolation before a push, so a nonconforming Change is caught before a PR exists", from the same checker CI runs. #652 (merged 30 Oct) and #927 (merged 3 Nov) added the CI line that says the pre-push hook was "an earlier opportunity to catch the failure" whenever a check that runs in both fails in CI: Guard already has the earliest-stage concept for this one hook. In this release work, the Branching auto-merge trap (#1349, #1352) is a failure that reached CI and could have been named earlier (the practice of opening a pull request with auto-merge on). |
| `pre-commit` | #750 and #777 gave Engineering the root manifest ownership check: an edit of `package.json` or `package-lock.json` is judged by who owns the claim, and the candidate's lockfile is derived twice and compared. That is the path-set judgment of Change Isolation, found today at push or in CI. #1285 shows the cost of late discovery: two Engineering checks failed on Foundation's #1272 in CI only. |
| `pre-rebase` | #97 (replacing #89) had to recover the `kaal/sealing` collector "by ordinary synchronization, preserving its history. ... no reset, re-establishment, force-push or rewrite", and #223 and #228 are the same family (synchronizing a collector with `main`; a collector deleted after its promotion). Rewriting a shared line is the incident a `pre-rebase` warning prevents. |
| `post-checkout`, `post-merge` | The `pre-push` hook already carries the case in its own text: "Not verified: kaal-guard is not installed in this clone. Run npm ci". #924 (lockfile strategy) and #777 show that dependency state is governed and moves. A stale install gives a local verdict that disagrees with CI, which is the feedback lying. I did not find a single past pull request that names a stale install as its cause, so this one rests on the hook's own text and the lockfile work, not on a recorded incident. |
| `commit-msg`, `prepare-commit-msg` | I searched the pull requests for commit message, lint, format and secret incidents and found none that a hook would have prevented. The PR template (Intent, Design, Verified by, Validated by) is enforced on the pull request body, not on commits. If the Owner knows of an incident, it belongs here; until then there is no recorded argument. |

Summary: three hooks have an argument now (`pre-push` exists; `pre-commit` for the path rule once the facts exist; `pre-rebase` as a warning), one is a report (`post-checkout` and `post-merge` together), and two have no argument until an Owner decision creates one (`commit-msg`, `prepare-commit-msg`). If the Owner wants them anyway, they are installed as thin entries that call no check, which is a hook that does nothing; I recommend against that.

## Sequence

1. This PLAN, CPO review.
2. RED (Cases, nothing wired): every `.githooks/*` file is thin (parsed, no judgment); every hook point names only checks declared `runs: [hook]`; every check's declared facts are supplied at its hook point; the equivalence of hook and CI verdicts where facts exist; "not verified locally" where they do not; a time budget per hook.
3. DO, one hook per step, in this order: make `pre-push` thin, then `post-checkout` and `post-merge` (report only), then `pre-commit` after the `changed` fact for staged paths is decided with Guard, then `pre-rebase`. `commit-msg` and `prepare-commit-msg` wait for the `Version:` decision.
4. Guard abstraction, later: the hook point as part of the declaration, and the product-language vocabulary of `earliestStage`, as the Owner placed it (born in KAAL, abstracted later).

## Open for the Owner and CPO

- Whether `development/` (#1354) is the home of the table and Cases, or `.githooks/` until it is decided.
- The staged-paths fact at `pre-commit`: a Guard supply, or KAAL computes it and passes it.
- The `Version:` convention, which decides `commit-msg` and `prepare-commit-msg`.
- Whether the two hooks with no argument are left out (recommended) or installed as no-ops.
- The per-hook latency budgets.

Nothing is activated, wired or changed by this PLAN.
