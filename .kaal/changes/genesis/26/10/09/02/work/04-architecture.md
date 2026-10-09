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
 state ∈ { DESCRIBE · REVIEW · REVISE · REPORTED · AGREED · STOPPED · HOW(reason) }
 REPORTED = the Reviewer's convergence as the Worker recorded it.  AGREED = REPORTED, and the host's records (fetched by
 someone outside the Worker's control) show who made the grant, every direction and every counted report.
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
| subject | identity = the previous subject's, and some finding of the latest round is neither challenged nor deferred | `unrevised` | review asked again with nothing changed |
| round | the Reviewer reports findings on the unchanged identity the Worker re-asked after challenging or deferring every finding | `disputed` | the Worker's position is not accepted: a human decides scope |
| subject | identity seen earlier in the window, not the previous one | `oscillation` | an earlier state came back |
| round | `converged`, none of the above | — | **REPORTED**; **AGREED** only with the host's records (§4a) |
| (host records supplied) | grant, a direction or a counted report is not shown at the host as made by the Owner / the granted Reviewer, of that commit, implying that result | `provenance` | the host does not bear out what the record says |

`contradiction` is reachable only after a human continued an `unrevised` or `oscillation` (the same bytes asked again, then reported differently); the human who answers it settles it for that identity. It also covers a Reviewer that changes its mind on identical bytes.

A direction does not answer `grant` or structural `evidence` (the record is not yet a record): the Owner writes a valid grant, or the log is restored; a human can end such a loop with `stop`, recorded in `stop.md` beside the grant so the log is not touched. A Worker event after HOW is ignored, and a later answering direction is still found.

States: no events → `DESCRIBE`; last is a subject → `REVIEW`; last is a `findings` round → `REVISE`; `converged` → `REPORTED` (`AGREED` with host records); `stop` → `STOPPED`. Exit codes of `state`: 0 when the Worker may act as `next:` says or the loop has ended; 3 when HOW is required; 2 usage.

Why these and not a count: each is a *defect in the evidence* (a gap, a forged seat, a self-contradiction) or a *shape of identities* (same, back, spent). None needs the meaning of a finding. `02-investigation.md` §3.5 applies the identity conditions to history: the 07/07 record contains a `contradiction`, and the four Review-form Changes since (findings, then converged, on distinct identities) trip none of them. (They predate the grant and `Actor:` line, so `seat` could not apply to them.)

## 3. Agreement, and what stays outside it

AGREED is a derived state, not an artifact, and not an approval. It says: *the host's records show that the Reviewer the Owner named reported `converged` on exactly these bytes, under a grant and directions the Owner authored, and the Worker has not changed them since.* Without the host's records the state is REPORTED, which the Worker treats the same way (stop revising) and nobody treats as agreement. It does not establish the Intent: that remains the Owner's (`kaal-intent` step 5), and an agreed draft is the thing the Owner is then asked to establish.

The Worker's concurrence is its having put the subject forward and not left it contested; a Worker that disagrees with a finding does not settle it: it answers it (challenge or defer, §6a), and the Reviewer or the human decides. Repeating the subject with no answer is `unrevised`, which is HOW; repeating it after every finding was challenged or deferred is a request to reconsider, and a Reviewer who holds the finding sends it to HOW(`disputed`). The Worker does not escalate and does not conclude; it does what `state` says.

## 4. The host edge, and what is only reported

Review rounds are files. Codex posts a PR review, comment or reaction. KAAL "knows nothing of any host". The Worker carries a report into a round by **transcription under a fixed rule**: `relay --result findings|converged --actor <bot login> --saw <file> --source-kind review|comment|reaction --source-id <id> --commit <sha> [--findings @file]`, with `Result` `findings` iff the Reviewer posted a review on the commit, `converged` iff it commented `No findings` (or reacted 👍), nothing yet meaning no round; the Findings are the bot's text verbatim; and `--saw` must have the current subject's identity or `relay` refuses (a stale review cannot be recorded against a newer draft).

**All of that is *reported* evidence.** The Worker supplies the result, the actor and the source, so the byte check proves freshness and nothing else. A Worker-written record therefore cannot, by itself, reach AGREED.

## 4a. Verified evidence, the trust boundary, and its limits

`state <loop> --host <records.json> --owner <login>` checks the record against the host's own records. The records are an array the verifier fetched (it is a plain JSON file; this Process fetches nothing):

```
{"kind":"review","id":"5470597438","login":"chatgpt-codex-connector[bot]","commit":"846a90d7…"}
{"kind":"comment","id":"…","login":"chatgpt-codex-connector[bot]","commit":"<head the comment covers>","body":"No findings"}
{"kind":"reaction","id":"<comment id>","login":"…","commit":"<head the reaction covers>","content":"+1"}
{"kind":"file","path":"log/03-subject.md","commit":"<that commit>","sha256":"<identity of the file at that commit>"}
{"kind":"authored","path":"grant.md","sha256":"<identity of the file>","login":"<Owner>"}
{"kind":"authored","path":"log/05-how.md","sha256":"…","login":"<Owner>"}
{"kind":"authored","path":"stop.md","sha256":"…","login":"<Owner>"}
```

**The source is bound to the bytes (round 02, finding 1).** The comment or reaction record says which commit it covers (a review already does), and a `file` record says what the round's subject was at that commit. A counted round is verified only when both exist and the file's SHA-256 is the identity the round names. A genuine all-clear about subject A, relayed against subject B, therefore fails: the host shows B absent or different at the covered commit. A source without a covered commit fails closed.

Refusals, each shown by a test: no host record for the named source; made by someone other than the granted Reviewer; of another commit; implying the other result (a review where the round says converged; a comment that does not begin `No findings`); a grant or a direction whose bytes the host does not show authored by `--owner`; a grant the Worker authored. All give HOW(`provenance`) with the detail. HOW(`provenance`) is answered like `grant` and `evidence`: not by a continuing direction. The record is put right (the host's records are corrected, or the Owner writes the record), or a human ends the loop with `direct … --host <records.json> --owner <login> --reason provenance --direction stop`, which sees the same evidence that fired the reason and writes `stop.md`.

**A human stop is terminal and durable.** `stop.md` (beside the grant, outside the log) is read first, every time. Once it is there, repairing the log or writing the missing grant does not reopen the loop. In verified state `stop.md` must be shown authored by the Owner, or the state is HOW(`provenance`) until it is. `--owner` is given by the verifier, never read from the grant, so a Worker cannot name itself Owner.

**The boundary, named:** the host's records, in the hands of a party the Worker does not control. For this repository that is a CI job with the repository token running `state --host`, or the Owner (or an agent they use) running it. **The limit:** if the Worker also supplies the host records, a malicious Worker can forge them; the check then catches mistranscription, not malice. The Process does not and cannot fetch for itself without becoming a GitHub client. A `.github` control that fetches the records and runs the check is the stronger answer and is a separate Change (it travels alone).

What the Worker can still do alone, and the bound on it: a Worker can write a grant or a continuation of its own. The Worker-side `state` will then move (it cannot tell who ran the command), the loop can iterate, and the result is at most REPORTED. The verified run refuses the grant and every direction the Owner did not author (`provenance`), so that Worker-made authority never produces AGREED and is visible to the Owner as the reason. That is the claimed trust model: **the Process bounds what the Worker may do through its commands and makes every claim checkable; it does not make a claim true.**

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

`direct <loop> --reason <code> --direction continue|stop [--rounds n] --words <text|@file>` refuses unless `<code>` is the reason in force. A human direction is the human's by the host: the verified run shows that the Owner authored the file (§4a). `continue` opens a window: identities forgotten, count zero, budget `n`. Human participation is the defining distinction; Agents may help the human write the words. The script cannot tell who ran it; §4a is what makes the direction's authorship checkable.

## 6a. Findings are not orders (Owner's review of 2026-10-09)

**Question and answer in short.** The Reviewer's findings are information to the Worker, not instructions; a valid finding can be outside the governing words; neither may be erased. The smallest mechanism is one new event kind and one new HOW reason; no registry, no new Node.

- **Event `NN-answer.md`**, written by `agree.mjs answer`: the round it answers (name plus its SHA-256), the finding number, a disposition, a ground and, for `defer`, a carrier (path plus SHA-256). Findings are numbered items (`1. …`) because `relay` now requires that structure; a legacy round with no numbered item is one finding. Only structure is read, never meaning.
- **Dispositions.** `accept` (also implied for an unanswered finding when the subject changes); `challenge` (the Worker holds it invalid or met); `defer` (valid, out of this Work: do not implement; carried forward in an existing mechanism, typically a `kaal-request`/`kaal-incident` carrier, otherwise the project's own backlog).
- **The ground** must be a verbatim quotation (at least 8 characters) of the current subject or of the Owner's `Words` in the grant. That makes the position traceable to the governing words and checkable by a reader; it does not make it correct. Nothing reads the Worker's `--words`.
- **Reconsideration.** If every finding of the latest round is challenged or deferred, the same bytes may be put forward again: it is not `unrevised`. `request` then hands the Reviewer the Worker's answers, labelled as a position and not an instruction, and says the Owner decides scope. The Reviewer then either converges (it accepts the position; the record says so by outcome and identity) or reports findings again.
- **Disagreement and escalation.** Findings again on those unchanged bytes is HOW(`disputed`): the Process requires a human, `continue` with a new budget or `stop`. Disagreement through changed bytes is bounded by the ceiling, and oscillation and stagnation fire as before. Scope is thus decided by the Owner (or never), not by either Agent.
- **Preservation.** Immutable round files (any change after an answer pinned its digest is `evidence`), the gapless log, and a `finding` line per finding in every brief, in every state. Verified state also requires the host's finding count for a review to equal the round's.
- **Not done.** The Worker's transcription of a finding's text is not compared with the host's text (only the count is); the Process cannot tell whether a carrier is a good one, only that it exists and what its bytes were.

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

1. **Who carries a bot's review into a round, and who verifies it?** *Recommend the Worker transcribes under the fixed rule of §4 (reported), and a verifier outside the Worker's control runs `state --host` (§4a) before anything is called AGREED; a `.github` control that does it in CI is the follow-on.* Alternatives: the Reviewer pushes `NN-round.md` itself (what Kai's Codex session did for #73; cannot be asked of `@codex review` on the PR), or a later `.github` job relays bot reviews (must travel alone, and is the stronger answer long term).
2. **Is the budget required in the grant?** *Recommend yes, `Rounds` is required,* so the Owner always states how much autonomy is given; it is one of seven conditions, not the criterion. Without it, byte-changing thrash is unbounded.
3. **Name.** *Recommend `kaal-process-agree` / Node `Agreement`.* Alternative `kaal-process-loop`. "Describe Intent" is the first use, not the name.
4. **Where does a loop live?** *Recommend nowhere in particular:* location-free, beside the draft Intent. Not inside a Change's `work/` (it would be sealed with the Work), and not in `.kaal`. 08/03's rule: the engine's location must not decide the Work's.
5. **Does AGREED close anything?** *Recommend no.* It tells the Worker to stop revising and the Owner what is ready to establish.
6. **Should Worker disagreement be its own record?** *Revised by the Owner's review of 2026-10-09:* yes, the smallest one: the `answer` event (§6a), because findings are not orders and none may be erased. Disagreement still never settles anything by itself.
7. **The Reviewer for this Change.** The seat is Kai's to assign. I will not fill it and will not count `@codex review` runs on this PR as ROWING rounds; they are information (Worker-side probes) unless Kai assigns Codex under his grant.
