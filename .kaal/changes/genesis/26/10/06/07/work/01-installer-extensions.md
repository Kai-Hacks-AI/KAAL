# The installer delivers Extensions

## Intent

Core can now define and register Extensions (06/06), but the installer that makes this repository an installed KAAL knows only Skills: it asks Core for `installedSkills()`, registers through `registerSkill()` and requires every package to realize exactly one Agent Skill. A package typed as an Extension, such as the `packages/kaal-github` that follows, would be reported as delivered by no package. Teach the installer Extension delivery before the checked-in projection is advanced (I), so I is produced with the complete delivery semantics. This is E of the sequence accepted on #54.

## Requirements

R1. Which Extensions are installed is Core's answer, `installedExtensions()`, exactly as which Skills are is `installedSkills()`; no package layout, name or list decides it, and a fresh checkout is still installed Core only.

R2. The package that delivers an installed Extension is the one carrying a Node with that exact ID, as for a Skill. Its contribution is registered into the throwaway KAAL through Core's `registerExtension()`, so the projected files are Core's own: the Nodes and seals under `extensions/<capability>/` and `seals/`.

R3. An Extension's package may carry no Agent Skill: its `payload()` is `{ kaal }` and it registers under its own directory name. A package that carries an Agent Skill still realizes exactly one, and still registers under its name. Existing Skill packages are delivered exactly as before.

R4. An installed Skill or Extension that no package delivers is named as such (`the installed Extension … is delivered by no package`). A package whose Skill and Extension would both be installed is refused: a capability is one or the other.

R5. Sealed material stays append-only: installing an Extension's files over other bytes refuses and writes nothing; a stale or lagging Extension projection is advanced by installing, and the complete check holds after it.

R6. The repository's own behaviour is unchanged: no package here delivers an Extension yet, its installed Skills, the check, the candidate-validity assertion of #55 and every existing test pass as before.

R7. Nothing else changes: no package, no Core, no `.github`, no CLI, no `.kaal`.

## Architecture

Only `engineering/kaal-install` changes. `delivery()` merges the Skills and the Extensions Core reports into one list of installed Nodes, each with its kind; it resolves each to the package carrying that ID and registers each package by its kind. `packages()` accepts a packages root, this repository's `packages/` by default, so the delivery can be proven over a throwaway root without a real Extension package; the CLIs are unchanged. `state.ts` only learns to say the kind in the unresolved message.

## Evidence

- New acceptance cases over a throwaway package root of real sealed Extension Nodes, registered through Core: an Extension is delivered only when installed, by the package carrying its Node and under its directory name, with no Agent Skill and no host skills; installing twice changes nothing; a stale projection is advanced and the full check holds, and a changed sealed byte is refused; an installed Extension no package delivers is named; Skills and Extensions are delivered side by side without either registration standing in for the other; a package installed as both is refused.
- The existing install tests, including the repository-self candidate-validity assertion, pass unchanged; the whole root `npm test`, `check-kaal-install` over the repository's own packages, `check-kaal-seals` and `check-kaal-changes` pass.

## Not done here

- The checked-in `.kaal` is not advanced; `.kaal/core/Extension.md` and its seal arrive by `install-kaal` in I, the next Change.
- No `packages/kaal-github`, no Extension package, and no CLI change.
- One package is a Skill or an Extension, never both: a design choice of this Change, open to the Owner's ruling.
