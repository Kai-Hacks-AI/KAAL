# hosting/C113 change

## From

Pull request templates and the body builder are written by hand in two places. Each capability that owns a pull request type (Release owns PROMOTION and SYNC, Change owns the PLAN semantics, and so on) edits a template text that no capability generates, and a chapter changed in one place is missing in the other.

## To

1. **A declaration, owned by the capability that owns the type.** A capability declares each of its pull request types in one JSON file of its own package. A type is: `type` (an upper-case name), `chapters` (in order; each `{ name, guidance }`, the `guidance` being the text that tells the author what the chapter holds), and an optional `intro` (the text above the first chapter). The declaration is KAAL data. It holds no GitHub word, no file name, no comment syntax and no recognition rule. Engineering's `pull-request-types.json` (C37) lists the types a consumer uses, names each type's content owner and holds the recognition (the KAAL branch convention); it holds no chapter, and the owners declare those here. Hosting owns the format of this file, which is the interface the content owners use.
2. **A generator, Hosting's, as the GitHub adapter.** `renderTemplate(declaration)` returns the text of one template, and `renderBody(declaration, chapters)` returns a pull request body: the chapters in the declared order, each under `## <name>`, a missing or an unknown chapter refused with a named error. Both are pure and deterministic: the same declaration gives the same bytes, with LF line ends, on every host. The GitHub parts are Hosting's alone: the `<!-- ... -->` comment form for `intro` and `guidance`, the `KAAL-PR-template: <TYPE>` declaration line (the line release/C138 reads), and the file name `<type in lower case>.md`.
3. **A check, not a writer.** `checkTemplates(declarations, directory)` compares the committed templates in `directory` with the render and names each type whose file is missing, differs, or has no declaration. Hosting never writes `.github`: delivery stays Engineering first, then a WIRE, with Kai's go for the WIRE.
4. **The caller names the declarations.** The generator discovers nothing. Its caller (Release's wiring, a Case) passes the declaration files. Where a capability keeps its file is Engineering's layout decision; one file per capability at `13-source/pull-request-types/<capability>.json`, the target layout, as Engineering confirmed.
5. **DEFAULT is not a type.** The generator renders no fallback template and refuses a declaration named `DEFAULT` (Owner and CPO, via release/C138).

## Because

One truth for each type, written once by its owner. Release's API body builder reads the same declaration the templates are rendered from, so they cannot disagree, and a second host would add its own renderer without touching any declaration.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's existing Cases (T1 to T302) stay GREEN. The generator is new code; nothing existing changes.
2. Accept list: none.
3. Feature Cases, RED on `main` today (drafts T303 to T309, `.red.mjs`):
   - hosting/T303: `renderTemplate` of a declaration gives the `KAAL-PR-template: <TYPE>` line first, the intro, then each chapter as `## <name>` followed by its guidance as a comment, byte for byte, with LF.
   - hosting/T304: the same declaration renders the same bytes twice, and with CRLF in the declaration's text.
   - hosting/T305: `renderBody` puts the given chapter texts under the declared headings in order; a missing chapter, an unknown chapter and an empty chapter list are each refused with a named error.
   - hosting/T306: a declaration that is not valid (a non-upper-case type, a chapter without a name, a repeated chapter name, a field outside the format) is refused before anything renders; `DEFAULT` is refused.
   - hosting/T307: `checkTemplates` names a missing file, a differing file and a file with no declaration, and passes when all match.
   - hosting/T308: the format holds no GitHub word: a declaration with a file name, comment syntax or recognition field is refused.
   - hosting/T309: Hosting's shipped `docs/` name no Change, no `engineering/` path and no `plan/` path (T218 still holds), and the generator imports no `node:fs`.

## Questions, settled by the reading below unless said otherwise

- **One file or one per capability.** Settled by the revised C37: Engineering's file lists the seven types and names the owners (`kaal-change` for PLAN, DO, ACT, HOTFIX; `kaal-release` for SYNC, PROMOTION, WIRE) and holds no chapter or recognition. Each owner declares its own types in its own package, in the form this Change defines.
- **Chapters of PLAN and DO.** They have no source. Whoever owns them (Change, release or Engineering) writes the first declaration; Hosting does not decide their content.
- **The body builder's other home.** Release's API body builder becomes a caller of `renderBody` in Release's own Change.

## Not in this Change

Any DO. Writing or installing a template (a WIRE, Kai's go); the content of any type; a second host; the verifier (Release); Engineering's definition file; version, publication or pin moves.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: the format and its validator, `renderTemplate`, `renderBody`, `checkTemplates`, T303 to T309 as delivered Cases, the ids allocated in `04-test/package-check/testing.md`, the element texts of `interface.md`, the README and Skill entry, and Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
