# C251 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's decision made the shape small: one exact claim per file, no blocks, no stopgap. The file name is the number, so the lane's own rule gives uniqueness and Core only judges what the lane cannot, which is whether the content used what was claimed, by whom. Change's draft was a good start, and dropping ranges removed most of its judge. T142 to T149 went from RED to GREEN without being edited in the DO.

## Learned

Two things were found in review, not in the PLAN. First, grandfathering has to be by record, not by number: an existing record below the first claimable number is legacy, but a new record below it is not, and one capability must never give one id to two distinct records. The `added` flag, and the `reused` finding, came from the CPO's hold. Second, placement is the consumer's: the first PLAN fixed a folder, contradicted itself, and the CPO and Owner moved the decision to the consumer with Core proposing only an overridable default. A row built for the chosen folder, `idClaimLane(folder?)`, replaced a constant. A Case that is added in the DO belongs in the PLAN first, and Cases reach the PLAN faster when the PLAN names every export the DO will add.

## Lacked

A way to see which hand-written file lists a new export touches. Engineering's embed acceptance hard-codes the package's file list, so the new dist files failed Acceptance after the DO was green locally, and the fix was an edit to a file Core does not own. The same happened in C162. Also lacking: a way to check across all branches that a Case id is free, which was a manual search of every remote branch.

## Longed For

A check that names the consumer lists of a package's files and exports, so a new export states what it touches before the DO, and a claim check that makes the manual branch search for a free id unnecessary. The lane stays inactive. Nothing activates until the Owner decides, and the claim folder, the first claimable numbers and the control that runs `judgeIdClaims` on a Change belong to Engineering and Change.
