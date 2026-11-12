# Pull Promotion v1 command: Requirements (target)

Scoped `pull/` (ids are global). It integrates the v1 capability (`pull/C3`) with the host; the merged capability record is `pull/C1`, kept as history. It is a separate Change on its own collector and borrows neither another Change's ACT nor its completion evidence.

Three things stay apart: the **execution environment** (any runner with Node), the **authentication** (an explicit read-only credential) and the **decision authority** (the Owner authorizes promotion; the command only reports).

- **pull/F14. The command.** `run.mjs <repo> <declaration file>`, in `engineering/release-management/05-src/pull-promotion/`, gathers with a small gatherer of its own the four things the capability reads (the declared collectors the host has and their heads, the pieces landed in each with type and Change, each collector's last delivery, the declared Check checks on each head), passes them with the declaration to the capability and prints its result. It imports nothing of Show WIP, neither output nor supplier. The declaration (`declaration.json`: the collectors in their promotion order, the lifecycle types, the Check checks) is reviewed like any other PR.
- **pull/F15. Explicit credential, read-only.** The command needs Node and one credential named explicitly: a token in `GH_TOKEN` or `GITHUB_TOKEN`, or an already signed-in `gh`. It reads no other environment and fails naming the missing credential or the host it could not read. The gatherer issues only reads: its source holds no request that is not a GET, and a Case checks that.
- **pull/F20. Not a trigger.** The command is run by a person or an agent and by nothing else. No Git hook, CI workflow, scheduled job, required check, ruleset or Guard names it, and none is added.
