# Realize CASE Extension in Core

## Intent

CASE already defines the Extensions dimension: the registration through which KAAL Extensions join without becoming Core. Core realizes the parallel Skills dimension with the sealed KAAL Definition `Skill` and a registration rule; it realizes nothing for Extensions. Realize the existing CASE definition in the admitted KAAL machinery, analogously to Skill, so that a capability such as the GitHub integration can later be a package whose Node is typed as an Extension. This is C1.5 of the sequence on #47 and #52; CASE is not redefined and Extension gets no new meaning.

## Requirements

R1. Core carries a sealed KAAL Definition `Extension`, typed by `KAAL Definition`, and its seal. It states that a Node is a KAAL Extension exactly when its type refers, by name and ID, to this Node, that Extensions are found by Node type alone, and that this is the registration the Extensions dimension of CASE provides. It says nothing of what an Extension does or of any host.

R2. Core's public API gains `registerExtension(kaal, capability, contribution)` and `installedExtensions(kaal)`, which behave exactly as `registerSkill` and `installedSkills` do over Core's own `Extension` Node: the typing and the anchor are the exact ID of `core/Extension.md`, the contribution is placed under `extensions/<capability>/`, every check runs before any write, nothing registered ever gets other bytes, and a failed write is rolled back.

R3. Skill and Extension are separate registrations: a Node typed by `Skill` is not an Extension, nor the reverse, in typing, discovery and placement.

R4. `registerSkill` and `installedSkills` behave exactly as before; their acceptance tests pass unchanged, and the one registration implementation serves both.

R5. CASE, Core, Skill and every other sealed Node are untouched; the Core Node count and seal count each grow by exactly one, the Extension's own.

R6. Core isolation: only `packages/kaal-core/**`, `engineering/kaal-core/**` and this Change's record change.

## Architecture

`artifacts/core/Extension.md` is a Node authored once, referring only to Nodes born before it (`KAAL Definition`, CASE), and sealed with the existing `seal-kaal-bootstrap`. In `src/register.ts` the Skill-specific constants become one `Kind` (`name`, the exact ID of Core's Node of that name, the directory it is placed in); `registerSkill` and `registerExtension` are thin calls of one `register`, and `installedSkills` and `installedExtensions` of one `installed`. Nothing of Node form, identity, seal or admission is new; that stays the Node machinery's.

## Evidence

- `engineering/kaal-core/acceptance/extension.test.ts` is the Skill acceptance carried over to Extensions (registration places and seals, is idempotent, refuses everything that is not a sealed Extension contribution and writes nothing, never changes registered bytes, rolls back, finds by typing alone, ignores what else the directory holds, cannot be anchored by an impostor Node named `Extension`), plus one test that Skill and Extension typing, discovery and placement do not cross.
- The definition and node-count assertions in the Core acceptance and package tests list `Extension`; `skill.test.ts` is unchanged and passes.
- `check-kaal-seals` passes.

## Not done here

- The installed `.kaal` is not updated: `.kaal/core` is outside the Core boundary, so `.kaal/core/Extension.md` and its seal arrive by `npm run install-kaal` in a later change. Until then the repository's own installed-KAAL assertion in `engineering/kaal-install` (`this repository holds what its packages deliver…`) is red on this branch, as it names exactly those two missing files. By the no-waiver rule this Change must not merge before a bridge makes that assertion accept both states; that bridge is not part of this Change.
- No `packages/kaal-github`, no Extension is registered, and the installer does not yet deliver Extensions: both are for the rebuilt C2.
