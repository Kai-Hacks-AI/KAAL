# Evidence

Every stage of a throwaway KAAL directory, walked with the repository's `state` command after the change (the script is not part of the Change; the output is what an agent sees):

```
--- work open, no round
WORK OPEN
next: the Worker completes the work, then it is reviewed: the Reviewer writes review/01.md naming work <id>
work: <id>
(exit 0)
--- round 01 findings
WORK OPEN
next: the Worker resolves the findings of review/01.md in work/, then it is reviewed again: the Reviewer writes review/02.md
work: <id>
(exit 0)
--- work changed after the round (stale)
WORK OPEN
next: the work changed since review/01.md: it is reviewed again, the Reviewer writes review/02.md naming work <id>
work: <id>
(exit 0)
--- converged on current work
REVIEW CONVERGED
next: the Worker seals work
work: <id>
(exit 0)
--- work sealed
WORK SEALED
next: the Worker writes retro-work.md (the Work's seat), first
work: <id>
(exit 0)
--- retro-owner before retro-work (out of order)
WORK SEALED
next: the Worker writes retro-work.md (the Work's seat), first
work: <id>
problem: retro-owner.md exists before retro-work.md: the retrospectives follow the order retro-work.md, retro-owner.md, retro-review.md
(exit 1)
--- retro-work present
RETRO-WORK PRESENT
next: the Owner judges the sealed Work against the Intent, a judgment that is no artifact, then writes retro-owner.md (the Owner's seat)
work: <id>
(exit 0)
--- retro-owner present
RETRO-OWNER PRESENT
next: the Reviewer writes retro-review.md (the review's seat), last, with the Worker's and the Owner's retrospectives to hand
work: <id>
(exit 0)
--- all retros present
RETROS PRESENT
next: the Reviewer seals Change
work: <id>
(exit 0)
--- closed
CHANGE CLOSED
next: none
(exit 0)
--- closed Change mutated
WORK OPEN
next: restore the altered or removed sealed record, as it was sealed; nothing else is valid until then
work: <id>
problem: seals/changes/<id> matches no Change: a sealed Change was altered or removed
problem: seals/trees/<id> matches no work/: sealed work was altered or removed
problem: retro-work.md exists before the Work is sealed, so it is not a valid step
problem: retro-review.md exists before the Work is sealed, so it is not a valid step
problem: retro-owner.md exists before the Work is sealed, so it is not a valid step
(exit 1)
```

Acceptance: `npm test --prefix engineering/change-seal` passes (64 tests), including the new assertion that every tampering mutation of sealed Work reports `next: restore the altered or removed sealed record`.

Review round 02 found that deleting a whole sealed Change made `state` throw instead of instructing restoration. Reproduced and fixed: acceptance case "a sealed Change removed whole is a sealed record removed" asserts `CHANGE MISSING`, the restore `next`, the `seals/changes/<id> matches no Change` problem and exit 1, and that an address nothing sealed in a clean KAAL is still an error. `npm test --prefix engineering/change-seal` passes (65).
