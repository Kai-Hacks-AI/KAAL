# architecture/D3: the collector kaal/architecture/classify was promoted without having fulfilled its PDCA

Found at `packages/kaal-architecture/00-changes/C15-target-separation/`, after the promotion of `kaal/architecture/classify` (#2133) into `main`. A Defect of one collector, found in the context of Architecture, where its mark is on `main`: C15 has a PLAN and a DO and no ACT. It is one Defect: the failure is the promotion before PDCA was fulfilled, and the missing ACT and the stranded pull request are how it shows.

## Record

```json
{
  "id": "architecture/D3",
  "context": "architecture/C15 (target separation), in the collector kaal/architecture/classify promoted by #2133",
  "expected": "A collector is promoted only when it has fulfilled its PDCA: every Change in it has its PLAN, DO and ACT in the collector, and then the collector is promoted (engineering/release-management/strategy.md, Priority and flow; engineering/github/branching.md, Promote; Pull Promotion in kaal-release, 'fulfilled their PDCA'; the plan requirement pull/F22, every Change in it has every lifecycle type landed). A Change still open against the collector lands before the promotion, or is rebased onto the re-established collector. So on main every Change folder that holds a do.md also holds its act.md.",
  "observed": "The collector kaal/architecture/classify was promoted by #2133 while C15 had its PLAN and DO and no ACT: its ACT, #1631, was still open against the collector. packages/kaal-architecture/00-changes/C15-target-separation on main holds C15.md, disposition.md, do.md and evidence.md and no act.md. The collector was deleted, GitHub retargeted #1631 to main, and it now conflicts and carries 12 commits and 81 files of the old collector history. C15 is the only Change under packages/ with a do.md and no act.md.",
  "where": "packages/kaal-architecture/00-changes/C15-target-separation/",
  "reach": "packages/"
}
```

## Proof

architecture/T30 lists the Change folders under `packages/` that hold a `do.md` and fails on `main`: `packages/kaal-architecture/00-changes/C15-target-separation` holds no `act.md`. It turns GREEN when C15's ACT is on `main`.

## Where the expectation is stated

In prose, in `strategy.md` and `branching.md`, and as the aim of Pull Promotion, which names the collectors that have fulfilled their PDCA. No Requirement or Intent of Release states it as a rule of a promotion: `release/I39` and `release/F15` say when a promotion is raised and what its body holds, not what a promotion may carry. The plan requirement pull/F22 says it per Change, and Pull Promotion judges a collector from its files and is not consulted by the promotion. Whether to state the rule is Release's, and is not part of this Defect.

## Not claimed

How the ACT lands is the fix, a Change, not this Defect. branching.md already names the way: rebase the ACT onto the re-established collector and retarget it, and not merge #1631 as it stands (it carries the old collector history). That GitHub retargets an open pull request to `main` when its base is deleted is documented, not a Defect. Whether the promotion should have waited for #1631 is Release's to judge: Pull Promotion judges a collector from its files and cannot see an open pull request. Where the correction belongs is Architecture's.
