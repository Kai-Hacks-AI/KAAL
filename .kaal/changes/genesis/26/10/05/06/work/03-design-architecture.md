# Work selection: architecture

Three things that have different lifetimes, kept apart, and everything else derived.

```
what the work is          immutable   identity = bytes
what comes first          mutable     human judgment
what is happening         derived     from Changes
```

## The only new artifact: a candidate

A **candidate** is a plain statement of work that might happen: what, why, and optionally what it comes after. It is identified by the SHA-256 of its exact bytes and referred to by `{name, id}`, exactly as KAAL already refers to anything.

It is not a Node and is not sealed. It needs no ceremony, because identity by bytes already makes it immutable in the only sense that matters: edit it and it is another candidate, which is supersession as KAAL already has it. Its text may say it comes after other candidates or Changes, or that it supersedes an earlier candidate, by `{name, id}`. Because a reference can only name what already exists, dependencies are acyclic by birth.

Anyone may write a candidate. That is observation and description, not authority.

## The order

One instance-owned plain-text list of candidate references, most important first, in the manner of the Core configuration: not a Node, not sealed, human-edited. Appearing in the order is the human act of ranking; a candidate not in the order is a proposal. Moving, adding or dropping an entry never touches any candidate's identity. A recommendation from an agent is simply a proposed edit to this file; the human accepts or does not.

## Everything else is derived

| reading | meaning |
|---|---|
| proposed | a candidate not in the order |
| blocked | in the order, some candidate or Change it comes after is not closed |
| ready | in the order, not blocked, not taken |
| taken | an open Change cites it |
| done | a closed Change cites it |

A Change takes work by citing the candidate in its intent, in the same `{name, id}` form. That citation is the claim: it is made by allocating the Change, so there is no claim artifact, no lock and no status file. The existing process evaluator already says whether a Change is open or closed. Nothing here is stored beyond the candidates, the order and the Changes that already exist.

```
conversation / retro ─ observe ─▶ candidate        (anyone)
                                      │ rank
                                      ▼
                                   the order       (human)
                                      │ first ready, not taken
                                      ▼
                                    Change         (agent takes it)
                                      │ close
                                      ▼
                                     done
```

## What an agent may take

For a free agent: walk the order from the top, skip what is blocked or taken, take the first ready candidate. Deterministic and the same for every agent reading the same directory. If it does, it allocates a Change whose intent cites the candidate. That is the only commitment point.

## Parallel, urgency, overlap

Ready work is parallel by default; two free agents take two different ready candidates. Sequence exists only as an explicit `comes after`. Two candidates that would collide on a boundary are serialised by saying which comes after which; the one who sees the overlap, human or agent, states it, and a human who disagrees reorders or edits. Urgent work is ranked first, and the next free agent takes it; Changes already in flight are not interrupted by KAAL.

## Duplicate pickup

Two open Changes citing the same candidate is a contradiction that a reading of the directory finds and reports. Prevention needs one shared view of the directory at the moment of taking; where participants work on separate views, the contradiction surfaces when the views meet. KAAL provides the reading; whoever provides the shared view provides the prevention.

## Abandonment and supersession

Dropping a candidate from the order changes ranking, nothing else. A candidate superseded by changed text is a different candidate; the old one stays referable. A Change that stops is closed with its retrospectives saying why; its candidate then reads as done, and if the work remains wanted, a new candidate says so, which keeps the history honest about the attempt.

## Retrospectives

A retrospective may notice work. Writing a candidate from that is a separate act by anyone; ranking it is a human act; taking it is the agent's. Nothing in a retrospective is read as a candidate automatically.

## Deterministic and judgment

| deterministic | judgment |
|---|---|
| identity, references resolve | whether a candidate is worth doing |
| ready, blocked, taken, done | what is ranked, and in what order |
| what a free agent may take | what is urgent, what overlaps |
| duplicate taking is flagged | abandoning work that is in flight |

## What this does not do

No backlog artifact beyond the candidate, no priority field, no lifecycle states, no claim records, no scheduler, no estimates, no worker assignment, no host concept, no Core growth. Whether the candidate form wants a Definition, and which capability delivers the reading, are questions for the Change that realises this; neither is decided here.

## Why not the obvious alternatives

- *Open Changes as the pool.* A Change already means commitment: it takes an allocation, reads as in flight by definition, and has freely mutable Work, so nothing could reference it stably. An idea would count as work begun.
- *A priority field on the work.* It makes identity change when judgment does.
- *A Node per candidate.* Birth and sealing ceremony for something that only needs a stable name; byte identity already provides one.
