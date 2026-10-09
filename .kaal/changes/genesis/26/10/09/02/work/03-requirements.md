# Requirements — Inner Loop and HOW Escalation

Each requirement is checkable. "Process" means the specialized Skill this Change realizes (candidate `kaal-process-agree`, Node `Agreement`).

## The loop

- **R1.** The Process is a specialized Skill (#73): a Node typed by the `Skill` Node, an Agent Skill, no Core change, no Process-specific type. It pins what it composes by `{name, id}` and declares its sibling prerequisites in `compatibility`.
- **R2.** The Process composes `Intent` and `Review` and changes neither. No sealed Node, Skill or script of Intent, Review, Changing, Sealing or Core is edited; neither Intent nor Review names the Process.
- **R3.** An Agent that has only the installed KAAL (`.kaal/`, host `AGENTS.md`) can find the Process by following references from Core and execute it from its `SKILL.md` and scripts, with no reconstruction by the Owner.
- **R4.** The loop is: the Worker describes or revises an Intent; submits it; requests a targeted review; records the Reviewer's report; revises or stops, as `state` says. Between the Owner's grant and the first escalation the Worker needs no human step.

## Authority

- **R5.** The authority to run the loop is an Owner's *grant* the Process reads and never writes: it names the Worker, the Reviewer and a budget of review rounds, and holds the Owner's words verbatim. With no valid grant the Process says HOW is required (`grant`).
- **R6.** Whether the Worker may continue, conclude or must escalate is answered only by `state`, a function of the record. Nothing the Worker says changes the answer except by adding evidence to the record.
- **R7.** The Process never grants. A direction that returns the loop to the Worker is a record made by the human (the script cannot see who) and is refused unless it answers the reason in force.

## Independence

- **R8.** A round counts toward agreement only if its `Actor:` equals the grant's Reviewer and differs from the grant's Worker. Otherwise HOW (`seat`). The Process never starts, selects or assigns a reviewer.
- **R9.** A round is Review's form (`# Review`, `Intent: <identity>`, `Result:`, `## Reviewer`, `## Findings`), parsed by Review's own parser. The Process adds one convention inside the Reviewer part (its first line is `Actor: <id>`), which Review treats as free text.
- **R10.** A report is recorded only against a subject the Reviewer saw: the recording checks that the bytes the Reviewer saw have the identity of the current subject, and refuses otherwise. It also records where the host holds the report as a structured source (`kind id commit`), so that it can be checked there (R29).

## Evidence and state

- **R11.** The record is a directory of files, numbered without a gap in one sequence of two or more digits (`NN-subject.md`, `NN-round.md`, `NN-how.md`; no limit of 99) beside the grant. A grant with no log yet is an empty loop. State is derived from it each time; no status is written.
- **R12.** Reported convergence is: the latest event is a round attributed to the granted Reviewer that says `converged` and names the identity of the latest subject, recomputed from that subject's bytes now, with no HOW condition. The state for it is `REPORTED`. It becomes `AGREED` only when the host's records, supplied to `state` by someone outside the Worker's control, show the grant and every direction authored by the Owner and every counted report made by the granted Reviewer (R28 to R32). Nothing else is agreement.
- **R13.** The Process reads from a round only `Result:`, the subject name and identity, its position, and the `Actor:` line (for equality). It never branches on the Reviewer statement or the Findings beyond that line.
- **R14.** Escalation conditions are a closed list, each with a stable code, a plain statement and the evidence it rests on: `grant`, `seat`, `evidence`, `contradiction`, `unrevised`, `oscillation`, `ceiling`, `provenance`. A fixed round count is one of them and never the only one. `contradiction` (the Reviewer reports differently about identical bytes) is reachable only after a human continued an `unrevised` or `oscillation`; the human who answers it settles it for that identity.
- **R15.** Progress, stagnation and oscillation are defined only on subject identities and order (investigation §2 Q3).
- **R16.** The record takes what the Worker does, including a repeated or reverted subject, so that the escalation is derivable from the artifacts. `submit` and `relay` append only while the loop is waiting for exactly that act; once the state is HOW, AGREED or STOPPED they refuse and write nothing.
- **R17.** A hand-edited record is detected where it breaks the derivation (gap, out-of-turn event, round naming an identity no subject now has, subject that is not an Intent); the Process says `evidence` and requires HOW. It is not claimed to detect a consistent forgery (investigation §3.3).

## HOW

- **R18.** When HOW is required, the Process prints the reason, the unresolved subject and its identity, every round (position, result, actor, identity) and the direction wanted, enough for a human or an assisting Agent to act without the Worker's account.
- **R19.** Human direction is a record naming the reason it answers, `continue` or `stop`, the human's words, and for `continue` a new budget. `continue` opens a new window (criteria are evaluated on events after it, identities seen before are forgotten); `stop` ends the loop with no agreement claimed.
- **R20.** After HOW is required, further Worker events are not counted: they are reported as ignored, and a later direction that answers the reason is still found and applied.
- **R20a.** `grant` and structural `evidence` cannot be continued by a direction, because the record is not yet a record: the brief says what to repair (the Owner writes a valid grant; the log is restored to a gapless sequence), and a human can still end the loop with a `stop` recorded in `stop.md` beside the grant, which leaves the log untouched.

## Request

- **R21.** The Process produces the targeted review request: it names the subject (path and identity), the standard (the Way of Working of `kaal-intent`, pinned by the bytes of its `SKILL.md`), and the expected examination (the #73 lens "Intent adequacy"), and starts with `@codex review`. The Worker posts it; the Process does not touch GitHub.
- **R22.** The request asks for each finding as its own comment and for an explicit `No findings` comment when there are none, so that an absent answer is not read as agreement.

## Scope and reuse

- **R23.** 0.0.1 realizes only Describe Intent ↔ Review Intent. The subject kind is one entry (`Intent`: its check and its identity are `kaal-intent`'s). Another subject kind is a later Change that adds an entry and pins its Node. No registry, no engine, no D2.
- **R24.** The loop's states, conditions and record do not mention Intent except in that one entry and in the request text, so the pattern is reusable for another Work ↔ Review pair without any Skill naming another.
- **R25.** Core, `.github`, Changing, Sealing, Intent, Review and the installer are untouched. The Process is optional and never installed by default; it is selected by exact Node ID like the other optional Skills.

## Demonstration

- **R26.** Acceptance shows, with a throwaway KAAL and a scripted Reviewer, the three outcomes of the brief: autonomous convergence (round 1 converged); continued autonomous iteration (findings, revision, then converged); escalation to HOW on an established criterion, then return to the loop by direction. It also shows each other criterion firing, the grant gate, refusals that write nothing, and a replay of the 07/07 shape.
- **R27.** The claim that the loop works with a real independent Reviewer rests on a *completed* live round: a request the Process generated, posted on this PR, an answer by the Reviewer that the Worker records through `relay`, and the host's record of that answer checked by `state --host`. Until the evidence holds that, the PR says the claim is not demonstrated. A bot message that asks for an environment, or no answer, is not a result. The live round is not evidence for the three outcomes (the Reviewer's answer cannot be forced to escalate); the scripted Reviewer is.

## Trust: reported is not verified (added after the Owner's review of the first design)

- **R28.** The Process distinguishes what a record *reports* from what the host *verifies*. A record the Worker can write (a round, a grant, a direction) can only be reported. `state` without host records never says `AGREED`; the most it says is `REPORTED`, and says so (`provenance: reported, not verified`).
- **R29.** `state --host <records.json> --owner <login>` verifies against records of the host that the verifier fetched: each counted round has a host record of the kind and id it names, made by the granted Reviewer, of the commit it names, whose kind implies the round's result (a review implies findings; a comment beginning `No findings`, or a 👍 reaction, implies converged). A round the host does not show, shows made by someone else, of another commit, or implying the other result, makes the state HOW (`provenance`). A forged or altered report is refused this way.
- **R30.** `grant.md` and every applied direction are verified as authored by `--owner`, by identity of their bytes. The Owner's login is given by the verifier, never read from the grant, so a Worker cannot name itself Owner. A grant or direction the host does not show as the Owner's makes the state HOW (`provenance`), however well formed.
- **R31.** The trust boundary is named: **the host's records, supplied by someone the Worker does not control** (a CI job with the repository token, or the Owner or an assisting agent of the Owner's). Without that party the Process still bounds what the Worker may do through its commands, but a malicious Worker can write consistent files; the Worker-side `state` is then advisory and the outcome cannot become `AGREED`. The Process does not fetch from any host and does not claim to guarantee provenance by itself.
- **R33.** Verification binds each counted report to the subject's bytes: the host says which commit the source covers and what the subject file was at that commit; a report whose source covers other bytes, or says nothing about the commit, is `provenance`.
- **R34.** HOW(`provenance`) is answered by the evidence that fired it: a human stop (`direct --host … --owner …`), or a repaired record. A direction cannot continue it.
- **R35.** A human stop (`stop.md`) is terminal and durable across repair of the record, and in verified state must be shown authored by the Owner.
- **R32.** A Worker that forges its own budget (a self-authored grant, a continuation it wrote) gets only a Worker-side continuation that the verification refuses; it never obtains `AGREED`. Establishing the Intent stays the Owner's and is not what `AGREED` means.
