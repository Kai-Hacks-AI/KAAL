# hosting/C113 change

## From

Pull request templates and the body builder are written by hand in two places. Each capability that owns a pull request type (Release owns PROMOTION and SYNC, Change owns the PLAN semantics, and so on) edits a template text that no capability generates, and a chapter changed in one place is missing in the other.

## To

1. **A declaration, owned by the capability that owns the type.** A capability declares each of its pull request types in one JSON file of its own package. A type is: `type` (an upper-case name), `chapters` (in order; each `{ name, guidance }`, the `guidance` being the text that tells the author what the chapter holds), and an optional `intro` (the text above the first chapter). The declaration is KAAL data. It holds no GitHub word, no file name, no comment syntax and no recognition rule. Engineering's `pull-request-types.json` (C37) lists the types a consumer uses, names each type's content owner and holds the recognition (the KAAL branch convention); it holds no chapter, and the owners declare those here. Hosting owns the format of this file, which is the interface the content owners use.
2. **A generator, Hosting's, as the GitHub adapter.** `renderTemplate(declaration)` returns the text of one template, and `renderBody(declaration, chapters)` returns a pull request body: the chapters in the declared order, each under `## <name>`, a missing or an unknown chapter refused with a named error. Both are pure and deterministic: the same declaration gives the same bytes, with LF line ends, on every host. The GitHub parts are Hosting's alone: the `<!-- ... -->` comment form for `intro` and `guidance`, the `KAAL-PR-template: <TYPE>` declaration line (the line release/C138 reads), and the file name `<type in lower case>.md`.
3. **A check, not a writer.** `checkTemplates(declarations, directory)` compares the committed templates in `directory` with the render and names each type whose file is missing, differs, or has no declaration. Hosting never writes `.github`: delivery stays Engineering first, then a WIRE, with Kai's go for the WIRE.
4. **The caller names the declarations.** The generator discovers nothing. Its caller (Release's wiring, a Case) passes the declaration files. Where a capability keeps its file is Engineering's layout decision; one file per capability at `13-source/pull-request-types/<capability>.json`, the target layout, as Engineering confirmed.
5. **The agent path, one renderer, the owner's controls.** A declaration also holds `raise`: `base` and `head` (lists of branch name patterns, `*` for one segment, that a pull request of the type may be raised from and into), `autoMerge` (`squash`, `merge`, `rebase` or `none`; `none` when absent) and `draft` (true or false; false when absent) and `title` (rules the title must meet, for example patterns it must not match; none when absent). `raisePullRequest({ type, chapters, head, base, title }, declarations, { token })` is told no merge choice: it renders the body with `renderBody`, refuses before any call when the head, base or title is outside the type's `raise` rules, when the files the head changes (read through Hosting's revision interface) are outside the areas Engineering's `write-areas.json` (C36) allows the type, or when the chapters are refused, opens the pull request through GitHub's API (the transport Hosting reads open pull requests through), and enables auto-merge only with the method the owner declared. A CLI `kaal-hosting-pull-request` calls it with the chapters as a JSON file and takes no merge or draft option. Raising may take more than one step, and that is fine (Kai, 26 November): open the pull request, then enable auto-merge, or set the draft state once the checks allow it, each step the declaration calls for, in that order. The rules are not bent to fit one API call. If a later step is refused, the result names the steps done and the step that failed, and Hosting does not undo or work around it. Hosting only executes the declaration. It never merges and never approves; auto-merge only queues the pull request behind the required checks and approvals, so the gates still decide. If GitHub refuses auto-merge it reports that and does not merge directly. The token is the caller's, never read from a file or logged. Engineering's recognition (C37) and an owner's `raise` rules overlap; each owner's Change adds a Case that holds the two equal.
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
3. Feature Cases, RED on `main` today. They are executable drafts in this folder (`T303` to `T316`, `.red.mjs`, with `fixtures.mjs` and a local stand-in for GitHub's API; nothing reaches the network). Each fails on `main` for the missing behaviour (`renderTemplate is not a function`, no CLI file), and the DO turns them into delivered Cases **unchanged**: a Case that has to change returns to a PLAN.
   - hosting/T303: `renderTemplate` gives exact bytes: the `KAAL-PR-template: <TYPE>` line, the intro comment, each chapter as `## <name>` with its guidance as a comment, one line end at the end; with and without an intro.
   - hosting/T304: the same declaration renders the same bytes; CRLF in the declaration comes out as LF.
   - hosting/T305: `renderBody` gives exact bytes in the declared order whatever the key order; texts are trimmed and LF.
   - hosting/T306: `renderBody` refuses a missing, an unknown and an empty chapter, and a declaration without chapters, with `MISSING_CHAPTER`, `UNKNOWN_CHAPTER` and `INVALID_DECLARATION`, naming the chapter.
   - hosting/T307: eleven invalid declarations (lower-case type, `DEFAULT`, nameless or repeated chapter, an unknown field, guidance holding `-->`, a file name, comment syntax or recognition field, an auto-merge value outside the set, a title rule that is not a pattern) are refused by both renderers with `INVALID_DECLARATION`.
   - hosting/T308: `checkTemplates` on a real temporary directory passes when all match and names a missing, a differing and an undeclared file.
   - hosting/T309: the generator modules import no `node:fs`, `node:child_process` or `node:http`, and are shipped.
   - hosting/T310: `raisePullRequest` sends exactly `POST /repos/o/r/pulls` (title, head, base, the `renderBody` text, the declared draft flag) and then, because the owner declared it, `POST /graphql` `enablePullRequestAutoMerge` with the opened pull request's node id and the declared method (`SQUASH`, and `MERGE` for SYNC); the result lists the steps done.
   - hosting/T311: `none` or no `autoMerge` sends no second request; a caller-supplied `autoMerge`, `mergeMethod` or `draft` is refused (`caller-merge-choice`, `caller-draft-choice`) before any call; under every declared method no request merges, reviews or approves.
   - hosting/T312: an unlisted type, `DEFAULT`, a head or base outside `raise`, a title that meets a `forbid` rule and invalid chapters are each refused with `RAISE_REFUSED`, the rule and the owner, and nothing is sent.
   - hosting/T313: write boundaries: a changed path outside the type's write areas is refused and named; a path inside, and no changed path, pass; a type with no declared areas fails closed; `*` is one whole segment.
   - hosting/T314: partial failures: a refused first step ends there (`STEP_FAILED`, no step done, one request); a refusal of the second step (HTTP 403, a GraphQL error in a 200, a network error) reports `steps: ["open"]`, `failed: "auto-merge"` and the number and URL of the pull request that exists, with no retry, no merge, no close and no delete, and no token in the message.
   - hosting/T315: no token is refused before any call; the token is sent only in the `Authorization` header, never in a body, an error or any console output.
   - hosting/T316: the CLI `kaal-hosting-pull-request` raises from JSON files and the `GITHUB_TOKEN` variable (and `KAAL_GITHUB_API` for a stand-in), prints the pull request URL, exits non-zero on any refusal naming the rule, sends nothing on a refusal, and rejects `--auto-merge`, `--merge-method`, `--draft` and `--merge`.

## The interface the Cases fix

All from `@kaihacksai/kaal-hosting`; the CLI is `scripts/pull-request-cli.mjs`, bin `kaal-hosting-pull-request`.

- `renderTemplate(declaration): string`, `renderBody(declaration, chapters): string`, `checkTemplates(declarations, directory): Promise<{ ok, problems: { file, problem: "missing" | "differs" | "undeclared" }[] }>`.
- `raisePullRequest({ repo, type, chapters, head, base, title }, declarations, { token, typeList, writeAreas, changedPaths, fetch?, api? }): Promise<{ number, url, steps }>`. `typeList` is Engineering's list as `{ types: [{ type, owner }], invalid: [...] }`; `writeAreas` is `{ <TYPE>: [path patterns] }` (`*` one segment, `**` any depth). The caller adapts Engineering's files to these shapes.
- Errors carry a `code`: `INVALID_DECLARATION`, `MISSING_CHAPTER`, `UNKNOWN_CHAPTER`, `RAISE_REFUSED` (with `rule` and `owner`) and `STEP_FAILED` (with `steps`, `failed`, and `number` and `url` once the pull request exists).

## Questions, settled by the reading below unless said otherwise

- **One file or one per capability.** Settled by the revised C37: Engineering's file lists the seven types and names the owners (`kaal-change` for PLAN, DO, ACT, HOTFIX; `kaal-release` for SYNC, PROMOTION, WIRE) and holds the recognition and no chapter. Each owner declares its own types in its own package, in the form this Change defines.
- **Chapters of PLAN and DO.** They have no source. Whoever owns them (Change, release or Engineering) writes the first declaration; Hosting does not decide their content.
- **The body builder's other home.** Release's API body builder becomes a caller of `renderBody` in Release's own Change.

## Not in this Change

Any DO. Writing or installing a template (a WIRE, Kai's go); the content of any type; a second host; the verifier (Release); merging or approving a raised pull request; Engineering's definition file; version, publication or pin moves.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: the format and its validator, `renderTemplate`, `renderBody`, `checkTemplates`, T303 to T316 as delivered Cases, the ids allocated in `04-test/package-check/testing.md`, the element texts of `interface.md`, the README and Skill entry, and Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
