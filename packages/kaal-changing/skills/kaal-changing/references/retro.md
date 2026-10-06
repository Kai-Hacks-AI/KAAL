# Reference: retro-work.md and retro-review.md

A change has two retrospectives, from two perspectives. Both are written only after the change's `work/` is sealed, which is after review has converged, and the Change is sealed after both.

- `retro-work.md` is written from the Work's seat, by the Worker that performed it.
- `retro-review.md` is written from the review's seat, by the Reviewer that reviewed it (`rowing.md`).

They are written in either order. Each is the writer's own: they are different seats, not a draft and a correction, and each should stand as its own seat's perspective rather than a response to the other. It is recommended that neither writer reads the other's before writing its own; that is not something KAAL's checks can show, and it is not required.

A retrospective is not the review. The review's result is in the rounds in `review/`: findings to resolve, or convergence. A retro carries what its writer learned, liked, lacked and longed for, and never a verdict, an approval or a finding that exists nowhere else.

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

Neither infers what the user thought, speaks for anyone else, invents anyone's sentiment, or says what is expected to be welcome. Where the writer has nothing honest to say for a dimension, it says so plainly rather than filling the space.

## The four dimensions

They are distinct in meaning, in both retros.

- **Learned**: knowledge or understanding the writer gained that was not known or clear at the beginning.
- **Liked**: something that worked well, from the writer's perspective, and is worth preserving.
- **Lacked**: something absent whose absence made the writer's experience harder, weaker, slower or less certain.
- **Longed**: a desired future possibility or improvement, from the writer's perspective. It is not a restatement of something Lacked.

Do not take one observation and write it four ways. If an observation could fit several dimensions, put it in the one that is its primary meaning and find different observations for the others. Each dimension holds observations the others do not.

## The historical forms

Changes closed before the two perspectives hold a single `retro.md` of the same form. Changes closed before review was a step hold `retro-work.md` and `retro-observe.md`, the second written by an observer from outside the Work, of the same form. They stay valid as sealed and are never rewritten. A new change writes neither `retro.md` nor `retro-observe.md`: its second retrospective is `retro-review.md`.
