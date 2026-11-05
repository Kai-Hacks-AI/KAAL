# How a package folder is organised: the structure Packaging owns and defends (packaging/C24)

PLAN only, from Kai's rulings of 4 Nov (*"Lets discuss whats on package and how to organise"*, *"BASS as defined by me"*, *"Defects are correct, structure fits. License?"*, *"Its B ... kaal-package(ing) owns the structure and should have the test cases defending it"*). It changes no runtime file, moves no folder, publishes nothing and authorizes no merge, SYNC, promotion or publication. The first package to take the layout is Hosting 0.0.1, as its own Change before #1030 promotes; every other package ratchets into it in its own release cycle.

## Ownership

Packaging owns the structure and the Test Cases that defend it. It does not own any package's content, and it does not move another package's folders: each package owner makes its own Change into the layout. The checker is generic (a structure check on a directory), the same way `conform` and the registry match are.

## The layout of `packages/<name>/`

```
packages/<name>/
  AGENTS.md  LICENSE  README.md  package.json      root files; AGENTS.md here is the engineering rules and does not ship
  00-changes/<id>/                                  PDCA per Change (replaces plan/)
  01-intent/
  02-requirements/{functional,non-functional}/
  03-architecture/
  04-test/{package-check,boundary-check}/
  05-src/
    AGENTS.md                                       the Agent: agent instructions (ships as dist/AGENTS.md)
    skills/<skill>/{SKILL.md,references/,scripts/}  the Skill, its references, its scripts
  06-defects/                                       Package Defects (accepted ones ship, as dist/docs/defects)
  kaal/<Name>.md  kaal/<capability>/{README.md,<command>.md}   the package's Extension Node, and what it expects from other capabilities (ships as dist/kaal/)
  dist/                                             the ONLY thing that ships
```

What ships (`dist/`), built from the above:

```
dist/
  AGENTS.md                                         from 05-src/AGENTS.md
  skills/<skill>/{SKILL.md,references/,scripts/}    from 05-src/skills (source compiled into scripts/)
  docs/{intent,requirements,architecture,defects}/  from 01-, 02-, 03- and the accepted Package Defects of 06-
  kaal/<Name>.md  kaal/<capability>/                from kaal/
  test/{package-check,boundary-check}/              from 04-test/ (both checks ship)
```

**Where defects live.** `06-defects` holds **Package Defects**, which ship once accepted (as `dist/docs/defects`). **Engineering Defects** are delivery defects, never Package Defects, and never in a package: they live in `engineering/defects/<capability>/` (Kai, 4 Nov), and Packaging does not read or check them.

Numbered folders follow the order of the artifact kinds Kai set for package content (Intent, Functional Requirements, Non-Functional Requirements, Architecture, Test, Source, Defects). `00-changes/<id>/` is numbered 00 so that it sorts first: it is the working history of the package (PDCA per Change), not a step in its content (Kai, 4 Nov). Only `dist/` is deliberately unnumbered: it is the product of the other folders, not source. Digits make the numbered folders sort ahead of it.

**BASS, as Kai defined it.** *Bare agent* is just chatting: no file, nothing to ship. *Agent* is agent instructions: `05-src/AGENTS.md`, shipped as `dist/AGENTS.md` at the root of `dist/` so that agents find it cleanly (Kai, A, 4 Nov); there is no `agent/` folder. The package-root `AGENTS.md` is the engineering rules for people working on the package and does not ship. *Skill* is the skill: `05-src/skills/<skill>/SKILL.md` with its `references/`. *Scripts* are scripts **inside the skill**: `05-src/skills/<skill>/scripts/`. There is no package-level script folder; a script that belongs to no skill belongs to no layer. Source (for example TypeScript) compiles into the skill's `scripts/` in `dist/`; the compiled form is what the skill runs.

**`dist/` is the only thing that ships.** `package.json` `files` is `["dist"]` and nothing else. `npm pack` delivers exactly what is under `dist/` plus npm's always-included files (`package.json`, `README`, `LICENSE`). What `dist/` holds is built from the numbered folders, never edited by hand, and reproducible: building twice gives the same bytes. **Decided (Kai, 4 Nov, B): intent, requirements and architecture ship too, because they are documentation.** So `dist/` holds the Agent and Skill layers (built from `05-src`), the documentation (`dist/docs/intent`, `dist/docs/requirements`, `dist/docs/architecture` and `dist/docs/defects`, generated copies of `01-intent`, `02-requirements`, `03-architecture` and the accepted Package Defects of `06-defects`; the shipped names carry no numbers, Kai A, 4 Nov) and the Boundary Check record. `05-src` itself (uncompiled source) does not ship; its compiled form does.

## The files allowlist question, reframed

