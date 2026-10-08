# Investigation: what depends on `.kaal/changes/`

Against `kaal/genesis` at 1679d40. Investigation only; nothing is moved or implemented. Terms: the **KAAL dir** is the installed engine (`.kaal/`); the **repository root** is what the repository owns. ("Work" is avoided as a directory term because `work/` already names a tree inside a Change.)

## 1. What relocation cannot touch: identity

- A Change's ID covers the relative paths and bytes of the tree under it and excludes the Change's own address (`engineering/change-seal/README.md`, `change-state.mjs`). Moving a Change whole keeps its ID.
- No sealed Node states a location. `packages/*/kaal/*.md` contain no `changes/` or `.kaal` path, and Core has no knowledge of `changes/` at all. So no Node, no Node seal and no Core file needs to change for a relocation.
- Evidence: copying `.kaal/changes`, `.kaal/seals/changes` and `.kaal/seals/trees` into a scratch directory shaped `<dir>/changes`, `<dir>/seals/changes`, `<dir>/seals/trees` and running the existing `closed` and `check` commands on it reports the same 24 closed Changes with the same 24 IDs and exit 0. The machinery already works on any directory of that shape.
- Counts today: 24 Changes (151 tracked files under `.kaal/changes`), 24 Change seals, 23 tree (`work/`) seals. Sealed Change content mentions `.kaal/...` paths in prose; those bytes stay as sealed and are not edited.

## 2. The one structural coupling: `changes/` and the seals share one directory

Everything that knows Changes takes a single `<kaal-dir>` and reads `changes/` and `seals/changes`, `seals/trees` from it:

| Layer | Where | What it assumes |
|---|---|---|
| Changing KAAL Skill scripts (unsealed, `packages/kaal-changing/skills/kaal-changing/`, projected to `skills/` and `.kaal/skills/`) | `change-state.mjs` (`changes(kaalDir)`, `SEALS`, `TREE_SEALS`), `next-change.mjs` | Records and their seals live under the KAAL dir |
| Change-seal machinery (`engineering/change-seal/helpers/`) | `compass`, `changes`, `process`, `admission`, `preservation`, `cli` | The same single dir, for state, sealing, admission and preservation |
| Root npm scripts (`package.json`) | `seal-kaal-change`, `seal-kaal-work`, `state-kaal-change`, `close-kaal-change`, `check-kaal-changes` | `.kaal` is the argument |
| Repository controls (`packages/kaal-github/src/controls.ts`, `git.ts`; not under `.github/`) | `KAAL_DIR = ".kaal"`, `RECORD = /^\.kaal\/(changes|seals\/changes|seals\/trees)\//`, `withBaseline` extracts only `.kaal` of the target | Baseline and candidate are the two `.kaal` directories |
| Installer (`engineering/kaal-install/helpers/delivery.ts`, `state.ts`, README) | `CHANGES`, `CHANGE_SEALS`, `underChanges` | `.kaal/changes` and change seals are installed state, neither read nor written |
| Byte guard | `.gitattributes`: `.kaal/changes/** -text`. Enercon's `.gitattributes` guards only `.kaal/core/**`, `.kaal/seals/**` and the entrypoints | Raw bytes survive checkout |
| Text only | Changing KAAL `SKILL.md` and `references/rowing.md`, `engineering/change-seal/README.md`, `.github/README.md` (and a comment in `kaal-lineage.yml`) | Describes the location |
| Tests | `engineering/change-seal/acceptance/*`, `engineering/kaal-changing/acceptance/*`, `engineering/kaal-install/acceptance/install.test.ts`, `engineering/kaal-review/acceptance/*`, `packages/kaal-github/test/*` (some run against the real `.kaal/changes`) | The above |

Not touched by a relocation: Core (`packages/kaal-core`, `engineering/kaal-core`), every sealed Node, `.kaal/seals/<ID>` Node seals, and the workflow files' commands (they call `packages/kaal-github/dist/cli.js` and `npm` scripts). The only `.github/` change is README text.

## 3. What a naive move does today

A candidate whose `.kaal/changes` has been emptied (the Changes would live at the root) is refused by both required-style controls:

```
preserve-changes: the Change changes/genesis/26/10/04/01 is closed in the baseline as d758700e... but no closed Change with that identity is in the candidate
admit:            (same, for every closed Change)
```

Because the controls look only inside `.kaal` on both sides, and because `check-kaal-changes` flags a Change seal that "matches no Change". `preserve-sealed-changes` is a required check, and the no-waiver rule applies, so the relocation cannot go first. A bridge has to.

Also: `contain-change` requires exactly one new closed Change per proposal into a `kaal/*` branch. A pure move introduces none (moved Changes are already closed in the baseline), so the relocation must itself be carried as a Change.

## 4. Three topologies

