# Branching

How Changes move between branches in this repository, and why. This is the repository's own Git and GitHub realization. KAAL Core and generic KAAL semantics know nothing of branches, pull requests or merge methods.

Whatever can be decided deterministically is decided once, in [`lineage.ts`](lineage.ts), and its tests are the executable specification. CI and local hooks run that checker; a failing verdict says what is wrong, what to do next, and links to the section here that explains it. This page holds the reasoning and the procedures, not the rules themselves.

## Branches

- `main` is the promoted state.
- `kaal/<capability>` is a collector. It carries a Branch Intent: one capability. It accumulates Changes and is promoted deliberately. The capability is durable and its collector is not: a collector is deleted after its promotion to `main`, and established again from `main` when new work on the capability begins (see [Promote](#promote)).
- `kaal/hotfix` is the collector for urgent corrections of existing capabilities (see [Hotfix](#hotfix)).
- Every other branch, such as `claude/*`, is a working branch. It carries a PR Intent: one bounded Change, and is deleted after that Change's pull request merges. Working branches are not protected, and their authors may rebase them.

`main` and `kaal/*` are protected. They change only through pull requests, after their required checks pass, they are up to date with their target, and review is complete. They accept no direct push or force-push, and nothing bypasses this. `main` is never deleted, and a collector is deleted only as [Promote](#promote) says. Only a `kaal/*` branch of this repository may open a pull request into `main`.

Each flow lands with one merge method:

| Flow | Pull request | Lands by |
|---|---|---|
| [Engineer](#engineer) | working branch → `kaal/<capability>` | squash |
| [Synchronize](#synchronize) | working branch holding a merge of `main` → `kaal/<capability>` | merge commit |
| [Promote](#promote) | `kaal/<capability>` → `main` | squash |

GitHub allows all three methods on `kaal/*` and cannot tie one to a pull request, so the Branching check names the method for each one (see [Telling a synchronization from a Change](#telling-a-synchronization-from-a-change)).

## Flows

### Establish

A new collector is a `kaal/*` ref created at `main`'s current tip. It adds no content, so it is not a pull request. A collector deleted after its promotion is established again, under the same name, when new work on its capability begins. A collector that still holds unpromoted Changes is never re-established, under any name, to get past staleness: it is synchronized.

Reasoning: a collector builds on what has been promoted, so its Changes are developed and verified against that state.

### Engineer

A Change is proposed from a working branch built on the collector's tip, through a pull request into the collector, and lands by squash after its required checks pass and its review is complete. Change Isolation (`engineering/change-isolation/`) decides what a Change may contain.

A Change does not bring `main` with it. A working branch from `main`, or one that merged `main` and then added work, is neither a Change nor a synchronization, and the Branching check fails it: rebase the Change onto the collector's tip, and bring `main` in through a synchronization.

Reasoning: each Change is verified on its own before it is integrated with others, and squash keeps the collector's history one commit per Change.

### Claim

Every pull request is a Change. A substantive Change, one that lands by squash, claims exactly one Change Record by adding its folder; a synchronization carries work `main` already accepted and claims none. Which of the two a pull request is, Branching decides, as [Telling a synchronization from a Change](#telling-a-synchronization-from-a-change) says. The number is provisional until the Change lands in its collector: one closed without landing consumes none, and there is no allocator, lock or registry. A required merge check, kept strictly up to date, judges the claim against the collector's current tip with Change's numbering rule as accepted on `main` (`packages/skills/kaal-change/lib/record.mjs`). If another Change took the record first, the check fails and names the next free one: rename the folder, update its references, and the check runs again. Changes land one at a time, and each new tip is checked again before the next lands. While `main` holds no such rule, the check does not apply.

Reasoning: Change owns numbering and collision; Branching owns when the claim is judged, against which tip; a rule a collector has not yet promoted does not judge its own acceptance.

### Synchronize

A collector receives a newer state of `main` while keeping its own Changes. Synchronization is a pull request into the collector like any other, so it passes the same required checks, but it lands with a merge commit. That commit makes the merged `main` commit an ancestor of the collector, so Git's merge base, GitHub's up-to-date rule and every later merge follow it.

Procedure, with ordinary Git:

```sh
git switch -c <working branch> origin/kaal/<capability>
git merge origin/main      # or an earlier main commit, to take a step
# resolve every conflict explicitly, keeping the collector's intent, in this merge commit
git push -u origin <working branch>
```

Then open its pull request into the collector, and land it with a merge commit.

- The head is the merge commit itself. Nothing follows it on the working branch: a commit after it would carry `main` as an ordinary Change. A resolution is corrected by amending the merge commit; a fix that the merge needs beyond its conflicts is a separate Change after the synchronization lands.
- The branch starts from the collector's tip because a `kaal/*` pull request must be up to date with its target. A pull request from `main` itself never is: `main` does not contain the collector's Changes.
- A synchronization may take `main` to its tip, which leaves the collector fully current, or to an earlier `main` commit that is still newer than the one it last incorporated. That is a valid intermediate step. Take a step when the resolutions would otherwise not travel alone: if `main` brought a `.github` Change and a root Change that both conflict with the collector, merge the first, land it, then merge the tip. Every step must move forward.

The paths where `main` and the collector conflicted are the synchronization's explicit resolutions. A resolution that takes `main`'s content unchanged adopts what `main` already admitted, with its own Change Isolation, and introduces nothing; the checker proves it from Git, path by path, by the exact tree entry (mode and object; absent in both counts as unchanged) and names it as adopted. Every other resolution, keeping the collector's side, combining both or writing anything new, is the synchronization's own Change, and Change Isolation judges only those. Adoption narrows nothing else: everything outside the conflicts must still be exactly `main` with the collector's Changes, and the checker verifies that; and every required check still runs on the whole resulting tree. It proves structure only. Whether a resolution keeps the right meaning is not something Git can decide: the collector's tests and review decide it. If `main` advances before the pull request lands, the synchronization is still a valid step; the next one brings the collector current.

Reasoning: the collector keeps building on what has been promoted without losing work in flight, and every synchronization is verified before it lands.

### Promote

A collector promotes into `main` through a pull request from its `kaal/*` branch, landed by squash. The promotion must be fresh: its head contains `main`'s tip, and merging it gives `main` exactly the state validated on its head. A collector that is not fresh is [synchronized](#synchronize), and the promotion is judged again on its new head.

A squash promotion records the collector's state in `main` without making the collector an ancestor of `main`. So after it lands, the collector is deleted, and the next work on its capability starts from a collector [established](#establish) again at `main`'s tip.

When a base branch is deleted, GitHub retargets its open pull requests to `main`, where they cannot land. So a Change still open against the collector either lands before the promotion and is promoted with it, or is rebased onto the re-established collector (`git rebase --onto kaal/<capability> <old collector tip>`) and retargeted to it.

A collector that has to stay, because the Owner holds it, is synchronized with `main` before its next promotion instead. That synchronization has no conflicts; it only gives the collector `main`'s new ancestry. From then on the collector may change or delete content it already promoted, and its next promotion carries exactly that.

Reasoning: `main` receives only Changes that were integrated and verified in a collector, in exactly the state that was verified, one commit per promotion. The capability is the durable home, so a collector lives only while it holds work, and no synchronization is made just to keep an empty collector current.

### One promotion at a time

> PLAN (engineering/C2): the rule below is stated as planned Test Cases of the branching checker. Until they are written and green, the rule is kept by hand.

A promotion moves `main`, and every other collector's next promotion must then contain the new tip. So promotions go up one at a time, and the synchronization a promotion needs travels with it.

- **Development synchronization.** A collector takes `main` whenever its Changes need content from it, as [Synchronize](#synchronize) says. Nothing orders it.
- **Promotion pair.** A collector about to promote opens its synchronization, when it needs one, and its promotion together, as one pair. The promotion stays unfresh until the synchronization lands, and is then judged again on its new head.
- **A queue, first in, first out.** Open promotions into `main` form one queue, ordered by pull request number: the oldest goes first. A draft promotion is open and holds its place. This is the fair default, not only a way out of a tie: a pair that queues behind another synchronizes once, after the one ahead of it lands, not once per promotion that overtakes it.
- **Owner override.** The Owner may let a particular promotion go ahead of particular older ones. The override is explicit and traceable: an Owner review or comment on the promotion that goes first, holding the line `Promotion-Order: before #<n>[, #<m> …]`, naming each older promotion it may pass. Nothing else is an override: not merge order, not a comment by anyone else, not a line on another pull request. An override changes the order only; the passed promotions still synchronize afterwards, and every other required check still applies.

The rule is a verdict of [`lineage.ts`](lineage.ts), `promotionOrder`, and its tests specify it, as for every other verdict here. Its facts are, as GitHub reports them: the pull request's base and number; the open pull requests into `main`, drafts included; on each of those, the reviews and comments holding a `Promotion-Order:` line, with their author, link and time; and whether each such author has admin permission on this repository, which is what makes a line the Owner's.

| Test Case | Planned verdict |
|---|---|
| engineering/T1 | A pull request into a branch other than `main` is not applicable. |
| engineering/T2 | A promotion passes while no other pull request into `main` is open. |
| engineering/T3 | A promotion fails while an older open promotion exists, drafts included; it names that promotion and says to open this pair after it lands or closes. |
| engineering/T4 | Of promotions open at once, the oldest passes, so the queue always moves. |
| engineering/T5 | Without complete facts (every open pull request into `main`, and every review and comment on each), it cannot judge, which fails. |
| engineering/T7 | A promotion holding an Owner override that names every older open promotion passes, and names the override's link. |
| engineering/T8 | A promotion an Owner override passes fails while the promotion holding that override is open, naming the override; it passes again once that one lands or closes. |
| engineering/T9 | A `Promotion-Order:` line by an author without admin permission authorizes nothing; the verdict names it as ignored and judges first in, first out. |
| engineering/T10 | An override names promotions, not a position: an older open promotion it does not name still blocks, and a named pull request that is no longer an open promotion into `main` is stale, which the verdict names and which authorizes nothing else. |
| engineering/T11 | On one pull request, the Owner's newest `Promotion-Order:` line decides; `Promotion-Order: fifo` withdraws an override. A line that names this pull request itself, or is not of the form above, is invalid, named, and authorizes nothing. |
| engineering/T12 | Two Owner overrides that each let their own promotion pass the other cannot both hold: neither promotion can be judged until the Owner withdraws one, and the verdict names both. |

That the pair's synchronization is in place is already a Test Case: the promotion's freshness verdict, `promotionFreshness`, fails until the promotion contains `main`'s tip. A synchronization cannot be told apart as development or promotion from Git, so nothing orders synchronizations; a pair's synchronization is wasted while an older promotion is open, since `main` moves again under it, and T3 is what stops that pair from going ahead.

The tests decide; where they run is assigned like any other check. CI runs the verdict on every pull request into `main`, beside Promotion Source, from the default branch's tip and with GitHub's facts only; that is the hard gate. It judges every open promotion again whenever any of them is opened, closed, changed or receives a review or comment, because an override on one changes the verdict of another. Before it opens a promotion pair, an agent that can read GitHub runs `promotionOrder` itself and opens the pair only where the queue lets it go.

The pre-push hook judges from Git alone, without network or credentials, so it cannot run the verdict. It is a soft reminder instead: a promotion is never pushed, it is opened from the collector, so the push the hook sees is the pair's synchronization, which Git does tell apart.

| Test Case | Planned verdict |
|---|---|
| engineering/T6 | The pre-push hook, pushing a synchronization, asks whether it belongs to a promotion pair and, if so, to check the promotion queue first; it never blocks the push. Where nobody can answer (no terminal, as for an agent), it prints the question as a warning and pushes. |

After this PLAN, the RED is these Test Cases, and the implementation of the verdict and the hook, and the `.github` change that runs and requires the check, are each a Change of their own.

Reasoning: each promotion lands on the `main` it was synchronized with, so no collector synchronizes twice for one promotion, and the order is decided by GitHub's facts and the Owner's recorded word, never by whoever lands first.

### Hotfix

A hotfix is an urgency-driven correction to an existing capability. Urgency alone decides that a correction takes this route. The capability being corrected keeps ownership of the behavior: a hotfix is neither a new capability nor a separate owner.

The route is for when the owning collector holds unfinished Changes and cannot be promoted just to ship the correction. Its Git realization is `kaal/hotfix`, a collector [established](#establish) for each correction, which holds one correction at a time. It uses only the flows above:

1. [Establish](#establish) `kaal/hotfix` at `main`'s tip.
2. [Engineer](#engineer) the correction as one Change into `kaal/hotfix`, landed by squash.
3. [Promote](#promote) `kaal/hotfix` into `main`, landed by squash.
4. Delete `kaal/hotfix` as [Promote](#promote) says, and synchronize `main` into every existing collector that owns the corrected behavior.

Nothing is relaxed. The same required checks, Change Isolation, independent review and approval, and freshness apply as on any collector. A hotfix is not a bypass or an exemption.

Reasoning: an urgent correction reaches `main` without waiting for, or carrying, unrelated work in its owner's collector, and returns to that collector through the same verified synchronization as any promoted state.

## Telling a synchronization from a Change

The Branching check judges every pull request into a collector before it lands, from Git facts alone:

- **A synchronization** is a head that is a merge commit whose first parent contains the collector's tip and whose second parent is a commit on `main`'s first-parent history newer than the state the collector last incorporated. The check verifies that everything outside the conflicts is exactly that merge, passes, names the explicit resolutions, and says: land with a merge commit.
- **An ordinary Change** is a head that carries no `main` commit the collector lacks. The check does not apply to it, and says: land by squash.
- **Anything else fails**: a head that carries `main` commits outside such a merge, a merge of a state not on `main`'s first-parent history or not newer than what the collector holds, or a `Synchronized-with: <sha>` line on anything but a merge commit of that commit. Such a line is never proof; it was the marker of earlier squash synchronizations, and the checker only reads it on commits whose Git state it verifies.

Agents and the pre-push hook run the same checker, so an agent knows the method before it opens the pull request, and states it there. Whoever lands the pull request uses the method the check names. A mistake does not reach `main`:

- A synchronization landed by squash leaves the collector without `main`'s ancestry, so its next promotion fails freshness and GitHub's up-to-date rule, often with the very conflict it resolved. A new synchronization repairs it.
- A Change landed with a merge commit leaves the verified tree unchanged and only adds history.

## Future

The flows verify different concerns: Change correctness, synchronization correctness, and promotion readiness. They may later get distinct CI profiles that reuse the same checker and tests. Today every flow runs the same checks.
