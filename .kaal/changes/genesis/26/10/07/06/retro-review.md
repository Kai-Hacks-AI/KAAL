# Retro

## Learned

The small selection gap was real, but reviewing successful installation exposed a separate question: whether the selected capability could actually run. Missing Sealing made that distinction concrete. The later rounds taught me that a reader of free-text metadata needs an explicit acceptance boundary before absence can be trusted. A source-line match was evidence about a spelling, not about the field's meaning.

## Liked

I liked that each finding stayed attached to the fixed Intent and came with a runnable counterexample. The Worker turned those examples into acceptance tests, preserved the previous rounds, and kept Core and the host-specific machinery outside the implementation change. The final review could revisit every earlier failure instead of relying only on the newest fix.

## Lacked

I lacked a sufficiently broad statement of the metadata reader's accepted grammar in the early rounds. Reviewing one representation at a time made the loop longer than it needed to be. I should have pressed earlier for either a parser or a bounded shape with explicit refusal, then tested that boundary systematically. The external proof was recorded Worker evidence rather than an independently repeated Enercon run from my review environment.

## Longed

I longed for the next real embedding to test KAAL in the host's ordinary working conditions through its protected-branch PR process. I also want a future dependency meaning to make composition inspectable by Node identity, so review can concentrate on admission and behavior rather than the incidental spellings of prose. The Worker's wish for a deliverable closing lifecycle would make that external use substantially more complete.