- **Engineer** (this repository): KAAL source and a self-install. `.kaal/` is a projection of the packages except for genuine state. `.kaal/changes` and the change seals are the one big piece of repository history living inside the engine directory; that is the confusion the Intent names. Moving them makes `.kaal/` derived (plus instance `core/config`, collections and carriers, see Q6).
- **Embed** (Enercon): `origin/main` at 1dbf356 holds Core only (`.kaal/AGENTS.md`, `core/`, `seals/`), the root `AGENTS.md` pointer and `.gitattributes`. It has no Changing KAAL, no Sealing, no Changes: nothing to migrate. What the model must settle before Enercon installs Changing KAAL: a root `changes/` is a host-owned directory (a host may already use that name), and the host's `.gitattributes` would need a `-text` guard for it that the installer does not emit.
- **External KAAL** (my reading, to confirm: the KAAL dir is not inside the repository whose Work it governs, e.g. a shared install, a path outside the checkout): today every script would write Changes to a place that is not in the repository. This is the case that forces the answer to the seal question. Change seals must travel with the Changes, in the repository; if they stayed in the engine dir, a clone of the repository could not show which Changes are closed, and no repository control could check it.

## 5. Model (proposal)

- The **KAAL dir** holds what KAAL is: Core, Nodes and their seals `seals/<ID>`, installed Skills and Extensions, the instance's `core/config`. Derived from packages, plus instance state.
- The **repository root** holds what the repository does under KAAL: `changes/<name>/YY/MM/DD/CC/`, and the seals that attest those Changes, beside them.
- A Change's seal is outside the tree it seals (unchanged) and names an ID that excludes the address (unchanged), so a Change can be addressed by `changes/<name>/YY/MM/DD/CC` relative to the repository root in all three topologies; only the location of the KAAL dir differs.
- Every script that today takes `<kaal-dir>` for Changes takes the repository root for Changes and seals, and the KAAL dir only where it needs Nodes. In Engineer and Embed the KAAL dir is `<root>/.kaal`; in External it is elsewhere.

## 6. Smallest safe transition (each step green, in this order)

1. **Controls bridge** (`packages/kaal-github` + its installed projection; not Core, not `.github/`): `withBaseline` also extracts the repository's `changes/` and seal directories from the target, and the controls hand KAAL one assembled directory of the shape the machinery already reads (the scratch experiment in 1). `RECORD` accepts both places. While nothing has moved, behaviour is unchanged. This alone makes the old and the new location both pass `preserve-sealed-changes` and `admit`, because both judge by identity.
2. **Consumer bridge** (`packages/kaal-changing` scripts, `engineering/change-seal`, root npm scripts, installer treatment, `.gitattributes`): Changes and seals are read from the repository root, falling back to `.kaal` where the old location still holds them; a Change or a seal present in both places is refused. `next-change` allocates in the new place. Skill text describes the new place. Installed projection refreshed.
3. **Relocation, as its own Change** (contains a closed Change that records it): `git mv` of `.kaal/changes` to `changes/` and, if the answer to Q1 is "beside", the seal directories. Nothing inside any Change is edited. The bridge controls prove that all 24 IDs are present and closed afterwards.
4. **Drop the bridge**: remove the fallback and the dual `RECORD`; `check-kaal-install` stops treating `.kaal/changes` as installed state.
5. **`.github/README.md`**, alone (the isolation rule): the text describing `.kaal/changes`.

Steps 1 and 2 may be one PR if neither touches `.github/` or Core; they should not wait for each other's merge to be tested. Step 3 is the only step that moves sealed material and the only one that needs Q1 and Q5 answered. Core is not touched at any step.

## 7. Dependencies and interaction with PR #70

- #70 puts new root-level `clients/`, `requests/`, `incidents/` outside `.kaal/` and accepts (its F1) that write-once is unprotected there until a later `.github`/controls Change. Step 1 above is that capability for Changes (controls that see the repository root); it is the natural prerequisite for protecting #70's directories too. The two do not share files today: #70 so far adds only its own Change record. Neither should wait for the other; if both land, the controls bridge is written once for "paths outside `.kaal`", not twice.
- The carriers `incidents/` and `requests/` that `kaal-incident` and `kaal-request` write, and `collections/` that `kaal-collecting` writes, are in `.kaal` today and are installed state in the installer. The Intent says the same principle applies to them. They are deliberately out of this transition (Q6), but the repository-root parameter introduced in step 2 should be the one they later use, not a Changes-only one.
- Change numbering: this Change took `08/03` from `next-change.mjs`; #69 and #70 took it too. `kaal-install`'s acceptance requires a gapless sequence, so whichever lands later renumbers before sealing.
- The sealed Node `Changing KAAL` says its scope is managing changes to KAAL. In Embed and External the Change is a change to a repository's Work. The Node cannot be edited and no supersession rule exists. Nothing in the transition needs it to change (it states no location), but the name and scope will read wrongly for hosts (Q4).

## 8. Open questions

See the pull request description (Q1 to Q6).
