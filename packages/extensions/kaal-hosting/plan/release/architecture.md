# Scoped Package Name: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A7** [hosting/F15, hosting/F16] (Option A below, as `core/A36` proposes on #622): the rename and every reference to the old name land in one PR into `kaal/hosting`. A rename cannot be split from its importers without breaking the workspace, so each importer's owner reviews that PR, and it changes nothing in their files beyond the reference. The importers today are Graph, Core, Testing, the Engineer skill and Engineering, and the root `package.json` lanes. Hosting's own planned tests of `hosting/C1`–`hosting/C8` change their import specifier only; that is the one edit `hosting/C11` makes to them.

  A throwaway rename, made for this PLAN and not committed, found six files where swapping the quoted name alone is not enough, because the new name sorts, hashes, nests or appears outside quotes. `hosting/C11` makes the smallest adjustment in each and names it in its PR for that owner's review:
  - `engineering/boundary.test.mjs`, `packages/kaal-core/test/boundary.test.ts` and `engineering/lanes/evidence.test.mjs` compare sorted lists, and `@kaihacksai/kaal-hosting` sorts first.
  - Testing's `evidence.kaal.json` pins the bytes of its `test/boundary.test.mjs`, so that digest changes with the specifier.
  - `engineering/lanes/evidence.test.mjs` uses the workspace name as a lane name, and its helper keys captures by their first directory, which a scoped name nests under `@kaihacksai/`. The lane itself already captures the scoped `@kaihacksai/kaal-foundation`.
  - The Engineer skill's `test/check-skill.test.mjs` expects the import rendered as `{ read } from kaal-hosting`, without quotes.
  - Core's `test/plan/record.test.mjs` refuses `from "kaal-hosting"` by a regular expression. Left alone, it would pass vacuously once the specifier changes, so it must name the new one.

  With those six, the throwaway rename turned hosting/T21–T24 GREEN, and `test:hosting`, `test:kaal` and `test:engineering` passed.

- **hosting/A8** [hosting/F17]: Hosting verifies its packed consumer experience in its own planned test, `test/plan/release.test.mjs`, in Hosting's lanes on Linux, Windows and macOS. It packs and installs through Hosting's own `execute`, from Hosting's build, so it depends on no other KAAL package: Testing's acceptance helpers depend on Hosting and cannot be used here. The installed package is reached by the consumer only through its name.

## Options considered for hosting/A7

The Owner's answer on #622 (comment 6503689689, `core/A36`) decides this. `hosting/C11` follows it.

| Option | What happens | Cost |
| --- | --- | --- |
| **A. One rename PR updates every reference** (proposed, as `core/A36`) | `hosting/C11` renames Hosting and updates every specifier, dependency entry, workspace selector and lockfile entry that names it, and nothing else. Each affected owner reviews. | One PR touches other owners' files, by the reference only. |
| B. One coordinated PR per importer | Each owner updates its own references in its own PR. | None of them can merge alone without breaking the workspace, so they merge as a set. |
| C. Keep the old name as an alias | A compatibility package `kaal-hosting` re-exports the new one. | A shim, which KAAL does not keep. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C10` PLAN: I5, F15–F17, A7, A8; hosting/T21–T24 | Hosting | `hosting/C9`, and the Owner's alignment on #622 |
| `hosting/C11` DO: the rename, every reference, and hosting/T21–T24 in Hosting's lanes | Hosting | `hosting/C10`, and the Owner's answer on A7 |
| Graph PLAN and DO: rename to `@kaihacksai/kaal-graph` (`core/C28` row 7) | Graph | `hosting/C11` |
| `core/C29` DO: rename to `@kaihacksai/kaal-core` (`core/C28` row 10) | Core | `hosting/C11`, Graph's DO |
| promotion of `kaal/hosting`, and publication of `@kaihacksai/kaal-hosting` 0.0.1 | Owner | `hosting/C11` |
