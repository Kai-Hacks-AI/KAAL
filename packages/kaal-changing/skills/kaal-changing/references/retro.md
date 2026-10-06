# Reference: retro-work.md, retro-review.md and retro-observe.md

A change has three retrospectives, from three perspectives. All three are written only after the change's `work/` is sealed, which is after review has converged, and the Change is sealed after all three.

- `retro-work.md` is written from the Work's seat, by the Worker that performed it.
- `retro-review.md` is written from the review's seat, by the Reviewer that reviewed it (`rowing.md`).
- `retro-observe.md` is written from the outer seat, by the Owner, who holds the Intent and observes the Change from outside the work and review that went round inside it.

The Worker and the Reviewer are the two that row, each from its own oar; the Owner steers, and observes from the helm.

They are written in any order. Each is the writer's own: they are different seats, not a draft and a correction, and each should stand as its own seat's perspective rather than a response to another. It is recommended that no writer reads another's retro before writing its own; that is not something KAAL's checks can show, and it is not required.

A retrospective is not the review, and the Owner's retrospective is not the Owner's decision: `retro-observe.md` is a reflection written after the Work is sealed, while accepting the closed Change is decided after the Change is sealed and is not an artifact of the record. The review's result is in the rounds in `review/`: findings to resolve, or convergence. A retro carries what its writer learned, liked, lacked and longed for, and never a verdict, an approval or a finding that exists nowhere else.

## Form

Each file has exactly this form, and nothing else:

```
# Retro

## Learned

...

## Liked

...

## Lacked

...

## Longed

...
```

No metadata, scores, action items, owners, identity of the writer, role labels or summary.

## Whose retro it is

`retro-work.md` is written from the worker's own seat and reports the worker's own experience of performing the change.

`retro-review.md` is written from the Reviewer's own seat and reports the Reviewer's own experience of reviewing the Work: what it learned, liked, lacked and longed for in doing so. It does not restate or answer `retro-work.md`, and it does not speak for the Worker. The Reviewer may have approved the Work and still have substantial criticism here; what it saw beyond this change (broader consequences, future work) belongs here, not in a finding.

`retro-observe.md` is written from the Owner's own seat and reports the Owner's own experience of observing the Change from outside: what it learned, liked, lacked and longed for as the one whose Intent was being realized. It does not restate the review's result, does not answer the other retros, and carries no decision.

Neither infers what the user thought, speaks for anyone else, invents anyone's sentiment, or says what is expected to be welcome. Where the writer has nothing honest to say for a dimension, it says so plainly rather than filling the space.

## The four dimensions

They are distinct in meaning, in all three retros.

- **Learned**: knowledge or understanding the writer gained that was not known or clear at the beginning.
- **Liked**: something that worked well, from the writer's perspective, and is worth preserving.
- **Lacked**: something absent whose absence made the writer's experience harder, weaker, slower or less certain.
- **Longed**: a desired future possibility or improvement, from the writer's perspective. It is not a restatement of something Lacked.

Do not take one observation and write it four ways. If an observation could fit several dimensions, put it in the one that is its primary meaning and find different observations for the others. Each dimension holds observations the others do not.

## The historical forms

Changes closed before the perspectives hold a single `retro.md` of the same form. Changes closed before review was a step hold `retro-work.md` and `retro-observe.md`, the second written by an observer from outside the Work, of the same form; `retro-observe.md` was the outer perspective then, and it is the Owner's now. They stay valid as sealed and are never rewritten. A new change writes no `retro.md`: its retrospectives are `retro-work.md`, `retro-review.md` and `retro-observe.md`.