The open A/B was whether to keep an allowlist plus a declared unshipped set, or to ship the whole folder. Under this layout neither is needed: **`dist/` is the allowlist.** There is one rule (what is under `dist/` ships) and one place to look. The check for a leak is that the packed file set equals `dist/` plus npm's fixed root files. The "declared unshipped set" is no longer a list that can drift: whatever is not in `dist/` is by definition unshipped. This also answers Kai's earlier "why does source not ship?": source is in the folder and in the repository, `dist/` is the shipped form, and a package owner who wants source in the package puts it in `dist/` on purpose.

Consequence for the registry match (C22): "the files `npm pack` delivers" is unchanged, and an out-of-line `content-differs` can now say whether the difference lies in `dist/` or outside it. Consequence for C23: **boundary tests ship**, so the Boundary Check record (`04-test/boundary-check/`, including its declaration and `Package`-class decisions) must be copied into `dist/` by the build, and `conform` on an installed copy judges that shipped copy. The immutable set of planned tests is not widened; this is a generated copy, checked equal to its source.

## The Extension Node and what a package expects from another capability: `kaal/` (Kai, 4 Nov)

A package documents how it works **with another KAAL capability** in `kaal/<capability>/` at the package root, one folder per capability ("reduce to kaal": no `docs/` level). The rule for the reader is: if both are installed, use it; otherwise, don't. This puts the benefit of combining packages in the package that has it, and keeps these soft dependencies out of `package.json` (they are not dependencies).

**Files are named by what the package expects from the other capability, not by the package's own name:** `kaal/<capability>/<command>.md`, one file per command of that capability that this package uses, plus `kaal/<capability>/README.md` explaining how the package benefits when that capability is present. The package's own **Extension Node** is `kaal/<Name>.md`, **next to** the capability folders, not inside one (Kai: "Hosting.md next to core"). For Hosting that is `kaal/Hosting.md`, which Core reads, plus `kaal/core/{README.md,register.md}`. The rule: `kaal/<Name>.md` is the package's Extension Node, and `kaal/<capability>/` holds the soft-dependency docs. They ship as generated copies at `dist/kaal/` (`dist/kaal/Hosting.md`, `dist/kaal/core/`). There is no `05-src/extension/` and no `payload/`. The old question whether `payload/Hosting.md` is the Agent layer or a skill reference is closed.

Packaging checks only the shape: each capability folder holds a `README.md` and otherwise only `.md` files, the capability folder is a lowercase slug, the shipped copy at `dist/kaal/<capability>/` equals its source, and the only files directly in `kaal/` are `.md` Node files (`<Name>.md`). It does not know which capabilities, commands or Nodes exist, does not judge the content, and does not check that the other capability is installed. What Core reads and under which key (`contribution()` reads `dist/kaal/Hosting.md`, key `Hosting.md`) is Hosting's and Core's.

## Questions for Kai

None open in this PLAN. Decided: intent, requirements and architecture go into `dist/` (B, 4 Nov); the source of what a package expects from another capability is `packages/<name>/kaal/<capability>/` (4 Nov).

## Licenses (Kai: B)

Each package picks its own license. Packaging requires only that the root `LICENSE` file exists and that the `license` field of `package.json` names it (an SPDX identifier, or `SEE LICENSE IN LICENSE`). It does not prescribe the license and does not compare licenses across packages. Whether a license is suitable is the owner's decision.

## What the structure check observes

Results stay three-valued and the check never judges whether a package's content is good.

- **Verified:** the numbered folders, the root files and `dist/` are as above, every skill has `SKILL.md`, `dist/` is the only thing in `files`, and the packed set equals `dist/` plus the fixed root files.
- **Failed:** a layer in the wrong place (for example `scripts/` outside a skill, a skill without `SKILL.md`), a file in the packed set outside `dist/`, a `files` entry other than `dist`, a missing `LICENSE` or a `license` field that names none, a numbered folder with an unknown name, or a duplicate number.
- **Unknown:** the folder or the pack could not be read.
- **Not yet in the layout:** a package still on the old layout is reported as such, never as failed and never as verified, so packages can ratchet in. The ratchet's accepted set (Engineering's) lists the packages not yet in the layout, and may only shrink.
- Empty numbered folders are allowed (a folder may hold only `.gitkeep`); a package with no skill is allowed (the Agent layer alone, or `dist/` of another kind). Packaging does not require content.

## Draft identifiers (provisional; reserved to avoid C10 and C17 to C23)

