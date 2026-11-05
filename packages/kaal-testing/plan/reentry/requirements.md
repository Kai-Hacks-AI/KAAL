# Test run re-entry guard: Requirements

## Functional

- **testing/F102** [testing/I28]: A run carries one marker in its environment, `KAAL_TESTING_RUN`, whose value is a level: a non-negative integer in decimal digits. Each run entry has a fixed level of its own: the run entry (`test/run.mjs`) is level 1, and the verification (`test/verify.mjs`) is level 2. `guard(env, level)` takes an environment as plain data and a positive integer and gives `{ entered, env, findings }`. An entry may enter when the marker is absent or below its level; it then gets `entered` true and `env` as the given environment plus the marker set to its own level, for its children. When the marker is at or above its level, or does not read as a level, `entered` is false, `env` is the environment unchanged, and a finding says the run was re-entered or its marker is unreadable. An unreadable marker is never entered: the guard fails closed.
- **testing/F103** [testing/I28]: Testing's run entries call the guard first, each with its own level. A refused entry runs no suite and no case, prints one `kaal-testing: unknown:` line naming re-entry, and ends 2. The guard keys only on the marker, never on a flag, a command shape or a parent process: any way a parent re-launches an entry is caught the same way.
- **testing/F104** [testing/I28]: The normal handoff is not re-entry. The run entry launches the verification with the marker at 1, so the verification (level 2) enters and passes level 2 to the case processes it spawns; the verification started directly, with no marker, also enters. A case process that re-launches the verification, or the run entry, sees the marker at 2 and is refused. This is how a run reaches its verification cases without admitting a recursive launch.

## Nonfunctional

- **testing/N22** [testing/I28]: `guard` is pure and deterministic. It reads only the environment it is given, writes nothing and imports nothing.
