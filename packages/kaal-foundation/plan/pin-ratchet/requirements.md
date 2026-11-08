# Requirements (foundation/I13)

- **foundation/F30**: A consumer whose pinned Foundation version is older than the workspace Foundation version
  is reported as `pin-behind`, naming the consumer, its pin and the current version.
- **foundation/F31**: `pin-behind` is a visible, non-failing outcome: the existing "held" outcome (exit 4), shown
  in the CI summary and in the `boundary` report. It never fails an install, `npm ci` or acceptance by itself.
- **foundation/F32**: A Foundation version may be declared a required floor in Foundation's Node. A consumer
  below a declared floor fails, naming the floor and the reason.
- **foundation/F33**: When a consumer with a `pin-behind` flag is promoted or published, the flag is raised to the
  Owner through the existing ask. Nothing escalates in between.
- **foundation/N18**: The single-copy rule narrows to: no more than one copy per version a consumer's exact pin
  needs, and the workspace copy is the only copy of the workspace version.
- **foundation/N19**: No test is weakened silently. The narrowing of `embed.test.mjs:167` and of C17's negative
  case is made by their owning capability under its own Change and review.
