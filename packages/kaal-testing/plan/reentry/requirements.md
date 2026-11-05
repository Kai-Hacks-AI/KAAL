# Test run re-entry guard: Requirements

## Functional

- **testing/F102** [testing/I28]: A run carries one marker in its environment, `KAAL_TESTING_RUN`. `guard(env)` takes an environment as plain data and gives `{ entered, env, findings }`. Where the marker is absent, `entered` is true and `env` is the given environment plus the marker, for the run's children. Where the marker is present, `entered` is false, `env` is the environment unchanged, and a finding says the run was re-entered.
- **testing/F103** [testing/I28]: Testing's run entries (`test/run.mjs` and the installed verification) call the guard first. A re-entered run runs no suite, prints one `kaal-testing: unknown:` line naming re-entry, and ends 2. The guard keys only on the marker, never on a flag, a command shape or a parent process: any way a parent re-launches a run is caught the same way.

## Nonfunctional

- **testing/N22** [testing/I28]: `guard` is pure and deterministic. It reads only the environment it is given, writes nothing and imports nothing.
