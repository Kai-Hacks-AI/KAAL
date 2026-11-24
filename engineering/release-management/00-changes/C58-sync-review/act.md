# C58 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

Reading the C57 PLAN and DO before writing mine: it showed the shape of a PLAN (drafts in `interface.md`, Cases that compare files to their drafts) and saved me from inventing one. Writing the implementation in a scratch tree to see that every Case could pass, then deleting it, kept the PLAN honest. Real Git in T758 and T759 found two mistakes in my own Cases before anyone else did. Switching off the new checks and watching T759 fail told me the regression Case could fail at all.

## Learned

A verdict carried from one job to another goes stale. The CPO's second point was right: a head can stay while the base or main moves, so the approval has to rest on facts read again just before it acts, and both the approving and the reviewing job now do. A quiet log line is not an escalation: when no eligible reviewer exists the run has to be red and say what to do. CodeQL flagged the pattern I used to remove HTML comments from the Reason twice, with two different reasons; scanning for the markers by hand ended it, and I should have started there, since the text is only checked for being empty. The first Branching run on a new pull request fails until auto-merge is on, and enabling it clears it. I copied a session id from another thread's commit into my first trailer and had to rewrite that commit before any pull request existed.

## Lacked

A way to read the live rulesets from here: whether the old integration ruleset requires a review, and a Code Owner review, of `kaal/**` is still unconfirmed, and it decides whether a bot approval can count at all. A run against real GitHub: the adapter was checked against a stand-in `gh` and real Git, not against the API. A way to ask the author's own login for a review: my pull requests open under the Owner's login, so the request failed and I could not exercise the escalation path live.

## Longed For

Real SYNCs read in dry run beside the CPO's own approvals before anything is switched on, which is the evidence this Change was built to produce. The queue-only promotion setup, which would remove most SYNCs that exist only to make a promotion fresh and leave `approve Sync` for the rest. A list of the repository variables a source needs, so that `KAAL_SYNC_APPROVE` and `KAAL_SYNC_REVIEWER` are set by one decision and not found in a workflow file.

## Left for the Owner

The WIRE that installs the workflow, the repository setting that lets Actions approve a pull request, the Code Owner question above, a person for `KAAL_SYNC_REVIEWER` if CODEOWNERS names only the author, and `KAAL_SYNC_APPROVE=on`.
