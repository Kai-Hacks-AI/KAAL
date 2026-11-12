# Coordination: Requirements (target)

Scoped `coordination/`. F are functional, N nonfunctional.

- **coordination/F1. One script in the Skill.** `skills/kaal-release/scripts/` holds one script that prints what to do next. It is read-only: it reads two files and prints; it opens no network connection, runs no git or host command and writes nothing.
- **coordination/F2. Facts input.** A JSON file with: the target branch head; each collector (`name`, `head`, `behindTarget`); each change request (`number`, `title`, `base`, `head`, `headSha`, `state` open or merged or closed, `ci`, `behind`, `unresolvedThreads`, `review` with its state and the commit it was given at, `autoMerge`). A fact that is absent is reported, never defaulted.
- **coordination/F3. Declaration input.** A JSON file the consumer owns: which titles mean a promotion, a sync or a change; the promotion target; `policy.promotionsInFlight`; the ordered `candidates`; the `holds`; the role names for `author`, `reviewer`, `owner`. The Script names no KAAL identity.
- **coordination/F4. Output.** An ordered list. Each entry: `rank`, `rule`, `action`, `target`, `reason`, `dependency`, `authority`, `status` (ready, waiting, blocked, needs-authority) and `evidence`. A separate `notJudged` list holds everything it could not decide. The same inputs give byte-identical output.
- **coordination/F5. Actions.** OPEN PR, REVIEW PR, REVISE PR, ENABLE AUTO-MERGE, WAIT. No other. Nothing is executed.
- **coordination/F6. Rules, in order.** R1 finish the in-flight promotion pair. R2 the missing step of the declared next candidate, when the lane is free. R3 development syncs and requests that unblock development, nearest to the target first. R4 the rest. Ties by request number. The order is derived backwards from the target and printed forwards in execution order.
- **coordination/F7. The promotion lane.** Busy while a promotion request is open or a promotion sync is open. Released when the promotion request is merged. Nothing else releases it; distance from the target never does. A development sync does not occupy it.
- **coordination/F8. Authority is never converted.** Every entry names who may do it (`author`, `reviewer`, `owner`). A hold in the declaration makes the entry `needs-authority` or `blocked`. The Script cannot authorize.
- **coordination/N1. Standalone.** No runtime dependency; the Script imports nothing but built-ins.
- **coordination/N2. Generic.** The Script, its fixtures and its README contain no KAAL-specific identity (release/F5, T5).
- **coordination/N3. Honest.** The README states that the Script recommends and verifies nothing.
