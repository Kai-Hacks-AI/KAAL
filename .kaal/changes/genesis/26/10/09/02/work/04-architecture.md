# Architecture — Inner Loop and HOW Escalation

## The model in one line

**The Process holds the Owner's grant and the record, and decides from the record whose turn it is. The Worker acts only on that answer. The Reviewer is an actor the Owner named. Review owns the round, Intent owns the subject.**

```
 Owner ──grant (Worker, Reviewer, budget, words)──▶ ┌──────────── loop record ────────────┐
                                                    │ grant.md                            │
 Worker ──submit subject──▶ 01-subject.md           │ 01-subject.md  02-round.md  …       │
        ◀─────── state ◀── derived every time ◀─────│ NN-how.md (human direction)         │
 Reviewer (Codex, on the PR) ─report─▶ Worker ─relay─▶ 02-round.md (Review's form)        │
                                                    └─────────────────────────────────────┘
 state ∈ { DESCRIBE · REVIEW · REVISE · AGREED · STOPPED · HOW(reason) }
 HOW(reason) ──▶ human ──direct (continue | stop)──▶ NN-how.md ──▶ REVIEW/REVISE (new window) or STOPPED
```

Intent and Review are untouched and unaware. The Process is the only place that names both (#73: "Process owns the relationships").

## 1. The record

Anywhere the caller names (`<loop>`); the Process does not decide where a loop lives (Q4).

```
<loop>/grant.md          the Owner's grant
<loop>/log/01-subject.md the subject as the Worker put it forward (a whole Intent file, byte for byte)
<loop>/log/02-round.md   Review's round about 01 (Actor: first line of the Reviewer part)
<loop>/log/03-subject.md the revision
<loop>/log/04-how.md     a human direction
```

One gapless sequence in `log/`, so order is explicit. A subject's identity is the SHA-256 of its bytes (`intent.mjs identity`). Nothing records a status.

`grant.md`: lines `Worker:`, `Reviewer:`, `Rounds:` (a positive integer: the review rounds the Worker may run toward agreement before HOW), `Subject: Intent`, then `## Words` and the Owner's own words. `begin <loop> --worker --reviewer --rounds --words` creates it, as `next-change` creates a Change; the Owner may write it by hand.

`NN-how.md`: lines `Reason:` (a code), `Direction: continue|stop`, `Rounds:` (continue only), then `## Words`, the human's words verbatim.

## 2. State, derived by replaying the log

Replay in order, keeping a *window* (opened at the start and at each `continue`): the identities seen, the count of findings rounds, the latest subject and latest round. The first event that satisfies a condition fixes HOW(reason); events after it other than the answering direction are reported as ignored.

| Event | Condition (first match) | Reason | Plain statement |
|---|---|---|---|
| (start) | grant missing, unreadable or invalid | `grant` | no authority has been given |
| any | out of turn (subject after subject, round before a subject, round after round), a gap, a name not in the form, a subject that is not an Intent | `evidence` | the record is not a loop |
| round | names an identity that is not the latest subject's *now* (bytes changed or other subject) | `evidence` | the round is not about what is there |
| round | `Actor:` missing, ≠ grant Reviewer, or = grant Worker | `seat` | the report is not the Reviewer's |
| round | the other result already recorded for this identity in the window | `contradiction` | the Reviewer's record disagrees with itself |
| round | `findings` and findings rounds in window = `Rounds` | `ceiling` | the granted budget is spent without agreement |
| subject | identity = the previous subject's | `unrevised` | review asked again with nothing changed |
| subject | identity seen earlier in the window, not the previous one | `oscillation` | an earlier state came back |
| round | `converged`, none of the above | — | **AGREED** |

States: no events → `DESCRIBE`; last is a subject → `REVIEW`; last is a `findings` round → `REVISE`; `converged` → `AGREED`; `stop` → `STOPPED`. Exit codes of `state`: 0 when the Worker may act as `next:` says or the loop has ended; 3 when HOW is required; 2 usage.

Why these and not a count: each is a *defect in the evidence* (a gap, a forged seat, a self-contradiction) or a *shape of identities* (same, back, spent). None needs the meaning of a finding. `02-investigation.md` §3.5 applies the identity conditions to history: the 07/07 record contains a `contradiction`, and the four Review-form Changes since (findings, then converged, on distinct identities) trip none of them. (They predate the grant and `Actor:` line, so `seat` could not apply to them.)

## 3. Agreement, and what stays outside it

AGREED is a derived state, not an artifact, and not an approval. It says: *the Reviewer the Owner named reported `converged` on exactly these bytes, and the Worker has not changed them since.* It does not establish the Intent: that remains the Owner's (`kaal-intent` step 5), and an agreed draft is the thing the Owner is then asked to establish.

The Worker's concurrence is its having put the subject forward and not left it contested; a Worker that disagrees with a finding can only repeat the subject, which is `unrevised`, which is HOW. The Worker does not escalate and does not conclude; it does what `state` says. (Q6 asks whether disagreement should be its own record.)

## 4. The host edge: from a bot's review to a round

Review rounds are files. Codex posts a PR review. Something must carry one into the other, and KAAL "knows nothing of any host".

The Process puts this in the Worker's hands as **transcription under a fixed rule, never a judgment**: the Worker records a round with `relay --result findings|converged --actor <bot login> --saw <file> --source <text> [--findings @file]`, where

- `Result` is `findings` iff the Reviewer posted inline comments or a review body on the commit; `converged` iff the Reviewer posted a comment beginning `No findings` (or, per Codex's published behaviour, reacted 👍 to the request); nothing yet means no round, wait;
- `Actor` is the bot's login, copied;
- `--source` is the host's provenance (review id or comment id, and the commit it names), copied;
- `--saw` is a file holding the subject as that commit has it (`git show <commit>:<path>`), and `relay` refuses unless its identity is the current subject's. **A stale review cannot be recorded against a newer draft.**

The Findings part is the bot's text verbatim. The script writes the statement of authority in plain words: the report is the named Reviewer's, the Worker recorded it and decided nothing in it.

This is the one place a human (or Owner inspection) is the check: whether the recorded `Result` matches what the bot posted is verifiable against the review id and cannot be proved by a script. It is the same residual limit Review states. Alternatives are in Q1.

## 5. The request

`request <loop>` (only while `state` is `REVIEW`) prints the text the Worker posts as a PR comment:

```
@codex review

Targeted review: Intent adequacy. Examine only this file.
Subject:  <path in the loop>  (SHA-256 <identity>)
Standard: the Way of Working of kaal-intent, <path> (SHA-256 <identity of SKILL.md>)
Examine:  does it say what is wanted and why, with outcomes and boundaries, in the
          Owner's terms; does it stay out of Requirements, Architecture and
          implementation; is it short enough for the Owner to hold; is every
          boundary the Owner's.
Report:   one comment per finding, citing the line. If there is nothing to resolve,
          comment "No findings" (do not only react).
```

Subject, standard and expected examination are exactly the three things the brief asks the instructions to identify. The standard is pinned by bytes so a later reader knows what the review was asked to examine against.

## 6. HOW

`state` at exit 3 prints a brief a human or an assisting Agent can read without the Worker: reason code and statement, the subject path and identity, one line per event (position, kind, result, actor, identity), the Reviewer's findings paths, and the command that records a direction. The Worker posts that on the PR ("communication over PRs").

`direct <loop> --reason <code> --direction continue|stop [--rounds n] --words <text|@file>` refuses unless `<code>` is the reason in force. `continue` opens a window: identities forgotten, count zero, budget `n`. Human participation is the defining distinction; Agents may help the human write the words. The script cannot tell who ran it. That is stated, not enforced: a direction is the human's by the same rule as `retro-owner.md` (their text, carried).

## 7. Package and Node

- `packages/kaal-process-agree/`: sealed Node `Agreement` (typed by `Skill`; leads with *Composes:* `Intent` and `Review`, each `{name, id}`; boundary; says what the Process owns and what it does not), Agent Skill `kaal-process-agree` (`compatibility: … kaal-intent and kaal-review installed beside this one`), one script `agree.mjs` with `begin`, `state`, `request`, `submit`, `relay`, `direct`, and `payload()` as the others.
- `engineering/kaal-process-agree/`: acceptance as the other optional Skills (delivery, host, consumption, scripts) plus the loop scenarios of R26.
- `agree.mjs` reads Review through `../kaal-review/scripts/review.mjs` (`parse`, `render`) and Intent through `../kaal-intent/scripts/intent.mjs` (`problem`, `identity`): the installed layout puts Skills side by side, the same layout `kaal-changing` relies on for `kaal-sealing`. No second parser, no copy.
- The Node is sealed by `seal-kaal-bootstrap` in this Change, like the Nodes of #67 and #68. The Work is not sealed, nor is the Change closed, without Kai's go.

## 8. What is deliberately not here

No fixed sequence for other Skills, no engine, no D2, no subject registry, no GitHub client, no Reviewer selection, no timers (a missing review is not an escalation: the Process has no clock), no reading of findings, no approval or verdict artifact, no status file, no change to Changing/Core/`.github`. A Reviewer that never answers leaves the state at `REVIEW` and the Worker with nothing to do; time-outs belong to the host.

## 9. Reuse beyond Intent

The table in §2 and the record are subject-agnostic. A second pair (say Requirements ↔ Review) adds one entry to the subject table in `agree.mjs` (its check and the pin of its Node) and a lens line in the request; nothing else moves, and no Skill learns of another. It would be its own Change. This is the honest cost of "no registry": one line in one place, in the Process.

## Open forks (answer by number; recommendation first)

1. **Who carries a bot's review into a round?** *Recommend the Worker transcribes under the fixed rule of §4, with the stale-review check.* Alternatives: the Reviewer pushes `NN-round.md` itself (what Kai's Codex session did for #73; cannot be asked of `@codex review` on the PR), or a later `.github` job relays bot reviews (must travel alone, and is the stronger answer long term).
2. **Is the budget required in the grant?** *Recommend yes, `Rounds` is required,* so the Owner always states how much autonomy is given; it is one of seven conditions, not the criterion. Without it, byte-changing thrash is unbounded.
3. **Name.** *Recommend `kaal-process-agree` / Node `Agreement`.* Alternative `kaal-process-loop`. "Describe Intent" is the first use, not the name.
4. **Where does a loop live?** *Recommend nowhere in particular:* location-free, beside the draft Intent. Not inside a Change's `work/` (it would be sealed with the Work), and not in `.kaal`. 08/03's rule: the engine's location must not decide the Work's.
5. **Does AGREED close anything?** *Recommend no.* It tells the Worker to stop revising and the Owner what is ready to establish.
6. **Should Worker disagreement be its own record?** *Recommend not in 0.0.1;* repeating the subject already escalates, and the Worker's reasons go to the PR as ordinary comments.
7. **The Reviewer for this Change.** The seat is Kai's to assign. I will not fill it and will not count `@codex review` runs on this PR as ROWING rounds; they are information (Worker-side probes) unless Kai assigns Codex under his grant.
