# Candidate validity of the installed projection

## Intent

The repository holds itself to "this repository holds what its packages deliver" by checking the checked-in `.kaal` against the packages. That judges two different things at once: whether the candidate's delivery is a complete and legal installation, and whether the checked-in projection happens to be current. A change confined to a package, such as a Core change under the isolation rule, cannot also update `.kaal`, so the second makes it red by construction. Separate them. The PR-facing assertion proves the first without relaxing anything; the second, projection currency, is `check-kaal-install` over the lineage and is mapped for a later change. This is P1 of the sequence the Owner accepted on #54: no tolerance, no expected-path exceptions.

## Requirements

R1. The repository-self assertion in `engineering/kaal-install` copies the checked-in `.kaal` (without the installed history it does not judge: `changes`, `seals/changes`, `seals/trees`) and the host `skills/` into a scratch directory, installs the candidate packages' delivery over the copy with the existing `install`, and requires the existing complete `check` to return no problem there.

R2. Nothing is excused: the check is the same function with the same expectations; installing still refuses any sealed byte that would take other bytes, which makes the assertion also prove that the candidate can advance the admitted projection legally.

R3. The checked-in `.kaal`, `skills/` and `AGENTS.md` are never written by the assertion.

R4. The assertion keeps its other claims: which Skills are installed and which capabilities the delivery covers.

R5. A test shows the control working on both sides: a projection that lags the packages (a Core Node and its seal removed from the scratch copy) is stale before installing and complete after it; a projection whose sealed bytes disagree with the packages is refused by installing.

R6. Nothing else changes: no package, no Core, no `.github`, no helper, no other test. The existing tests that run on freshly built installs are untouched.

## Architecture

Only `engineering/kaal-install/acceptance/install.test.ts` changes, plus its README. `scratchProjection` copies the projection and host delivery into a temporary directory the way the other tests make checkouts; the packages are always the repository's own (`SOURCE`), as the helpers already define. No helper learns of Git, branches or PRs, and no new command is added.

## Evidence

- `engineering/kaal-install`'s `npm test` passes: 17 tests, the replaced assertion green on current `kaal/genesis`.
- The same suite passes with the Core change of #54 (the `Extension` Node and its seal) applied to the packages while the checked-in `.kaal` still lacks them, which is the state that made the previous assertion red.
- The whole root `npm test` and `check-kaal-install`, `check-kaal-seals` and `check-kaal-changes` pass.

## Not done here

- The lineage control, `check-kaal-install` over the checked-in projection on `kaal/genesis` after a merge, is not added; it is folded into the `.github` cutover (C3), non-required for PRs.
- The installer does not yet deliver Extensions (E), and nothing is projected (I).
- #54 is untouched; it keeps its sealed Work and stays out of Observer until this lands.
