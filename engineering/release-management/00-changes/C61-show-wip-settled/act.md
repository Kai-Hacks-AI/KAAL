# C61 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The report now says what it can and cannot know. An open piece is wip, a piece that merged with the branch tip as its head is delivered, and everything else is wip or UNKNOWN, never a settled verdict. The live run on the real repository found what the fixtures could not: the REST reader, the comparison direction (`ahead_by` is the branch's own commits) and the pagination of pieces. T806 pins the adapter's boundary with a fake host, so a change in the host's answer shows as a failing Case.

## Learned

A piece is a transport, not the authority over the work or its branch. My first inference read a piece closed unmerged with the branch tip as its head as discarded work, and the live sample reported 74 such branches. The CPO's correction was right: a closed piece may be superseded, moved or reorganized, so it stays UNKNOWN unless a separate, explicit decision says the work was discarded (T807). The first draft also failed the guard that keeps host words out of the Script (T36); the Script holds neutral outcomes and the reader holds the host's vocabulary. GraphQL was not available from this session, so the reader moved to REST.

## Lacked

A KAAL-owned record of what became of the work. A branch is a workspace, not a Change; it may hold several Changes and a Change spans several pieces. Without a record, every verdict is inferred from Git and the host, and a discard cannot be told from a supersession.

## Longed For

The lifecycle record itself: PLAN, DO, ACT, PROMOTION and an explicit discard outcome producing a KAAL-owned state, with Git and the host as evidence and not as the definition. That is its own Change; C61 builds no ledger.

## Follow-ups

- A later Change for the KAAL-owned lifecycle record, and for an explicit discard decision the reader can read.
- The Show WIP page (release/C64) runs the `settled` view daily; its workflow is installed only after this Change is on main.
- The by-hand report of 17 Nov counted 74 discarded branches under the first inference; under the corrected one they are UNKNOWN, and the report is to be read that way.