| Id | Statement |
| --- | --- |
| packaging/F39 | A package folder has the numbered folders `01-intent` to `06-defects`, `00-changes/` and the unnumbered `dist/`, and the root files `AGENTS.md`, `LICENSE`, `README.md`, `package.json`. The structure check states verified, failed or unknown. |
| packaging/F40 | BASS lives under `05-src`: the Agent at `05-src/AGENTS.md` (shipped as `dist/AGENTS.md`), each Skill at `skills/<skill>/SKILL.md` with `references/` and `scripts/` inside the skill. A script outside a skill is failed. |
| packaging/F41 | `dist/` is the only thing that ships: `files` is `["dist"]` and the packed set equals `dist/` plus npm's fixed root files. Anything else packed is failed. |
| packaging/F42 | `dist/` is built from the other folders and reproducible; both shipped checks (`dist/test/package-check`, `dist/test/boundary-check`) and the shipped documentation (`dist/docs/{intent,requirements,architecture,defects}` from `01-intent`, `02-requirements`, `03-architecture` and the accepted Package Defects in `06-defects`) are generated copies equal to their sources. |
| packaging/F43 | Each package picks its own license; Packaging requires only a root `LICENSE` that the `license` field names. |
| packaging/F44 | A package not yet in the layout is reported as not yet in the layout, neither verified nor failed. |
| packaging/F45 | A package's `kaal/` folder holds its Extension Node as `kaal/<Name>.md`, next to one folder per other KAAL capability, `kaal/<capability>/`, with a `README.md` on the benefit when that capability is present and one `<command>.md` per command of that capability the package uses. Shipped as generated copies at `dist/kaal/`. The capability docs are documentation, not a `package.json` dependency. Packaging checks the shape and the copy, never the content, the command list, the Node's meaning, or the capability list. |
| packaging/A25 | One structure checker on a directory, no per-package structure rules, and no knowledge of any package's content. |

## Test Cases (RED first, then DO)

Fixtures only. No network. Reserved: T98 to T112 (T97 belongs to C23; identifiers may move at the DO if another Change takes them first).

- **T98** A fixture package with the full layout: verified.
- **T99** A missing numbered folder, an unknown name (`07-misc`) and a duplicate number: failed, each named.
- **T100** `scripts/` at package level or in `05-src` outside a skill: failed. A skill without `SKILL.md`: failed. An `agent/` folder in `05-src`: failed. `dist/AGENTS.md` that differs from `05-src/AGENTS.md`, or a package-root `AGENTS.md` found in the packed set: failed.
- **T101** `files` other than `["dist"]` (an extra entry or a missing `dist`): failed.
- **T102** The packed set holds a file outside `dist/` that is not one of npm's fixed root files: failed, naming it. A packed set equal to `dist/` plus the fixed files: verified.
- **T103** `LICENSE` missing, or `license` naming a different identifier than the file claims: failed. Two packages with different licenses: both verified (no cross-package rule).
- **T104** A package still on the old layout (`plan/`, `lib/` at the root): reported not yet in the layout; neither verified nor failed.
- **T105** The folder or pack is unreadable: unknown, never verified.
- **T106** Building `dist/` twice gives the same bytes; `dist/` edited by hand so it differs from a rebuild: failed.
- **T107** Both shipped checks and the shipped documentation in `dist/` equal their sources in `04-test/package-check/`, `04-test/boundary-check/`, `01-` to `03-` and the accepted Package Defects in `06-defects`; a differing or missing copy: failed. Editing a source without rebuilding is the same case.
- **T108** Empty numbered folders (only `.gitkeep`) and a package with no skill: verified; the check requires no content.
- **T109** Hostile paths (traversal, absolute, symlink out of the folder) in the folder or `dist/`: refused as `packaging/N4` requires, reported as unknown.
- **T110** The checker is the same on Hosting's folder as on a fixture and reads no package name: no per-package rule.
- **T111** `kaal/Hosting.md`, `kaal/core/README.md` and `kaal/core/register.md` with their copies at `dist/kaal/Hosting.md` and `dist/kaal/core/`: verified. A capability folder with no `README.md`, a non-`.md` file in it, a non-`.md` file directly in `kaal/`, an uppercase or nested capability folder, or a shipped copy that differs or is missing: failed. A capability, command or Node unknown to Packaging is fine (no lists), and a leftover `payload/` or `docs/kaal/` folder is reported as not in the layout.
- **T112** A `kaal/` doc names another KAAL capability: the package does not gain a `package.json` dependency on it, and a `package.json` that lists a KAAL package only because of a `kaal/` file is not required.

## Effects on Changes in flight

