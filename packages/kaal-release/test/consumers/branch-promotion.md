# Recorded decisions: a repository promoting a candidate branch into a protected default branch

Consumer: a repository with no registry and no versions. A candidate branch is promoted into the default branch, which only protected changes may reach. Recorded by following `SKILL.md` step by step.

## 1. Assess the context
Released: the content of the candidate branch. From the candidate branch to the default branch. A failure reaches every contributor at once, and it can be reversed by a new change. Decider: the repository Owner.

## 2. Choose the identity of the release
No version. The release is identified by the exact revision of the candidate branch at the time of approval.

## 3. Establish readiness
Verification evidence for that exact revision, and a validation of the result by a reviewer other than the author. The name is the revision, so there is nothing to check for reuse.

## 4. Choose the controls and the authority
Two independent controls: evidence that the change touches only what it declares, and evidence that the candidate passes its tests. The Owner approves. The author never approves the promotion.

## 5. Preserve the identity of the artifact
The artifact is the revision. The same revision that was verified is the one that moves; a rebase or an amend between verification and promotion makes the evidence void.

## 6. Promote or publish
The promotion goes through an automation identity that the repository records, so each promotion can be audited afterwards.

## 7. Verify what arrived
Compare the default branch's revision with the approved revision, and read the default branch as a contributor would. A reviewer validates the observation.

## 8. Announce
A short note to the contributors naming the revision and what it carries.

## 9. Recover
Revert the promotion with a new change, and name the earliest step at which the failure could have been found.
