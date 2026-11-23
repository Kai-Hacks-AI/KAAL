# architecture/D3: the collector kaal/architecture/classify was promoted without having fulfilled its PDCA

Found at `packages/kaal-architecture/00-changes/C15-target-separation/`, after the promotion of `kaal/architecture/classify` (#2133) into `main`. A Defect of one collector, found in the context of Architecture, where its mark is on `main`: C15's Cases are closed and its ACT has not followed. It is one Defect: the failure is the promotion before PDCA was fulfilled, and the missing ACT and the stranded pull request are how it shows.

## Record

```json
{
  "id": "architecture/D3",
  "context": "architecture/C15 (target separation), in the collector kaal/architecture/classify promoted by #2133",
  "expected": "A collector is done only when its PDCA is fulfilled, judged by the result: the PLAN of each Change ends in RED Test Cases, DO closes them (GREEN), ACT is possible only when all of them are closed, and only then is the collector done and promoted. The files that carry PLAN, DO and ACT are delivery, not the judgement (Kai, 11-20). Where the Cases of a Change are all closed, its ACT follows before the collector is promoted (strategy.md, Priority and flow; branching.md, Promote; Pull Promotion in kaal-release; pull/F22).",
  "observed": "The collector kaal/architecture/classify was promoted by #2133 after C15's DO had closed its Cases (T14 to T22, nine Cases, all green on main) and before its ACT: the 4L retrospective of C15 (#1631) was still open against the collector. On main no retrospective of C15 follows the closure. The collector was deleted, GitHub retargeted #1631 to main, and it now conflicts and carries 12 commits and 81 files of old collector history.",
  "where": "packages/kaal-architecture/00-changes/C15-target-separation/",
  "reach": "packages/"
}
```

## Proof

architecture/T30 judges from the result. It finds the Cases of C15's PLAN (T14 to T22), requires that none is still red-named and that they all run green (C15 is closed, so its ACT is due), then requires a 4L retrospective of C15, recognised by what it says (a C15 ACT heading with Liked, Learned, Lacked, Longed For), not by a file name. RED on `main`: closed, no retrospective follows. GREEN once C15's ACT is on `main`, checked in a throwaway repository. It is a `.red.mjs`, so no job runs it.

## Where the expectation is stated

In prose, in `strategy.md` and `branching.md`, and as the aim of Pull Promotion, which names the collectors that have fulfilled their PDCA. No Requirement or Intent of Release states it as a rule of a promotion: `release/I39` and `release/F15` say when a promotion is raised and what its body holds, not what a promotion may carry. The plan requirement pull/F22 says it per Change, and Pull Promotion judges a collector from its files and is not consulted by the promotion. Whether to state the rule is Release's, and is not part of this Defect.

## Not claimed

How the ACT lands is the fix, a Change, not this Defect. branching.md already names the way: rebase the ACT onto the re-established collector and retarget it, and not merge #1631 as it stands (it carries the old collector history). That GitHub retargets an open pull request to `main` when its base is deleted is documented, not a Defect. Whether the promotion should have waited for #1631 is Release's to judge: Pull Promotion judges a collector from its files and cannot see an open pull request. Where the correction belongs is Architecture's.

## Follow-up

T30 finds C15's retrospective by its content (a C15 ACT heading and the four 4L section names). That is a stand-in. Retro models `retro -reflects-> Change`, found through `reflects` whatever the heading, file name or format. When the Retro Skill contract is ready, T30 takes the retrospective of C15 through `reflects` and Architecture keeps no reading of ACT coverage of its own. The C15 completion proof (Cases T14 to T22 closed, an ACT that follows) and the scope of this Defect stay as they are. Not blocking (CPO review on #2150).