- **C23 (#1047):** the Boundary Check record moves from `test/boundary-check.md` to `04-test/boundary-check/` in the new layout, and ships as a generated copy under `dist/`. Hosting's C103 may keep `test/boundary-check.md` until Hosting takes the layout; C23's DO reads the path from the package's layout. I will amend C23 only after this PLAN merges.
- **C22 (#1041):** unchanged in definition. Evidence may say whether a difference lies in or outside `dist/` once a package has the layout.
- **Hosting C101 (#1048), C102 and C103:** these land in today's layout, so C103 adds `test/boundary-check.md` as it is. Hosting then takes the layout in its own Change, after this PLAN and its RED Cases have merged and before #1030 promotes. That Change moves `test/boundary-check.md` to `04-test/boundary-check/` and ships it as a generated copy in `dist/`, followed by one ledger re-derive. This PLAN moves no Hosting file.
- **Packaging's own folder** takes the layout at its own release cycle; it is private and not on the critical path.

## Decided (Kai A, 4 Nov): path-only supersession of immutable Case clauses

Immutable Cases name paths (for example Hosting's T122 names `test/boundary-check.md`). Moving a package into the layout changes those paths and nothing else. **Ruling:** a layout move may supersede **only the path clause** of an immutable Case, never its behaviour clause. The move's Change lists each superseded Case with its before and after path. This is one blanket rule; the layout move needs no per-Case ruling. Packaging's check does not decide it; it only reports a Case whose path no longer exists in the folder.

## Transitional use of Hosting in the DO (#1053), and the route off it

The DO (`lib/structure.mjs`, `lib/host.mjs`) is **temporary collector work**. Two things in it are transitional, both because Hosting 0.0.1 had no directory listing or scratch directory when it was written:

1. `lib/host.mjs` imports the legacy unscoped `kaal-hosting`, which is what Packaging's `package.json` still depends on (`"kaal-hosting": "0.0.1"`).
2. `lib/structure.mjs` lists directories and makes its scratch directory by running a one-line Node script through Hosting's `execute` (`node()`, `entries`, `scratch`). Immutable T6 forbids `node:` imports in `lib/`, so a script run through Hosting was the only way to list empty directories.

**It cannot be promoted or published as it is.** Promotion of Packaging, and Packaging 0.0.1 itself, wait for the follow-up Change below.

**Follow-up Change (packaging/C27), bounded:**

- Depends on the Hosting Change that lands `list` and `scratch` (`hosting/C106`, planned in #1054) in the scoped package `@kaihacksai/kaal-hosting`, at the exact version Hosting 0.0.1 carries. `package.json` changes `"kaal-hosting": "0.0.1"` to `"@kaihacksai/kaal-hosting": "<that exact version>"` (F7: one exact registry version, no range).
- `lib/host.mjs` re-exports `list`, `scratch`, `kind`, `read`, `readFile` from the scoped package and nothing else; `execute` and `process.execPath` leave `lib/structure.mjs`. `entries` becomes `list(dir)` (a `directory` entry for a directory, a refused tree for a link), and `scratch(use)` is Hosting's. No `node:` module, no `process`, no shell, no assumption that a runtime other than the one Hosting runs is on the PATH.
- The imports elsewhere in `lib/` move to the scoped name in the same Change. T6 names the specifier `kaal-hosting`; moving it to the scoped name supersedes only that name clause of T6 (the same kind of ruling as the path-only supersession below), and is listed before and after in the Change. **Decided (Kai A, 5 Nov):** one blanket ruling allows a change to the name clause only, listed before and after in the Change, like the path-only ruling.
- **Shipped docs are listed, not copied wholesale (Kai, 5 Nov).** `dist/docs/{intent,requirements,architecture,defects}` holds only the documents relevant to what ships, named in an explicit shipped-docs list in the package. C27 changes the whole-folder copy check: each listed doc exists and is byte-equal to its source, and nothing else is in `dist/docs`. This changes the Cases that assume whole-folder copies (the `dist-copy-missing` and `dist-copy-extra` findings), under the same blanket ruling, listed before and after in the Change. It is required by the public checker-only Packaging `dist/` (packaging/C26).
- **Verified on the actual Hosting candidate, not only fixtures.** The Change's acceptance step installs the Hosting candidate (the packed tarball of `kaal/hosting` at its head, not a stub), runs T98 to T112 against it, and runs `checkStructure` on Hosting's own folder once Hosting has taken the layout. That last run is Hosting's layout acceptance; it must be `verified`.

## Held, not proposed

- Which skills a package has, and what its Agent says (the owner's).
- The build (what compiles `05-src` into `dist/`): Packaging requires the result be reproducible, not the tool.
- Whether `00-changes/<id>/` has a mandated inner shape (the PDCA layout is Change's).
- Any new hard dependency.

## Sequencing

This PLAN, then RED (T98 to T112), then DO. It needs nothing from `main`. Hosting's move into the layout is Hosting's Change, started once this PLAN and the RED Cases are in, and must land before #1030 promotes.
