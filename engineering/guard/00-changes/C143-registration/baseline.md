# C143 baseline

The baseline is `main` (a900273). Work that is not on `main` is not delivered functionality.

- `packages/kaal-guard` is version 0.0.4. It has Intent, Requirements, Architecture, Testing and Limitations in `docs/`, a Skill, `contract.json`, 175 Cases of which 48 belong to other capabilities (`/guard/guard-test-chain-analysis.md`).
- Checks are declared only in one directory, `.kaal/config/guard/<name>.md`, owned by the repository. A capability has no way to register a check, and a Change has none either.
- Hook and CI are wired once (`.githooks/pre-push`, `guard.yml`) and already follow the declarations without edits (guard/F3, guard/T14). That part of the intent holds today.
- Trusted checks are judged from the base (guard/F7), but only for checks the base declares `trusted`. Nothing stops a candidate from deleting an ordinary declaration (`limitations.md`: Guard cannot protect its own list of checks).
- Every declared check runs for every push. There is no selection by capability in flight.
- The package has no `ownership.kaal.json`, no `capability/Guard.md`, and names its contract `contract.json`; Core and Testing use `installation.kaal.json`, `ownership.kaal.json` and `capability/<Name>.md`.
