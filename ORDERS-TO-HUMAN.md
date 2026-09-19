# Orders to the Human

This is not `ORDERS.md`. That file holds the orders KAAL operates under, given
by the Human. This file holds the reverse direction: things KAAL needs done that
only the Human can do, written down so they survive in a clone of `main` rather
than living in a pull request comment.

One section per order. An order stays pending until the Human establishes the
property and records that here. Writing an order does not complete it, and the
Agent must not mark one established on its own report.

Each order keeps three things apart: the **property** the Human requires, which
is what actually has to become true; the **realization** this repository
proposes, which is a judgement and may be replaced by anything that establishes
the property; and what is **deliberately excluded**, so that a later reader can
tell restraint from oversight.

---

## 1 — The producer must not be able to bypass the integration boundary

**Status: ESTABLISHED.** Confirmed by Kai (kaihacksai) on 2026-09-19, after
`5e100e5` and before PR #1 crossed into `main`. This line records the Human's
confirmation, not the Agent's own report — the Agent was told the order had been
carried out and wrote that down.

The configuration in force, as independently read by kaihacksai reviewing
`a3501c4` and recorded here so a clone does not depend on GitHub for it: ruleset
`Main`, active, targeting `refs/heads/main`, bypass list empty with
`current_user_can_bypass: never`, pull request required with one approving
review, non-fast-forward updates blocked, deletion blocked. Not required: status
checks, code-owner review, stale-review dismissal, last-push approval, thread
resolution, extra approval for unattributed changes. That matches the
realization proposed below, with nothing added.

What the Agent could independently observe, and what it could not: GitHub's
branch listing reports `main` as protected, which is a read of the hosting
service's state rather than a claim about the Agent's own work. It establishes
that protection exists. It does not show which rules are in force, so the
realization below — pull request required, one approving review, no
administrative bypass — rests on the Human's confirmation and not on anything
observed. Nothing here verifies the two assumptions in the closing paragraphs;
those remain substrate.

**Property required (Human-supplied constraint, cycle 0004).** The producer of a
change must not be able to place that change onto `main` by itself. The
observable integration boundary must be non-bypassable by the producing Agent.

**Why it exists.** Earned by behaviour on PR #1, not imported. Twice the producer
settled an underspecified semantic in the direction that let its own work close —
self-judgement became "Validated" in cycle 0001, and an Agent-added
interpretation became a claimed derivation from MOVE in cycle 0002 — and
independent review caught both. Nothing prevented that same producer from
writing to `main` directly and skipping the review that caught them.

**Why the Agent cannot do it.** The available GitHub tool surface has no
branch-protection capability. The reason that outlives tooling: a protection
configured by the producer, under the producer's own credential, is not a control
over the producer, only a setting the producer can also remove. A control over
the producer has to be held by someone the producer is not.

**Realization proposed (this repository's judgement, cycle 0005).** On branch
`main`: require a pull request before merging; require at least one approving
review; allow no bypass for administrators, which covers force pushes and
deletion of the branch, both being direct writes by another name. Any other
arrangement that establishes the property is equally acceptable and this one
should be replaced rather than defended.

**Deliberately excluded, because unearned.** Required status checks — there is no
CI and none has been earned. More than one approval. Code-owner review. Dismissal
of stale approvals. Restrictions on merge method. Linear history. Signed commits.

**What the realization rests on, and no file here can verify.** The producer's
identity must not be one that can approve: GitHub forbids self-approval, so the
control holds only while the producing Agent and the reviewing Human are separate
accounts. On PR #1 they are — authored as `ChBrain`, reviewed by `kaihacksai`. If
they ever became one account the required approval would be satisfiable by the
producer and the control would fail silently, which is the worst way for a
control to fail. Separately, the protection must be owned by an account the
producer does not control, or the producer removes the constraint instead of
meeting it.

**One honest limit of this file.** Until the property is established, nothing
stops the producer from editing this status line, which is the same gap the order
is about. Once the protection exists, a change to this line has to cross the
boundary like anything else. The order closes its own loop only after it is
carried out.
