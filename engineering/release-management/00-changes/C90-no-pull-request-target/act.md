# C90 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The base branch as the baseline: the ratchet needs no list kept by hand, and removing a use passes. Running the workflow's own fetch and judge steps in a scratch clone (T1126) found a real fault in the command line (an absent `--root` read the path of Node) that the module Cases had not.

## Learned

The CPO review changed the PLAN twice over the same point: how the proposed head is read. The answer is the base's own judge plus `refs/pull/<n>/head`, fork pull requests included, and a missing ref or judge is UNKNOWN, never a pass. The Case that proves a gap closed (T1125) is change-semantic and retires here; the element Cases (T1116 to T1122, T1124, T1126) stay beside I50, F67, A62 and CTL19. T1123, the target (count 0), stays `.red.mjs` beside CTL19 until the five workflows are gone.

## Lacked

A stored list of the Cases that read a Change folder, so the retirement at ACT is known before it. A live proof that the check says FAIL on a real pull request: the workflow is only a source and nothing wires it yet. A proof of UNKNOWN on a real run.

## Longed For

The WIRE that installs the workflow in the Integrating and Promoting stations, the Owner's decision to require `verify Triggers`, and the Inspector and Dispatcher driving the count from 5 to 0, where T1123 becomes GREEN and is renamed.
