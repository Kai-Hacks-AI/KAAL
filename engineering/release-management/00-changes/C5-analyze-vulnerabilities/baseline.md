# C5 baseline

The baseline is `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` holds one workflow, `.github/workflows/dependency-review.yml`: one job, `Dependency Review`, one pinned third-party action, on pull requests into `main` and `kaal/**`, with read-only permissions. It has no merge_group trigger.
- It is a detective check only. The job fails on a vulnerable added dependency, and no ruleset requires it. The last 30 runs, all pull requests, succeeded (`inventory.md`).
- `main` holds no Intent, Requirements, Architecture or Cases for it. `engineering/controls/README.md` lists it as an uncovered gate, and `engineering/guard/architecture.md` says it stays outside Guard. No Guard declaration names it.
- Dependabot (`.github/dependabot.yml`) watches dependencies already present and is a separate concern.
