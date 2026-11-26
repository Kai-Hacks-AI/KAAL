# hosting/C113 change

## From

Pull request templates and the body builder are written by hand in two places. Each capability that owns a pull request type (Release owns PROMOTION and SYNC, Change owns the PLAN semantics, and so on) edits a template text that no capability generates, and a chapter changed in one place is missing in the other.

## To

1. **A declaration, owned by the capability that owns the type.** A capability declares each of its pull request types in one JSON file of its own package. A type is: `type` (an upper-case name), `chapters` (in order; each `{ name, guidance }`, the `guidance` being the text that tells the author what the chapter holds), and an optional `intro` (the text above the first chapter). The declaration is KAAL data. It holds no GitHub word, no file name, no comment syntax and no recognition rule. Engineering's `pull-request-types.json` (C37) lists the types a consumer uses, names each type's content owner and holds the recognition (the KAAL branch convention); it holds no chapter, and the owners declare those here. Hosting owns the format of this file, which is the interface the content owners use.
2. **A generator, Hosting's, as the GitHub adapter.** `renderTemplate(declaration)` returns the text of one template, and `renderBody(declaration, chapters)` returns a pull request body: the chapters in the declared order, each under `## <name>`, a missing or an unknown chapter refused with a named error. Both are pure and deterministic: the same declaration gives the same bytes, with LF line ends, on every host. The GitHub parts are Hosting's alone: the `<!-- ... -->` comment form for `intro` and `guidance`, the `KAAL-PR-template: <TYPE>` declaration line (the line release/C138 reads), and the file name `<type in lower case>.md`.
3. **A check, not a writer.** `checkTemplates(declarations, directory)` compares the committed templates in `directory` with the render and names each type whose file is missing, differs, or has no declaration. Hosting never writes `.github`: delivery stays Engineering first, then a WIRE, with Kai's go for the WIRE.
4. **The caller names the declarations.** The generator discovers nothing. Its caller (Release's wiring, a Case) passes the declaration files. Where a capability keeps its file is Engineering's layout decision; one file per capability at `13-source/pull-request-types/<capability>.json`, the target layout, as Engineering confirmed.
5. **The agent path, one renderer, the owner's controls.** A declaration also holds `raise`: `base` and `head` (lists of branch name patterns, `*` for one segment, that a pull request of the type may be raised from and into), `autoMerge` (`squash`, `merge`, `rebase` or `none`; `none` when absent) and `draft` (true or false; false when absent) and `title` (rules the title must meet, for example patterns it must not match; none when absent). `raisePullRequest({ type, chapters, head, base, title }, declarations, { token })` is told no merge choice: it renders the body with `renderBody`, refuses before any call when the head, base or title is outside the type's `raise` rules, when the files the head changes (read through Hosting's revision interface) are outside the areas Engineering's `write-areas.json` (C36) allows the type, or when the chapters are refused, opens the pull request through GitHub's API (the transport Hosting reads open pull requests through), and enables auto-merge only with the method the owner declared. A CLI `kaal-hosting-pull-request` calls it with the chapters as a JSON file and takes no merge or draft option. Hosting only executes the declaration. It never merges and never approves; auto-merge only queues the pull request behind the required checks and approvals, so the gates still decide. If GitHub refuses auto-merge it reports that and does not merge directly. The token is the caller's, never read from a file or logged. Engineering's recognition (C37) and an owner's `raise` rules overlap; each owner's Change adds a Case that holds the two equal.
6. **DEFAULT is not a type.** The generator renders no fallback template and refuses a declaration named `DEFAULT` (Owner and CPO, via release/C138).

## Because

One truth for each type, written once by its owner. Release's API body builder reads the same declaration the templates are rendered from, so they cannot disagree, and a second host would add its own renderer without touching any declaration.

## Which rule comes from which owner

Raising a pull request follows everything agreed for its type, and the template is one part of it. Hosting holds none of these rules and reads each from its owner; it checks them before the first call and opens nothing on a breach.

| Rule | Owner and source | How Hosting gets it |
| --- | --- | --- |
| Chapters and intro of PLAN, DO, ACT, HOTFIX | Change (PDCA), `declare` file of `kaal-change` | the declaration the caller passes |
| Chapters and intro of SYNC, PROMOTION, WIRE | Release, declaration of `kaal-release` | the declaration the caller passes |
| Which types exist and who owns each; DEFAULT invalid | Engineering, `pull-request-types.json` (C37) | the file the caller passes; a type not listed, or `DEFAULT`, is refused |
| Head and base the type may be raised from and into | the content owner's `raise` rules; Engineering's recognition (C37) and Release's routes are the judge | the declaration; a Case per owner holds the two equal |
| Write areas the type may carry | Engineering, `write-areas.json` (C36) | the file the caller passes, with the changed paths read through Hosting |
| Merge method and whether auto-merge is enabled | the content owner (`autoMerge`), within Release's rulesets | the declaration; never the caller |
| Title rules (for example no Change id in a title) | the content owner (`title`), Release's semantics rule | the declaration |
| Draft or ready | the content owner (`draft`) | the declaration |
| Required checks, approval, whether the PR merges | GitHub rulesets (Release) | not Hosting's; auto-merge only queues behind them |

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's existing Cases (T1 to T302) stay GREEN. The generator is new code; nothing existing changes.
2. Accept list: none.
3. Feature Cases, RED on `main` today (drafts T303 to T312, `.red.mjs`):
   - hosting/T303: `renderTemplate` of a declaration gives the `KAAL-PR-template: <TYPE>` line first, the intro, then each chapter as `## <name>` followed by its guidance as a comment, byte for byte, with LF.
   - hosting/T304: the same declaration renders the same bytes twice, and with CRLF in the declaration's text.
   - hosting/T305: `renderBody` puts the given chapter texts under the declared headings in order; a missing chapter, an unknown chapter and an empty chapter list are each refused with a named error.
   - hosting/T306: a declaration that is not valid (a non-upper-case type, a chapter without a name, a repeated chapter name, a field outside the format) is refused before anything renders; `DEFAULT` is refused.
   - hosting/T307: `checkTemplates` names a missing file, a differing file and a file with no declaration, and passes when all match.
   - hosting/T308: the format holds no GitHub word: a declaration with a file name, comment syntax or recognition field is refused.
   - hosting/T310: `raisePullRequest` sends one request whose body equals `renderBody` of the same input, with the given head, base and title and the declared draft flag, and sends nothing when the chapters are refused or the head or base is outside the declared `raise` rules (checked against a recorded local stand-in for the API, never the live host).
   - hosting/T311: `autoMerge` comes only from the declaration: a type declaring `none` (or nothing) is raised without auto-merge, a type declaring a method gets exactly that method, and the API and the CLI accept no merge or draft choice from the caller. Neither merges or approves, a refusal of auto-merge is reported without merging directly, the token is never printed or stored, and the CLI exits non-zero with the named error when a raise is refused (checked against a local stand-in for the API).
   - hosting/T312: `raisePullRequest` refuses, before any call, each breach in the table: an unlisted type or `DEFAULT`, a head or base outside `raise`, a changed path outside the type's write areas, and a title that meets a declared `title` rule; the error names the rule and the owner's source.
   - hosting/T309: Hosting's shipped `docs/` name no Change, no `engineering/` path and no `plan/` path (T218 still holds), and the generator imports no `node:fs`.

## Questions, settled by the reading below unless said otherwise

- **One file or one per capability.** Settled by the revised C37: Engineering's file lists the seven types and names the owners (`kaal-change` for PLAN, DO, ACT, HOTFIX; `kaal-release` for SYNC, PROMOTION, WIRE) and holds the recognition and no chapter. Each owner declares its own types in its own package, in the form this Change defines.
- **Chapters of PLAN and DO.** They have no source. Whoever owns them (Change, release or Engineering) writes the first declaration; Hosting does not decide their content.
- **The body builder's other home.** Release's API body builder becomes a caller of `renderBody` in Release's own Change.

## Not in this Change

Any DO. Writing or installing a template (a WIRE, Kai's go); the content of any type; a second host; the verifier (Release); merging or approving a raised pull request; Engineering's definition file; version, publication or pin moves.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: the format and its validator, `renderTemplate`, `renderBody`, `checkTemplates`, T303 to T312 as delivered Cases, the ids allocated in `04-test/package-check/testing.md`, the element texts of `interface.md`, the README and Skill entry, and Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
