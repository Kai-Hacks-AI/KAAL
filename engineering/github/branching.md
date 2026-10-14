# Branching

How Changes move between branches in this repository, and why. This is the repository's own Git and GitHub realization. KAAL Core and generic KAAL semantics know nothing of branches, pull requests or merge methods.

Whatever can be decided deterministically is decided once, in [`lineage.ts`](lineage.ts), and its tests are the executable specification. CI and local hooks run that checker; a failing verdict says what is wrong, what to do next, and links to the section here that explains it. This page holds the reasoning and the procedures, not the rules themselves.

## Branches

- `main` is the promoted state.
- `kaal/*` are engineering lineages.
- Every other branch, such as `claude/*`, is a working branch. Working branches are not protected, and their authors may rebase them.

`main` and `kaal/*` are protected. They change only through pull requests, which merge by squash or rebase after their required checks pass and review is complete. They accept no direct push, force-push or deletion, and nothing bypasses this.

## Flows

### Establish

A new lineage is a `kaal/*` ref created at `main`'s current tip. It adds no content, so it is not a pull request.

Reasoning: a lineage builds on what has been promoted, so its Changes are developed and verified against that state.

### Engineer

A Change is proposed from any branch through a pull request into a lineage, and joins it after its required checks pass and its review is complete. Change Isolation (`engineering/change-isolation/`) decides what a Change may contain.

Reasoning: each Change is verified on its own before it is integrated with others.

### Promote

A lineage promotes into `main` through a pull request from that `kaal/*` branch of this repository. The promotion must be fresh: merging it gives `main` exactly the state validated on its head.

Reasoning: `main` receives only Changes that were integrated and verified in a lineage, in exactly the state that was verified.

#### Refresh a stale promotion

A promotion that is no longer fresh is refreshed, not merged stale and not synchronized in place:

1. In a working branch from `main`'s tip, rebase the promotion's Change onto it and resolve any conflicts.
2. Establish a new lineage at that same tip.
3. Engineer the working branch into the new lineage through its pull request.
4. Promote the new lineage. The new promotion supersedes the stale one.

### Synchronize

An existing lineage receives `main`'s current state while keeping its own outstanding Changes. Synchronization is a pull request into the lineage like any other, so it passes the same required checks.

Squash and rebase never record `main` as a parent of the lineage, so Git's merge base does not follow synchronizations. The lineage's commit message carries `Synchronized-with: <main commit>` to state which `main` state it took in. That line states intent only: the checker verifies it against the actual Git state before relying on it, and an unverified line is ignored.

Procedure, with ordinary Git:

```sh
git switch -c <working branch> origin/<lineage>
base=$(node engineering/github/lineage.ts incorporated origin/<lineage> origin/main)
git diff --binary "$base" origin/main | git apply --3way --index
# resolve every conflict explicitly, keeping the lineage's intent; git add the results
git commit -m "Synchronize <lineage> with main" -m "Synchronized-with: $(git rev-parse origin/main)"
```

Then push the working branch and open its pull request into the lineage. It may take more than one commit; the last states `Synchronized-with`.

Why this shape:

- The branch builds on the lineage's tip because a `kaal/*` pull request must be up to date with its target, which GitHub decides by ancestry. A branch rebased onto `main` does not contain the lineage's tip and stays behind it.
- `main`'s Changes are applied from the incorporated state rather than merged with `git merge`, because Git's merge base for a squash-synchronized lineage is still its original fork point. Merging from there conflicts again on every path an earlier synchronization already settled and the lineage edited since.

The paths where `main` and the lineage conflicted are the synchronization's explicit resolutions. They are its own Change and Change Isolation judges them. Everything else must be exactly `main` with the lineage's outstanding Changes, and the checker verifies that. It proves structure only. Whether a resolution keeps the right meaning is not something Git can decide: the lineage's tests and review decide it. If `main` advances before the pull request merges, rebuild against the new tip.

Reasoning: the lineage keeps building on what has been promoted without losing work in flight, and every synchronization is verified before it lands.

## Future

The flows verify different concerns: Change correctness, synchronization correctness, and promotion readiness. They may later get distinct CI profiles that reuse the same checker and tests. Today every flow runs the same checks.
