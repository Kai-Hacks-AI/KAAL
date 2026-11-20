# architecture/D3: C15 was promoted without its ACT

Found at `packages/kaal-architecture/00-changes/C15-target-separation/`, after the promotion of `kaal/architecture/classify` (#2133) into `main`. A Defect of one Change on `main`, found in the context of Architecture. It is one Defect: the failure is the missing ACT, and the stranded pull request is how it shows.

## Record

```json
{
  "id": "architecture/D3",
  "context": "architecture/C15 (target separation), on main after PROMOTION #2133",
  "expected": "A Change on main is complete: its PLAN, DO and ACT went into the collector and the collector was promoted with them (strategy.md: PLAN, DO and ACT go into the collector, then the collector is promoted; branching.md, Promote: a Change still open against the collector lands before the promotion, or is rebased onto the re-established collector). Every Change folder that holds a do.md also holds its act.md.",
  "observed": "packages/kaal-architecture/00-changes/C15-target-separation holds C15.md, disposition.md, do.md and evidence.md and no act.md. Its ACT, PR #1631, was open against kaal/architecture/classify when that collector was promoted (#2133) and deleted; GitHub retargeted #1631 to main, where it conflicts and carries 12 commits and 81 files of the old collector history. C15 is the only Change under packages/ with a do.md and no act.md.",
  "where": "packages/kaal-architecture/00-changes/C15-target-separation/",
  "reach": "packages/"
}
```

## Proof

architecture/T30 lists the Change folders under `packages/` that hold a `do.md` and fails on `main`: `packages/kaal-architecture/00-changes/C15-target-separation` holds no `act.md`. It turns GREEN when C15's ACT is on `main`.

## Not claimed

How the ACT lands is the fix, a Change, not this Defect. branching.md already names the way: rebase the ACT onto the re-established collector and retarget it, and not merge #1631 as it stands (it carries the old collector history). That GitHub retargets an open pull request to `main` when its base is deleted is documented, not a Defect. Whether the promotion should have waited for #1631 is Release's to judge: Pull Promotion judges a collector from its files and cannot see an open pull request. Where the correction belongs is Architecture's.
