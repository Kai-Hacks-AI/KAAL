# Test run re-entry guard: Architecture

- **testing/A30** [testing/F102, testing/F103, testing/N22]: `kaal-testing/reentry` is one new module, `lib/reentry.mjs`, that imports nothing and exports `MARKER` (`"KAAL_TESTING_RUN"`) and `guard(env, level)`. The run entries load it with Node's built-ins only, so an installation's verification still needs nothing else (testing/F50, testing/F63).
  - **Why a marker.** The failure came from an inherited `--eval` flag, but another launch shape can recur it: any child process that inherits the environment and starts a run. A marker in the environment is inherited by every descendant the same way the loop was, so it catches the whole class.
  - **Why levels.** The run entry hands off to the verification as a normal step, so a single yes-or-no marker would refuse the ordinary run. The marker is the level of the deepest entry that has entered; an entry enters only below its own level, so the handoff downward is allowed and any return to the same or an outer entry is not.
  - **Open, not decided here.** Hosting may own the guard later (Owner, 5 Nov). The marker and its contract do not depend on who owns it.
