# Architecture

The evaluator moves to where the process is owned. `kaal-changing` now ships `scripts/change-state.mjs`, and that script is the one definition of where a Change is, whose act is next and what it is, and of which directory is a Change and which a named tree. The repository's commands consult it and keep no idea of the order of their own.

Nothing is added to `kaal-core`, `.github/**` or any Node. No Git, GitHub or CI concept enters the script, and the script writes nothing.

## Shape

`change-state.mjs` has two faces, as the Sealing scripts do.

- **A function.** `compass({ identity, markers })` returns `stateOf`, `closedChanges`, `checkChanges`, `currentWorkId`, `changeId`, `namedTreeId` and the seal readers. Identity and seal markers are arguments: the script does not decide what an identity is or what a seal is, which is Sealing's. The layout constants (`work/`, `review/`, the retrospective names, `seals/changes`, `seals/trees`) and the Change directory finder are exported beside it.
- **A command.** `node scripts/change-state.mjs <kaal-dir> <change>` prints the stage, `next:`, `work:` and `problem:` lines, with the exit code `0` for none, `1` for a problem or an unknown Change, and `2` for usage. Its identity and markers come from the Skill `kaal-sealing` installed beside it (`skills/kaal-sealing/scripts/`). Without it the command refuses and says so; it never invents an identity.

## What depends on what

- `kaal-changing` needs the `kaal-sealing` Skill installed beside it, to answer. That is a dependency of the answer, not of the package: it is an installed-Skills adjacency, in the Skill's `compatibility`, and nothing in `package.json`, Core or the installer changes. A KAAL with `kaal-changing` and no `kaal-sealing` gets a clear refusal. This is the one new coupling; it is raised on the PR.
- Engineering (`engineering/change-seal`) keeps what writes: sealing the Work and sealing the Change, each allowed only where the script's state says so, and the admission and preservation checks. `helpers/compass.ts` binds the script to the very same Sealing scripts it already used. `changes.ts` and `process.ts` no longer define the layout or the order; they re-export the script's and add the two sealing steps. `change-id.ts` no longer chooses the domains.
- `npm run state-kaal-change` is therefore the same code, not a copy; and the repository's installed `skills/kaal-changing/scripts/change-state.mjs` is the delivered one.

## Against the Requirements

1. **Self-contained.** Installed beside `kaal-sealing`, it needs only the installed KAAL, no `engineering/` and no root `package.json`. Shown by an acceptance test that installs only the two shipped Skills and a KAAL directory.
2. **The same answer.** One definition; the repository's `state` command and the delivered script are compared for every Change in this repository.
3. **One identity.** All identity comes from `kaal-sealing`'s `artifact-id.mjs`; no hashing is added, and a test rejects any in the script.
4. **Derived, never written.** The script has no write path; a test shows nothing changes.
5. **No host.** A test rejects host words in the script.
6. **Core does not grow.** Not touched.
7. **Delivered as `kaal-changing`.** It is in the package's `skills/`, so the installer projects it into the host `skills/`; the Skill points at it.
8. **Owner's act stays the Owner's.** The wording is carried over unchanged from 07/04, and the existing acceptance tests for it pass.

## Not done, on purpose

- No change to the installer or to Core's `registerSkill()` to make `kaal-sealing` a declared dependency of `kaal-changing`. If a KAAL ought to refuse to register one without the other, that is a decision about Core and Skill dependencies, for the Owner and for its own Change.
- No shipped sealing or closing script. The Skill still points at the repository's provisional helpers for those.
