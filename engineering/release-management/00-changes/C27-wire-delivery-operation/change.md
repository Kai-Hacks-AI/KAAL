# C27 change

## PLAN (revised 14 Nov after the CPO review of the first head)

1. Add F22 and A47, the gap G61, the draft of the WIRE template and four Cases, all RED on `main`, in two groups that never wait for each other.
   - **Collector CHECK Cases**, green in the collector with no install: T281 (the template source `05-src/wiring/templates/wire.md` equals the draft and has exactly the chapters Source, Target, Verification) and T282 (the install judge `05-src/wiring/wire-judge.mjs`, shown on known good and bad installs). Their deliverables are Engineering sources, absent today, so both are RED; the DO makes them green. The collector's ACT needs only these.
   - **WIRE Cases**, executed at WIRE on the installed tree and never a prerequisite of the collector's ACT: T283 (`.github/PULL_REQUEST_TEMPLATE/wire.md` equals the template source) and T284 (the installed dispatcher equals its source, and the legacy hook moved unchanged). They stay `.red.mjs` through the collector's promotion and are renamed in their WIRE pull request.
2. The PLAN installs nothing, activates no ruleset or branching rule, promotes nothing and changes no existing delivery contract.

## Moves are shown by their preimage

A legacy move is not a generic exemption. A WIRE declares each move as `{from, target, sha256}`: the judge accepts it only when the content of `from` on `main` has that sha256 and the target has exactly that content. For C26 the declared move is `.githooks/pre-push` to `.githooks/old/pre-push` with sha256 `df18ff0179e9a10ae340cd463d7012305c438b7148f0217348974b7ab56c8c06`. Any other change is a copy and must equal its source.

## Bootstrap of the WIRE template

The first install of `wire.md` cannot use a WIRE template that does not exist yet. It is one ordinary `.github`-only DO, whose verification is T283. After it, every install is a WIRE.

## Relation to PROMOTION and HOTFIX

PROMOTION moves a qualified collector to `main`. HOTFIX is the urgent path for a Defect. WIRE installs an artifact that is already on `main` into `.githooks/` or `.github/`. PROMOTION is the only path from a qualified `kaal/<collector>` to `main`. HOTFIX and WIRE run on their own branches, `hotfix/<name>` and `wire/<name>`, into `main` through a protected pull request; each has its own branch classification, required checks and (planned) ruleset. None of the three is a PDCA cycle. A WIRE is not a collector and takes no promotion seat.

## What WIRE checks and what the collector qualifies

- Collector (PDCA, before PROMOTION): the source of the control, judged by isolated executable Cases, and the ACT.
- WIRE: installed equals source byte for byte, the legacy file moved unchanged, nothing else changed, and the operational acceptance of the target (for hooks, Guard acceptance on the installed tree).

An installation-dependent Case therefore has a second home: the collector holds the Case that judges the source, and WIRE holds the Case that judges the install. No second PDCA.

## Revised sequence for release/C26

1. Engineering collector: the dispatcher is committed as the source `05-src/wiring/hooks/pre-push-dispatcher`, and T206 judges that file in isolation (legacy preserved, arguments and refs forwarded, failures aggregated, fail-closed), together with #1645 (Guard acceptance T5, already in the collector). The final ACT is written once T206 is green, and the collector is promoted, so the source is on `main` before any WIRE. T207 and T208 move out of the collector's CHECK into the WIRE verification.
2. WIRE: once that source is on `main`, #1646 is replaced by or re-based as the pull request from `wire/githooks-split` into `main`, protected by the WIRE checks. Its diff does not grow: the declared move of the legacy hook (by sha256), the dispatcher as a copy of its source and the README. T207, T208 and T284 are its verification, with Guard acceptance on the installed tree.
3. The provisional ACT #1649 is closed unmerged. C26 therefore runs: Engineering PDCA, Engineering promotion, `wire/githooks-split`, protected `main`.

## `.github` installs

C18's workflows and ruleset JSON follow the same path: sources through the Engineering collector, then WIRE for `.github`. T204 (installed equals source) is the WIRE verification of C18. Installing the ruleset into GitHub is not a WIRE of files and needs the Owner's go.

## DO

1. In the Engineering collector: the template source `05-src/wiring/templates/wire.md` and the judge `05-src/wiring/wire-judge.mjs`; T281 and T282 are renamed to `.test.mjs` when green. Then the ACT, then the promotion.
2. The bootstrap install of `wire.md`: an ordinary DO, alone in a `.github` collector, because no `wire/<name>` path exists yet; T283 is its verification. The title type, Branching and merge-method classification are a separate DO that needs review and the Owner's authorization.

## ACT

1. A 4L retrospective of the Change, from the viewpoint of the agent that carried it, in `act.md`. It lands in the collector before the promotion.

## Enforcement ruling (CPO, 14 Nov)

GitHub rulesets match the target branch, which is `main` for PROMOTION, HOTFIX and WIRE alike, so a separate "WIRE" ruleset targeting `main` cannot by itself tell a `wire/*` head apart. There is one protection policy on `main`, with mandatory checks and classification that depend on the delivery type. A later DO designs and tests that branch- and type-sensitive enforcement explicitly and fails closed for an unclassified pull request. The template bootstrap needs a separately reviewed, protected, existing delivery path and never weakens the protection of `main`. Activating any ruleset or branching rule needs the Owner's explicit authorization.

## Not in this Change

A WIRE workflow engine, a registry of installs, the title type and Branching rules, any ruleset activation, and promoting or editing release/C26 or release/C18.
