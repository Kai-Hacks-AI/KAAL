# C138 change

## Reason

`verify Envelope` reads its rules from `readTemplates`, which parses hand-written template files, and no template declares its TYPE. The Owner and CPO returned this Change to PLAN: all seven types including WIRE, DEFAULT judged as an invalid route, no first-chapter assumption, and one envelope definition with the generator and the verifier as consumers. Hosting owns the generator and the declaration form (hosting/C113, approved); Engineering owns the type list, owners and eligible routes (engineering/C37, approved); each capability declares the chapters of the types it owns. This PLAN aligns release's share to those contracts.

## What Release owns, and what it consumes

- **Release declares SYNC, PROMOTION and WIRE** (the owners named in C37): one file, `packages/kaal-release/13-source/pull-request-types/kaal-release.json`, in Hosting's form (hosting/C113): `{ "types": [ { type, intro?, chapters: [ { name, guidance } ], raise: {...} } ] }`, no GitHub word and no comment syntax. WIRE keeps its chapters `Source`, `Target`, `Verification`, in that order. The content comes from the existing sources (`05-src/wiring/templates/{sync,promotion,wire}.md`); the HOW TO WORK chapter is not declared (removed as decoupled, as C37 records). **Release declares no PLAN, DO, ACT or HOTFIX**: those are `kaal-change`'s.
- **Release consumes** the type list, owners and eligible routes from Engineering's `pull-request-types.json` (C37), and each owner's declaration file, all read at the base revision, never from the head.
- **Hosting renders the templates.** The hand-written sources under `05-src/wiring/templates` are not edited here and no declaration line is added to them: the generator writes the `KAAL-PR-template` line and the rendered bytes are what a WIRE installs, on Hosting's own Change. The sources retire when the rendered ones are installed.

## What changes in the DO

1. The declaration file of release above, with its three types.
2. `verify Envelope` reads declarations instead of parsing templates: `readTemplates` (A40) gives way to a reader of the owners' declaration files that returns the registry TYPE to chapters. A typed template is no longer required to open with `Change`; a TYPE's chapters are what its owner declares, in order.
3. **DEFAULT is judged.** DEFAULT is named invalid by Engineering's file. A pull request that falls to DEFAULT, a default template in the repository, or a declaration named DEFAULT is a finding with its own reason, not unsupported and never a pass.
4. **The type is established from content and Git evidence, never from the route** (C37, CPO): the changed paths against the areas of each TYPE in `write-areas.json`, plus Git ancestry for a SYNC (release/C152). Route eligibility only narrows what is allowed. An ambiguous or unreadable fact is UNKNOWN.
5. **One definition, no parallel list.** The verifier carries no hand-kept chapter list; it reads the declarations. A type whose owner has declared nothing yet (`kaal-change`'s four, until its own Change) reads UNKNOWN for that type, never a pass.

## Cases

All Case expectations are written in this PLAN, parked as `.red.mjs` (red until the DO builds the reader); the DO changes none.

- **T1541 (new, `T1541.red.mjs` here; the id is confirmed with the release thread at the DO):** the reader returns the registry of all seven TYPEs from the declarations it is given, with the WIRE chapters `Source`, `Target`, `Verification` in order; a TYPE nobody declared is UNKNOWN (one owner missing, one TYPE left out of its owner's file, none at all); DEFAULT is invalid, whether declared, listed as a TYPE or missing from the invalid list; a declaration by a capability that does not own the TYPE, a duplicate, a chapter without a name and a TYPE without chapters are findings and are not registered; a first chapter other than `Change` is accepted; the reader holds no chapter list of its own.
- **T1540 (rewritten, parked):** release's declaration file holds exactly SYNC, PROMOTION and WIRE in Hosting's form; WIRE keeps its three chapters in order; none carries a GitHub word, a comment syntax or a recognition rule; HOW TO WORK is not declared.
- **Amended here, parked, by what each pinned:**
  - **T164 (A40)**, the template reader Case: now the declaration reader's malformed, duplicate, foreign and chapterless findings, and no recognition by text; `readTemplates` is no longer exported.
  - **T185 (A40)**: DEFAULT was registered when a default file declared it; it is never registered and is a finding with its own reason.
  - **T186 (F17)**: a `DEFAULT:` title was judged by the DEFAULT chapters; it is a finding naming an invalid route, with or without a registry entry; a TYPE nobody declared is not judged and is never a pass.
  - **T174 (F18)** and **T175 (A41)**: the fallback template holds no declaration (DEFAULT is not a TYPE); parked, the DO edits the fallback source.
  - **T182 (F19)**, **T183 (F18)** and **T187 (G52, C20)**: documentation Cases, amended with the texts they read, so they are GREEN now. F19, F18, F17 section 2 and A40 are amended in this PLAN: DEFAULT is not a TYPE and is never in the registry, the fallback holds no declaration, and the reader replaces `readTemplates`.
- **Left as they are, and why:** T161 and T191 pass `DEFAULT` only as a word of a title or as an extra registry key and expect FAIL, which stays true; T640, T650, T660 and T830 (amended earlier to ignore an optional declaration line) are harmless and no longer needed once the sources are not touched.

## Dependencies

The DO starts when Hosting's declaration form (C113's DO) and Engineering's `pull-request-types.json` (C37's DO) are on the line, and when `kaal-change` declares its four types for the registry to be complete. `readTemplates`' other consumers (`ROUTE`, `CLASSES`, `show-wip.json`, `LANES`) become consumers of C37's file each in its own Change; this Change does not touch them.

## FAR

1. **Regression.** Moving the reader changes what T164 and its neighbours pin; they are amended in this PLAN (above), not in the DO. T164, T174, T175, T185 and T186 are RED parked until the DO.
2. **Accept list.** None.
3. **Feature.** T1540 and T1541.

## Not in this Change

No install (a WIRE), no `.github` edit, no flag, no ruleset, no template text, no declaration of another capability's types, no change to `envelope.mjs` beyond reading the declarations.
