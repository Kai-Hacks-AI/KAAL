# C39 change

## What changes

One line of `engineering/acceptance/embed.test.mjs`: the installed-package check imports `catalog` instead of `capabilities` and reads `.skills` from it. `catalog` is on main in Core (`register.ts`) and `capabilities` is defined as `catalog` narrowed to Skills and Extensions, so the Case asserts the same list (`Greeting`) before and after.

## Decisions

1. **No Case expectation changes.** The Case still pins that an installed `kaal-core`, moved to another host, lists the registered Skill through its API. Only the name of the function it calls changes, so this is a repair of the Case, not a change of what it pins.
2. **Order with Core:** this PLAN goes first. The Case passes against Core as it is on main (both functions exist) and after Core's DO (only `catalog`). Core's DO should land after this one is on main, or on a collector that holds it.
3. **No DO:** the edited Case is the whole change, so there is no source to write. The collector goes to PROMOTION with its ACT.

## Not in this Change

Core's removal itself (core C156), the Acceptance lane, and any other use of `capabilities()` (none found in this repository besides this Case).
