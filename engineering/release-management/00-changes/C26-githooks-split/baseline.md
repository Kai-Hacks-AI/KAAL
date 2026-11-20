# C26 baseline

The baseline is `main`. Work that is not on `main` is not delivered functionality.

- `main` holds `.githooks/pre-push`, one script that resolves the pull request target of each pushed ref and runs `kaal-guard run --hook`. It is the legacy hook.
- Nothing on `main` separates the legacy hook from a new one, and the Engineering wiring source area has no place for hook sources.
