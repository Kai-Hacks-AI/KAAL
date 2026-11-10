# freeze Collector: a promotion waits while open pull requests still target its collector (PLAN)

Change `release-management/C6`, control **freeze Collector** (`release-management/F21`; F11 is approve Promotion, F17 and F18 are taken, F19 is verify Envelope, F20 is a Change feature id; name chosen by the Owner, 10 November 2026: the verb matches the class of the control, and "clear" and "drain" are corrective, so they are out). PLAN, nothing is built; the failing Cases (T31 to T37, T54 and T55) are in `04-test/clear-collector.red.mjs`, carried unwired.

## Intent (Owner, 10 November 2026)

"If a PR points at a branch, can we have a control which tells us that promotion is uncool?" It is part of the release-management setup: named in the domain's language, placed at its station. The event behind it: `kaal/mnemonics` was promoted into `main`, GitHub deleted the collector (collectors are terminated on promotion), and #1291, still targeting it, was retargeted to `main` automatically and went red, because the only way into `main` is `kaal/*` into `main`.

## The control

- **Station: Promotion**, beside serialize Promotion (F13). A **preventive** control (before the promotion lands, not after).
- **The invariant.** While a promotion of `kaal/<X>` is open, `kaal/<X>` is **frozen**: no pull request may target it, and the promotion proceeds only once no pull request targets it. GitHub cannot stop a pull request being opened, so this does not claim to: it makes opening one visible, failing and unmergeable.
- **Judges** two things with one function. A promotion of `kaal/<X>` into `main` (**held** while pull requests target `kaal/<X>`), and any pull request whose base is a frozen collector (**fail**, T54). Not applicable to anything else, including a pull request into a collector with no open promotion (T55).
- **Verdict.** **Held** (it waits, it does not fail the lineage and it is not a pass) while any open pull request, drafts included, has `kaal/<X>` as its base, other than the promotion itself. The verdict names each pull request. Held never satisfies a gate (T28's rule, applied here; the gates read held as not passed once the Branching split lands, and the lanes gate already does).
- **Missing facts are no evidence.** If the list of open pull requests was not gathered, the verdict is not a pass; an empty list that was successfully gathered passes.

## Separate the control from where it is applied (Owner, 10 November)

| Layer | Class | What it does | Needs |
| --- | --- | --- | --- |
| Local hook (C5) | feedback | warns before a push or pull request targets a frozen collector (the open promotion list needs the network; without it the hook says it cannot tell) | C5 DO |
| Pull request check | evidence | fails any pull request that targets a frozen collector; holds the promotion while pull requests still target it | `.github` step, Kai's go |
| Gate or ruleset | authorization | blocks those merges; an optional branch lock on the frozen collector is a further step | Kai's separate go |

The judgment is the same pure function at every layer; the layers differ in what they may do with the verdict.

## Recovery: exactly two routes (Owner, 10 November)

For a pull request that targets a frozen collector, the same two routes apply: retarget it, or wait until the promotion is closed without merging (`Recovery: none (route: wait until promotion #<n> is closed without merging)`). Waiting for the promotion to land would leave the pull request retargeted to `main` by GitHub, which is what must not happen.

1. **Retarget** each open pull request to **another collector that exists now**, before the promotion: `gh pr edit <number> --base <kaal/Y>`.
2. **Wait** until they have landed in `kaal/<X>`: `Recovery: none (route: wait until #<n> has landed in kaal/<X>)`.

**Retarget never means: deliver, then recreate.** Promoting, then recreating the collector and pointing the pull requests back at it (what was done for #1291) is not a recovery and is never offered: no recovery line creates or pushes `kaal/<X>`, none retargets to `main`, and none retargets to the collector being promoted. The Cases prove that.

## Fast promotion is the hotfix route, never a bypass (Owner, 10 November)

When a promotion cannot wait for the pull requests on its collector, the route is the hotfix as `engineering/github/branching.md#hotfix` defines it (today `kaal/hotfix`), a collector established at `main`'s tip for one urgent correction of an existing capability, the correction as one Change into it, then its promotion, with "nothing relaxed". The verdict points at that route, by that anchor and not by branch name, as a `Fast path:` line (information, not a third recovery: the two recoveries above stay exactly two) and offers no override. This control is not bypassed for a hotfix either: the hotfix branch is a collector, so a pull request targeting it holds its promotion the same way. This PLAN does not define or change the hotfix; it cites it.

## Use or build

- **Use** the existing lineage controls for what is a promotion and which branch is a collector (promotion Source, `lineage.ts` collector verdicts); build only the judgment over the list of open pull requests.
- The facts (the open pull requests and their bases, the existing collectors) are gathered by the caller; the judgment is a pure function, like the other controls. Placement: `05-src/promotion/` (the Promotion station), born in KAAL.
- GitHub gives the list (`pull_request` list by base); a hook cannot have it, so the earliest stage is integration/promotion (CI only), and `earliestStage` says so.

## Open for the Owner and CPO

- **When it is re-judged.** Retargeting or landing another pull request emits events on that pull request, not on the promotion. The promotions go through the merge queue on `main`, so the control is judged again in the merge group at merge time, which is also what closes the race (a pull request opened after the first judgment). To be proven in the DO; a scheduled re-evaluation is the fallback.
- The feature id `F21` goes into the root documents with the DO, not before. A branch lock on a frozen collector, and whether the check becomes required, are the Owner's separate go.
- Forked pull requests and pull requests into the collector from other repositories: counted (any open pull request with that base).

## Sequence

1. This PLAN, CPO review (the Cases are written here, unwired).
2. DO (`release-management/C6 DO`): the pure judgment in `05-src/promotion/`, the Cases wired into the suite in the same pull request that makes them pass, the `.github` job and the merge-group judgment as a separate step with the Owner's go.
3. ACT: what the first uses teach (for example, whether drafts should count).

Nothing is wired, activated or changed by this PLAN.
