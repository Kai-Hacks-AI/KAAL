# Change Isolation: authorized migrations

> PLAN (engineering/C11): nothing below exists yet. The Owner reviewed this on #683 (comment 6542656994) and found the first DO's exact-path `MIGRATIONS` entry brittle: it froze one pull request's incidental file inventory instead of guarding the invariant. That DO is withdrawn from this Change, and `check.mjs` is back as the target holds it. This PLAN defines what makes a migration legitimate, and how the checker verifies it without a file list or a pull request's identity.

## The invariant

**Core travels alone, unless an authorized, bounded migration genuinely requires coordinated changes across capability boundaries.** `.github` travels alone, with no exception. Both stay the defaults: with no live migration, nothing here changes a verdict.

Exact filename equality is not that invariant, and two lessons follow from it (testing/F74):

| Case | Kind | Target | What it froze or missed | Correction |
| --- | --- | --- | --- | --- |
| The first DO's `MIGRATIONS` entry and its tests (#683, 48c70c7) | false RED | the invariant above | #657's 45 incidental paths. A legitimate migration that needs one more importer would be refused | engineering/F26: the scope is derived from the target's references, never listed |
| The same | false GREEN | the invariant above | any change to the listed files was admitted, whether it was the migration or unrelated work | engineering/F27–F28: each file is judged by the transformation it carries |

## What makes a migration legitimate

- **engineering/F25. Authorization is a declaration that is already governed.** A migration is authorized only by a declaration on the target branch's tip. That is the same source the checker itself is read from (`change-isolation.sh`), never the candidate. A candidate cannot authorize itself, so a declaration it adds or edits has no effect on its own judgment. The declaration reaches the target through an ordinary Engineering Change, so the Owner's approval of that Change is the authorization. It is collaborative Markdown with validated frontmatter, in `engineering/change-isolation/migrations/`:

  ```yaml
  transformation: rename-module   # closed vocabulary; the first and only kind
  from: kaal-hosting              # the module specifier being retired
  to: "@kaihacksai/kaal-hosting"  # its replacement
  owner: Hosting                  # the capability whose identity changes, resolved through ownership claims
  ```

  It names no paths, pull request or decision number. Its body gives the reason, as provenance only: the checker never reads it.
