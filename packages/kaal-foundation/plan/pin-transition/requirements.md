# Requirements (foundation/I11)

- R1: After the transition, Core, kaal-change and kaal-testing pin exactly the
  workspace Foundation version.
- R2: A clean `npm ci` at the repository root succeeds on Linux, macOS and Windows
  with no nested `@kaihacksai/kaal-foundation` anywhere.
- R3: The root lock entry for the Foundation workspace equals the package version
  and is produced by the accepted generation route.
- R4: Core's pin assertions are updated to the new version, not removed or relaxed.
- R5: Each pin and assertion update is made by its owning capability under its own
  Change; Engineering coordinates ordering, lock generation and admission.
- R6: No product code in Foundation, Core, Change or Testing changes in this
  transition other than the version strings above.
