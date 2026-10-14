# Branching

How Changes move between branches in this repository. KAAL owns the engineering rules, such as Change Isolation in `engineering/change-isolation/`. GitHub realizes and enforces them through rulesets and required checks, which supply inputs to KAAL's rules and act on their outcome without re-implementing them.

## Branches

- `main` is the promoted state.
- `kaal/*` are engineering lineages.
- Every other branch, such as `claude/*`, is a working branch. Working branches are not protected, and their authors may rebase them.

## Flows

### Establish and Synchronize: `main` → `kaal/*`

**Establish** creates a fresh lineage at `main`'s current tip. This creates a ref at a commit `main` already holds and adds no content, so it is not a pull request.

**Synchronize** brings `main`'s state into an existing lineage while keeping that lineage's ongoing Changes. The lineage is protected, so this is a pull request into it, judged by its required CI.

Reasoning: a lineage builds on what has been promoted, so its Changes are developed and verified against that state.

### Engineer: anything → `kaal/*`

A Change is proposed from any branch, such as a working branch, through a pull request into a lineage. It joins the lineage only after its required CI passes and its review is complete.

Reasoning: each Change is verified on its own before it is integrated with others.

### Promote: `kaal/*` → `main`

Only `kaal/*` lineages of this repository may open pull requests into `main`. No other source promotes directly.

Reasoning: `main` receives only Changes that were already integrated and verified in a lineage.

A promotion that is out of date with `main` is refreshed rather than merged stale. Rebase its Change onto `main`'s current tip in a working branch, establish a fresh lineage from `main`, engineer the rebased Change into it, and resubmit the promotion from that lineage. The new promotion supersedes the stale one.

## Controls

- Protected branches (`main` and `kaal/*`) change only through pull requests. They accept no direct pushes, no force-pushes and no deletion.
- Pull requests merge by squash or rebase only.
- A pull request must be up to date with its target before it merges.
- Required checks must pass. A failing check states what to do next, for example to refresh or rebase the Change and resubmit it.
- The checks that run today are Change Isolation, on every pull request, and Promotion Source, on pull requests into `main`.

## Future

The three flows verify different concerns: synchronization correctness and preservation of ongoing work, Change correctness, and promotion readiness. They may later get distinct CI profiles that reuse KAAL-owned tests and rules. Today every flow runs the same checks.
