# C25 ACT: retrospective (4L)

Written by the agent that carried the Change.

## Liked

- The CPO ruling on the first plan made the Change shorter and more honest: the cue is installed from an Engineering source, byte for byte, and the check of the installed bytes belongs to the WIRE, not to the collector.
- T200 compares each source with the installed file once the cue line is taken out, so the cue is the only difference and retained content is shown, not asserted.
- Moving the installed-equals-source comparison of T117 and T121 to T214 removed the transitional branch of release/C24 for good, without making the collector's Cases depend on a file that is installed later.

## Learned

- A change to the installed templates is WIRE work. I planned a direct `.github` DO, and a `.github`-only promotion cannot qualify as a KAAL PROMOTION: it has no PLAN, Case or ACT of its own. I read release/C27 only after the CPO ruled; the sequence of sources first, WIRE later should have been the plan from the start.
- Five of the six installed templates had no Engineering source on `main`. A WIRE needs a source to compare against, so the first step was to create them from today's installed files.
- A PR head that is `main` itself is not a synchronization: Branching wants a merge commit of main into the collector tip. My first SYNC was rejected for that reason and the CPO's approval was dismissed when I rebuilt it.
- The first Branching run of a new PR fails before auto-merge registers, and the runs triggered by the disable-and-enable cycle also show a failure before the passing one. The passing run is the one that counts.

## Lacked

- Pull Promotion could not be run from my container (no usable `gh` credential), so the qualification of the collector rested on files and CI instead of the tool's verdict.
- A statement of the WIRE contract before the first DO. Nobody was at fault, since release/C27 was in flight, but I lost an approved `.github` DO and promotion because of it.
- The reader trial rerun. The cue is not installed in GitHub yet, so the trial would show nothing new.

## Longed For

- A separately authorized WIRE `wire/envelope-cue` that installs the six unchanged files and runs T214 as its Verification, after release/C27 and its protection are available.
- The reader trial rerun after that WIRE, with the same two links and a pull request opened from the installed templates, recorded as validation evidence and not as an answer key.
- Only after the WIRE: removal of the retired `.github` collector `kaal/release/wire-envelope-cue`, which only Kai can delete.