- **engineering/F26. The scope is derived.** Beyond Core and its supporting files, a Change under a live declaration may touch only:
  - the owner's tree, as the ownership claims attribute it;
  - files that **reference** `from` on the target.

  A reference is `from` alone, or `from/<subpath>` where `<subpath>` is one the owner package's `exports` declares on the target, used as:
  - a module specifier in `import`, `export … from`, `import()` or `require()`;
  - a package manifest's `name` or dependency key, or a lockfile entry;
  - an npm `-w` or `--workspace` selector.

  A namespaced identifier that only looks like a specifier is not a reference, so it is not renamed: hosting/C16's host fact `kaal-hosting/special-entries` and its rule ids `kaal-hosting/<rule>`, for instance (#679). Neither is prose that mentions the name. This is the definition Hosting's correction hosting/C19 (#685) uses, so the two stay consistent. Both sets are computed from the target's contents, so a migration needing one more importer is admitted, and a file with no reference is outside scope whatever its path.
- **engineering/F27. The transformation is verified.** For each touched file in scope, every reference to `from` on the target is a reference to `to` in the candidate. **The migration is atomic:** after the Change, no file in the repository references `from`, Core included. A partial migration, or one that leaves a reference elsewhere, is refused, naming each remaining reference.
- **engineering/F28. Residue is visible.** A line that changes in an in-scope file outside the owner's tree, and that the substitution does not explain, is **residue**. The verdict lists it by file and line. Whether residue is a legitimate consequence of the migration is a judgment no check decides, so it belongs to Review (testing/F75). The Owner decides below whether residue is refused or is admitted for review.
- **engineering/F29. Authorization expires by itself.** A declaration is live only while some file on the target references `from`. Once its migration lands, no reference remains, so it can admit nothing, and it is **spent**. The Engineering lane reports a spent declaration as failed, naming it. That makes a governed Engineering Change remove it promptly. The code holds no migration-specific branch: `rename-module` is one generic transformation, and each migration is data that expires.
- **engineering/N13. The defaults are unchanged.** If no live declaration exists, "Core travels alone" applies as it does today. A declaration never admits a `.github` path. A malformed declaration never applies, and Engineering's lane reports it. Malformed means an unknown `transformation`, a missing or empty `from` or `to`, `from` equal to `to`, an `owner` the ownership claims do not resolve, or a frontmatter outside the schema.

## What the checker needs

Today `check.mjs` decides from paths alone. F26–F28 need contents. `change-isolation.sh` already reads the target's checker from Git. It would also supply, read from Git and never checked out, built or run:
- each changed path's target and candidate bytes;
- the target's live declarations;
- the target's references to each declaration's `from`.

The `pull_request_target` safety model is unchanged, because the candidate's bytes are data. `check.mjs` stays one file that defines the rules. It gains `rename-module` and a content input, and its path-only mode stays for every Change that does not touch Core.

## #657 under this design

I checked this against #657 at 38960b7, as its target `kaal/hosting` holds it. 62 paths change: 14 in Core and 3 supporting files. The other 45 are in Hosting's tree or reference `kaal-hosting` on the target. So F26 admits all of them, with no list. Three files outside Hosting's tree carry residue under F28:

| File | Residue | Why the rename causes it |
| --- | --- | --- |
| `engineering/boundary.test.mjs` | `OUTSIDE` reordered | the list is sorted, and `@` sorts first |
| `engineering/lanes/evidence.test.mjs` | the capture key now takes all but the last path segment, not the first; the expected keys are reordered | a scoped name contains `/`; the sort again |
| `packages/skills/kaal-testing/evidence.kaal.json` | one evidence `sha256` | it digests a file the rename changed |

None is a pure substitution. Each follows from the rename, and a reviewer can confirm that from the lines the verdict lists. If residue is refused, #657 cannot pass: it would be a false RED of the same kind as the first DO's.

## For the Owner to decide

**Residue (F28):**
1. **Admit it for review** (recommended). The check passes and lists every residue line. The Owner's approval of the migration Change is the validation. A file outside scope, a reference left behind, or no live declaration still fails.
2. **Refuse it.** Only pure substitutions pass. #657 would then need its three consequential edits made elsewhere, which they cannot be.

## Test Cases

These go in `engineering/change-isolation/check.test.mjs`. Each runs on fixtures with a target tree, a declaration and a candidate, and is first observed RED against the deliberately wrong implementation named. A RED that shows only a missing export counts as blocked, not as evidence.

| Test | Checks | BRITTLE | Deliberately wrong implementation that makes it RED |
| --- | --- | --- | --- |
| engineering/T47 | A migration whose importers differ from any earlier set, with one more or other files, passes | false RED | One that compares to a file list |
| engineering/T48 | Changes inside the owner's tree pass, whatever their paths | false RED | One that requires every file to be a pure substitution |
| engineering/T49 | Without a live declaration, Core with renamed importers fails "Core travels alone" | false GREEN | One that infers a migration from the shape of the change |
| engineering/T50 | A declaration the candidate adds or edits does not authorize the candidate | false GREEN | One that reads declarations from the candidate |
| engineering/T51 | Under a live declaration, a changed file that does not reference `from` on the target fails, named | false GREEN | One that admits any file once a declaration is live |
| engineering/T52 | A touched importer that keeps a `from` reference fails, and so does an untouched file that still references `from`, each named | false GREEN | One that judges only the touched files, or only paths |
| engineering/T58 | A namespaced identifier that is not an exported subpath, such as `kaal-hosting/special-entries`, is neither in scope nor required to change, and keeping it does not break atomicity. An exported subpath such as `kaal-hosting/conformance` is a reference | both | One that treats every `from/…` string as a reference |
| engineering/T53 | Residue in an importer is listed by file and line, and is refused or admitted as the Owner decides; a pure substitution lists none | both | One that ignores residue, or refuses the sort and digest consequences of a pure rename |
| engineering/T54 | A spent declaration admits nothing, and the lane reports it, named | false GREEN | One that keeps a declaration live after its migration lands |
| engineering/T55 | Malformed declarations never apply and are reported: an unknown `transformation`, a missing `to`, `from` equal to `to`, an unresolved `owner`, and an unknown frontmatter member | false GREEN | One that defaults an unknown kind or member |
| engineering/T56 | A `.github` path fails ".github travels alone" under any declaration | false GREEN | One that lets a declaration cover `.github` |
| engineering/T57 | Replay: #657's change at 38960b7, against its target, passes with exactly the three residue files above listed | acceptance | — |

## Scope

This is a PLAN: Markdown only. Its DO changes `check.mjs`, `check.test.mjs` and `change-isolation.sh`, adds the migrations directory, and adds #657's declaration as its first entry. Each of these goes in its own governed Change, in that order, after the Owner approves this PLAN. It changes no ruleset and authorizes no merge of #657, and no synchronization, promotion or publication.
