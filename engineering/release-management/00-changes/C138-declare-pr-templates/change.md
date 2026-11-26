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

- **T1540** is rewritten (parked `.red.mjs`): release's declaration file holds exactly SYNC, PROMOTION and WIRE, in Hosting's form; WIRE keeps `Source`, `Target`, `Verification` in order; none carries a GitHub word, a comment syntax or a recognition rule; HOW TO WORK is not declared.
- **A new Case** (id confirmed with the release thread at the DO): the reader returns the registry of the seven TYPEs from the declarations it is given; a TYPE with no declaration is UNKNOWN; DEFAULT is a finding; a template that does not open with `Change` is accepted.
- **T164** and the other Cases of the reader that pin `readTemplates` and the first-chapter rule are amended in this PLAN, in a follow-up commit once the exact form of Hosting's reader is on the line; the DO changes no Case.
- T640, T650, T660 and T830 (amended earlier to ignore an optional declaration line) are left as they are: harmless, and no longer needed once the sources are not touched.

## Dependencies

The DO starts when Hosting's declaration form (C113's DO) and Engineering's `pull-request-types.json` (C37's DO) are on the line, and when `kaal-change` declares its four types for the registry to be complete. `readTemplates`' other consumers (`ROUTE`, `CLASSES`, `show-wip.json`, `LANES`) become consumers of C37's file each in its own Change; this Change does not touch them.

## FAR

1. **Regression.** Moving the reader changes what T164 and its neighbours pin; they are amended in this PLAN, not in the DO.
2. **Accept list.** None.
3. **Feature.** T1540 and the new reader Case.

## Not in this Change

No install (a WIRE), no `.github` edit, no flag, no ruleset, no template text, no declaration of another capability's types, no change to `envelope.mjs` beyond reading the declarations.
