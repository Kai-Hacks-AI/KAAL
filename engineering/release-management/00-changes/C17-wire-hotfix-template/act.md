# C17 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The wiring shrank to one claim, that the installed bytes equal the draft, and T181 says it and breaks when a single line is appended. Following the pattern of release/C16, the `.github` part and the engineering part travelled in two collectors, and Change Isolation never objected. Carrying the installed file into the engineering collector as its own `.github`-only pull request let the nine transferred Cases and T181 run as active, green Cases before any promotion.

## Learned

The CPO's decisions shaped the order: qualification is completed in the collector and the CHECK runs against its effective target state; no installed template is promoted with inactive Target Cases; the Owner's lane decision put release/C24 first so the envelope check accepts the cue before `hotfix.md` carries it. A sync belongs right before a collector's own promotion once the previous one has landed. I made one wrong parallel sync early and closed it. A Case that reads a file outside its collector is RED until that file is present, so the Case and the file must travel together or the Case stays a `.red.mjs`.

## Lacked

A statement in the PLAN of a wiring Change of when its CHECK runs and against which state, and of how Cases that read a `.github` file are activated while Change Isolation keeps `.github` apart. A CI check over two collectors at once, so the CHECK is a manual `run()` recorded in `evidence.md`.

## Longed For

A CHECK that judges the effective target state of a pair of collectors without a hand-made tree. A promotion order for wiring Changes written down before the first PLAN, so that I ask which Change goes first instead of discovering it from a hold.
