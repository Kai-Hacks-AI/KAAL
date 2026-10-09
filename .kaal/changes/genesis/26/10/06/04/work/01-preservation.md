# Preservation operations over KAAL

## Intent

Preservation, "what an admitted lineage keeps", is today decided partly in Bash and partly by this repository's source layout: `preserve-sealed-changes.sh` compares Change identities in shell, and `preserve-seals.sh` reads `packages/kaal-core/artifacts/seals` and `engineering/kaal-core/kernel.sha256` through Git. Express preservation over KAAL itself, given a baseline KAAL and a candidate KAAL, so that the host that runs a lineage (the GitHub extension that follows) only supplies two directories and enforces the verdict. This is the C1 step of the sequence accepted on #47 and decided there: Option 1, installed KAAL.

## Requirements

R1. `preserve-changes <baseline> <candidate>`: every Change closed in the baseline is closed in the candidate with the same identity. Where it lies is free; any edit, addition, removal, substitution of its seal, or removal of the Change is refused, and the refusal names the Change and its identity.

R2. `preserve-seals <baseline> <candidate>`: every Node seal in the baseline's `seals/` is a seal of the candidate, and the Kernel (`core/KERNEL.md`) has in the candidate the identity it has in the baseline. A candidate may add seals and Nodes; a baseline with no Kernel has none to keep. Every violation is reported, not only the first.

R3. Both exit 0 and print `preserved`, or exit 1 and print each reason; they take exactly two directories and are reachable from the repository root as `preserve-kaal-changes` and `preserve-kaal-seals`.

R4. They know no repository layout, package, Git, GitHub, branch, PR or CI. In particular nothing reads `packages/kaal-core/artifacts/seals` or `engineering/kaal-core/kernel.sha256`.

R5. `admit` keeps its verdict and uses the same `preserve-changes` function for its history half, so there is one implementation of that comparison.

R6. Nothing else changes: the Bash scripts, their tests, the workflows and `.github` are untouched; so are kaal-core, every package and every sealed artifact.

## Architecture

`helpers/preservation.ts` in `engineering/change-seal`, beside the one admission predicate: two functions returning reasons, empty exactly when preserved. They reuse what already exists: closed Changes and their identities are `changes.ts`'s, a seal marker and a file's identity are the Sealing capability's, reached the way the other helpers reach them. `admit` replaces its inline loop with `preserveChanges`; its messages and verdict do not change.

`preserve-seals` is defined over the installed KAAL (`.kaal/seals/<ID>` and `.kaal/core/KERNEL.md`), not over kaal-core's source seals. That widens what is protected from Core's original seals to every installed Node seal, capabilities included, which is the correct generalization; `check-kaal-install` already requires the installed KAAL to match the packages, so a package seal cannot be dropped alone, and dropping an installed seal is caught because the baseline has it. The Kernel is kept by its identity, the SHA-256 of its exact bytes; the seal file `kernel.sha256` is an engineering verification mechanism and keeps being verified by `check-kaal-seals`, not read here.

Tree and Change seals are not looked at beyond closure, which is identity-based. That is a boundary stated in the code and pinned by a test, not an omission: making a pushed seal of any kind unremovable and immutable is a distinct hardening Change.

## Evidence

- `engineering/change-seal` acceptance gains `preservation.test.ts`: all of the shell test's cases for sealed Changes (moved whole, renamed whole, every way of editing, adding, moving, deleting, resealing or substituting, deleting the seal or the directory) as table-driven cases; Node-seal cases (kept, added, removed, swapped, emptied of its marker, directory gone) and Kernel cases (kept, altered, missing, moved elsewhere); the reports of every violation; usage; and this repository's own installed KAAL, which preserves itself and fails for each of its Node seals removed and each of its closed Changes touched.
- The whole root `npm test`, `check-kaal-install` and `check-kaal-seals` pass. `preserve-kaal-seals` and `preserve-kaal-changes` report `preserved` for this repository against itself and against `kaal/genesis`'s own `.kaal`.
- The existing admission tests pass unchanged.

## Not done here

- No extension, no change to Bash or `.github`: the controls still run the shell scripts; replacing them is the next Changes of the sequence.
- No immutability hardening for pushed tree or Change seals.
- `engineering/change-seal` remains provisional and engineering-only.
