# Backlog fast lane: assessment

Answer to the CTO briefing "KAAL Backlog capability and fast-lane integration" (conceptual alignment; Owner decides). PLAN only.

## 1. Reuse of C1

Reuse all of it; nothing new is designed for the item itself.
- **Item, F1 to F3, N1** stay as they are. The fast lane judges *where* an item may travel, never *what* an item is.
- **`check` is the validity control** (CTL2). The Cases T490 to T494 become its evidence when C1's DO lands.
- **C1 is not yet DO.** The collector `kaal/backlog/item` has the PLAN only and is 50 commits behind `main`. The fast lane cannot be wired before C1's DO exists, and the collector needs a SYNC first (a flow thread's task, not this thread's).
- **Gap C1 leaves:** it speaks of items, not of where they live. C2 adds the permitted set (F4).

## 2. Fundamental distinction, made checkable

Using Backlog (capture an idea) may be fast. Changing Backlog (its Definitions, `check`, `qualify`, controls, template, routing, rulesets) is never fast: it is a normal Change through collector, PLAN, DO, ACT and promotion. The only way to make this true by construction, not by promise, is that the fast lane's judge is a *whitelist of item files* under declared roots, and that a declaration whose roots would cover anything else is itself refused (F6, CTL1).

## 3. Sequence within current boundaries

| Step | What | Owner | Route |
| --- | --- | --- | --- |
| 0 | SYNC `kaal/backlog/item` with `main` | flow thread (Integrating) | SYNC |
| 1 | Backlog capability: C1 DO (`check`, package), then this Change's DO (`qualify`, controls as items) | Backlog | collector, PLAN, DO, ACT, promotion |
| 2 | BACKLOG PR template, generated from the same truth as the API body builder | Release | Release Change, then WIRE into `.github` (B2 before or with it) |
| 3 | Controls CTL1 to CTL5 declared, evidence provoked | Backlog (contexts), Controls (qualification semantics) | with step 1 |
| 4 | Wiring: a branch kind `backlog/*`, its ruleset, `verify Stages` stage, Delivery Admission admits it, one workflow running `qualify` from the base | Release/Engineering | Engineering sources on `main` first, delivered only by WIRE (wire-controls plan) |
| 5 | Splicing | later | only if the fast lane has run safely |

The hotfix route (release/C63, C67) is the precedent for steps 2 and 4: a direct route with its own template and ruleset. Copy its mechanics; do not extend the hotfix route itself.

## 4. Necessary controls (each a `backlog/CTL<n>` item, status designed)

| Control | Type | Judges | Evidence that provokes it |
| --- | --- | --- | --- |
| CTL1 artifact isolation | preventive | the complete effective diff contains only permitted item files (add or modify); no deletion, rename, symlink, submodule or mode change; roots never cover rules | T495, T496, T497 |
| CTL2 validity | preventive | the resulting set passes `check` (F1 to F3) | T490 to T494 |
| CTL3 authority | preventive | the change is a BACKLOG route change and nothing else: author and approval as the ruleset requires; no bypass | ruleset source, WIRE case (Release) |
| CTL4 integration integrity | preventive | the queue entry is built on the tip of `main`; unique numbers over the resulting tree; a content-identical or empty diff is a clean no-op | T498, T499 |
| CTL5 retrievability | detective | after landing, every item on `main` is found and passes `check` (a full run, not the diff) | full-tree `check` in the merge group and a periodic run |

The judge reads the head as Git data and runs from the base, like `verify Triggers` (no token, no secret, no `pull_request_target`, plain `pull_request` and `merge_group`). A pull request therefore cannot change the judge that judges it.

## 5. Branches and merge queues

- **Branch kind.** Proposed `backlog/*`, a fifth delivery stock beside `kaal/*`, `hotfix/*`, `wire/*`. `main` admits it only with its own ruleset green on the exact head (Delivery Admission, `promotionSource`).
- **Queue.** It enters `main`'s merge queue like any entry: squash, one at a time, built on the tip. It cannot jump the queue and bypasses nothing. Priority against promotions (**Question 3**): proposed lowest, behind HOTFIX, WIRE and promotions, because an item can wait.
- **Collectors.** A collector holding the same item stays valid: SYNC merges `main` in, and identical bytes reconcile. A collector that edits an item differently from `main` conflicts like any file and is resolved by the SYNC.

## 6. When ordinary integration lands first

- **Collector promoted first, fast-lane PR still open.** The effective diff against the new tip is empty or contained: result `nothing-to-land`, the PR is closed as superseded, never left red (F7).
- **Fast lane first, collector promoted later.** Identical bytes reconcile on SYNC and the promotion's squash shows no change in those files; a differing edit is an ordinary conflict.
- **Two entries take the same number.** The later queue entry fails on the full resulting tree (F8, CTL4); the agent renumbers to the next free number and re-raises, as for Change Records.

## 7. Splicing (optional, last)

Idea: an event extracts the item files of a mixed PR into a separate BACKLOG PR, leaving the original untouched. Assessed, not designed:
- It adds an automation that writes branches and PRs. Its token and trust boundary need their own control (CTL3 would not cover it).
- Idempotency key: the tree hash of the extracted item files. Same hash gives the same branch and the same PR; a hash already on `main` gives no PR.
- Git reconciles identical content, but squash merges give different commits, so the original's later promotion must show no difference in those files; otherwise it is a conflict, not a splice failure.
- Recommendation: not before the manual fast lane has run safely for a while; then its own PLAN.

## 8. Recovery and idempotency

- `check` and `qualify` are pure and deterministic; re-running changes nothing and no state is stored (F3). There is nothing to repair, only to re-run.
- A failed queue entry leaves its branch; the same content re-raised from the same branch is the same PR.
- Reverting a captured item is a new BACKLOG change (a Drop is a recorded fact, deletion is refused): history stays.
- A refused PR can be re-judged after fixing the diff; UNKNOWN never passes and never auto-closes.

## 9. Open decisions (one at a time)

1. **What is "Zero"?** Read as the `00` slot of the layout, the place of Backlog artifacts. Today `00-changes` holds Changes, and Kai's earlier layout was `packages/<capability>/backlog/`. Recommended: the roots are declared data, so the PLAN does not fix the folder; the first proof uses one root owned by Backlog alone, `packages/kaal-backlog/backlog/`. Which folder name and where?
2. **Approval of BACKLOG PRs.** The ruleset keeps its approving review. By whom: the CPO per PR, a designated reviewer after the controls are green, or batch review? "Fast" must not mean unreviewed.
3. **Queue priority** of BACKLOG entries (proposed lowest).
4. **Branch kind name** (`backlog/*` proposed) and its stage name in Engineering.
5. **Cross-owner roots.** Product backlogs of other capabilities would sit inside their packages (`ownership.kaal.json` claims the whole package, inventories digest it, tarballs ship it). Needs an ownership rule before roots widen beyond the first proof.
6. **B2 first.** A BACKLOG template is only as good as the API body builder behind it; do B2 (one truth, generated interfaces) before or with step 2.
7. **Change Isolation rebuild (B1).** Its per-kind permitted sets should be declarative so hotfix (exemption) and backlog (restriction) are the same mechanism.
