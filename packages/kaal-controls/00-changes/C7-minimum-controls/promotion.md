# C7 promotion

## Route

A PLAN never goes to `main` alone.

1. PLAN and DO go into the collector `kaal/controls`, each by its own pull request, squashed.
2. The collector goes to `main` as a whole, by a promotion pull request, on the Owner's go.
3. ACT goes to `main`, possibly through the collector, so the learning is recorded.

The collector is created from `main`. The earlier collector, now `kaal/old/controls`, is left untouched. No ruleset changes, no publication, and no go is implied by this PLAN.

## Smallest coherent promotion

Everything under `packages/kaal-controls/`: the Node, the Definition, the Skill, the example, the shell and the Change's own documents. Nothing outside it changes. The package is not added to `workspaces`, so no other capability depends on it.

## Evidence before promotion

| Kind | Evidence | Strength |
| --- | --- | --- |
| Structural | Cases T8 to T23 are green in the collector and were RED against `main` (`evidence.md`) | verified by Cases |
| Behavioral | The consumption trial: an agent given only the Skill and the contracts it names writes a control PLAN for a control that is not C5, and a second reader checks that it states the seven steps, uses the shared relationships, invents no semantics and copies no contract | validated by judgment of the CPO, not a Case |
| Operational | None. Controls enforces nothing, so no operating claim is made or needed | stated as not applicable |

The Skill is not described as effective until the trial has been read. A green Case shows the documents say what F10 to F14 require, nothing more.
