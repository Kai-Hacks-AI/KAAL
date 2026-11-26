# hosting/C113 change

## From

Pull request templates and the body builder are written by hand in two places. Each capability that owns a pull request type (Release owns PROMOTION and SYNC, Change owns the PLAN semantics, and so on) edits a template text that no capability generates, and a chapter changed in one place is missing in the other.

## To

1. **A declaration, owned by the capability that owns the type.** A capability declares each of its pull request types in one JSON file of its own package. A type is: `type` (an upper-case name), `chapters` (in order; each `{ name, guidance }`, the `guidance` being the text that tells the author what the chapter holds), and an optional `intro` (the text above the first chapter). The declaration is KAAL data. It holds no GitHub word, no file name, no comment syntax and no recognition rule. Engineering's `pull-request-types.json` (C37) lists the types a consumer uses, names each type's content owner and holds the recognition (the KAAL branch convention); it holds no chapter, and the owners declare those here. Hosting owns the format of this file, which is the interface the content owners use.
2. **A generator, Hosting's, as the GitHub adapter.** `renderTemplate(declaration)` returns the text of one template, and `renderBody(declaration, chapters)` returns a pull request body: the chapters in the declared order, each under `## <name>`, a missing or an unknown chapter refused with a named error. Both are pure and deterministic: the same declaration gives the same bytes, with LF line ends, on every host. The GitHub parts are Hosting's alone: the `<!-- ... -->` comment form for `intro` and `guidance`, the `KAAL-PR-template: <TYPE>` declaration line (the line release/C138 reads), and the file name `<type in lower case>.md`.
3. **A check, not a writer.** `checkTemplates(declarations, directory)` compares the committed templates in `directory` with the render and names each type whose file is missing, differs, or has no declaration. Hosting never writes `.github`: delivery stays Engineering first, then a WIRE, with Kai's go for the WIRE.
4. **Rendering takes declarations as data; raising takes no authority from its caller.** `renderTemplate`, `renderBody` and `checkTemplates` are pure over the declarations they are given, and the generator discovers nothing. `raisePullRequest` is different: what it enforces is *authority*, and authority is never selected by the caller. It reads the owners' policy itself, from the **base revision** of the pull request (never from the head being raised, which could carry a permissive copy), and it establishes the changed paths itself from the revision-bound diff. Where a capability keeps its declaration is Engineering's layout decision: one file per capability at `packages/<capability>/13-source/pull-request-types/<capability>.json`, shaped `{ "types": [declaration, ...] }`, the target layout as Engineering confirmed.
5. **The agent path, one renderer, the owners' controls.** A declaration also holds `raise`: `head` and `base` (lists of branch name patterns, `*` for one segment, that a pull request of the type may be raised from and into), `autoMerge` (`squash`, `merge`, `rebase` or `none`; `none` when absent), `draft` (false when absent) and `title` (`{ forbid: [regular expressions] }`; no rule when absent). `raisePullRequest({ repo, type, chapters, head, base, title }, { token, fetch?, api? })` is told no merge choice, no policy and no path. It does this, in order:
   1. refuses before any call a caller-supplied `declarations`, `typeList`, `writeAreas`, `changedPaths`, `changed` or `policy` (in the request or the options), a caller `autoMerge`, `mergeMethod` or `draft`, and a missing token;
   2. resolves the head and the base to revisions (`GET /repos/{repo}/commits/{ref}`) and compares them (`GET /repos/{repo}/compare/{base}...{head}`), refusing when either does not resolve, the compare fails, or it lists 300 files (cut off, so unknown);
   3. reads, at the base revision (`GET /repos/{repo}/contents/{path}?ref={base sha}`), Engineering's type list, Engineering's write areas and the declaration file of the type's owner, refusing when any is missing, is not JSON, or does not hold the type;
   4. checks the declaration's `raise` rules (head, base, title), the chapters, and that every changed path lies in an area whose phase the type may carry, reading C36's `areas` (a path or a `*` pattern, matched on a whole-segment prefix of the part after `packages/<package>/`), its `legacy` renames and its `pullRequests[].may`; a path in no area, in a delegated or transition area, or an empty diff refuses; unknown refuses;
   5. opens the pull request (`POST /repos/{repo}/pulls`) with the rendered body and the declared draft flag, then checks that the opened head is the revision it checked (if not: `STEP_FAILED`, `failed: "revision"`, nothing more is done);
   6. enables auto-merge (`POST /graphql`, `enablePullRequestAutoMerge`, the opened pull request's node id and the declared method) only when the declaration says a method.
   A CLI `kaal-hosting-pull-request` calls it with the chapters as a JSON file and the token from `GITHUB_TOKEN` (`KAAL_GITHUB_API` names a stand-in); it accepts no merge, draft or authority option. A test injects the **transport** (`fetch`, `api`), never data: production authority is not caller-selected. Raising may take more than one step, and that is fine (Kai, 26 November): the rules are not bent to fit one API call. If a later step is refused, the result names the steps done and the step that failed, and Hosting does not undo or work around it. Hosting never merges and never approves; auto-merge only queues the pull request behind the required checks and approvals, so the gates still decide. The token is the caller's, never read from a file or logged. Engineering's recognition (C37) and an owner's `raise` rules overlap; each owner's Change adds a Case that holds the two equal.
6. **DEFAULT is not a type.** The generator renders no fallback template and refuses a declaration named `DEFAULT` (Owner and CPO, via release/C138).

## Because

One truth for each type, written once by its owner. Release's API body builder reads the same declaration the templates are rendered from, so they cannot disagree, and a second host would add its own renderer without touching any declaration.

## Which rule comes from which owner

Raising a pull request follows everything agreed for its type, and the template is one part of it. Hosting holds none of these rules and reads each from its owner; it checks them before the first call and opens nothing on a breach.

| Rule | Owner and source | How Hosting gets it |
| --- | --- | --- |
| Chapters and intro of PLAN, DO, ACT, HOTFIX | Change (PDCA), `declare` file of `kaal-change` | the owner's declaration file at the base revision |
| Chapters and intro of SYNC, PROMOTION, WIRE | Release, declaration of `kaal-release` | the owner's declaration file at the base revision |
| Which types exist and who owns each; DEFAULT invalid | Engineering, `pull-request-types.json` (C37) | the file at the base revision; a type not listed, or `DEFAULT`, is refused |
| Head and base the type may be raised from and into | the content owner's `raise` rules; Engineering's recognition (C37) and Release's routes are the judge | the owner's declaration at the base revision; a Case per owner holds the two equal |
| Write areas the type may carry | Engineering, `write-areas.json` (C36) | the file at the base revision, judged against the revision-bound diff Hosting reads |
| Merge method and whether auto-merge is enabled | the content owner (`autoMerge`), within Release's rulesets | the owner's declaration at the base revision; never the caller |
| Title rules (for example no Change id in a title) | the content owner (`title`), Release's semantics rule | the owner's declaration at the base revision |
| Draft or ready | the content owner (`draft`) | the owner's declaration at the base revision |
| Required checks, approval, whether the PR merges | GitHub rulesets (Release) | not Hosting's; auto-merge only queues behind them |

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's existing Cases (T1 to T302) stay GREEN. The generator is new code; nothing existing changes.
2. Accept list: none.
3. Feature Cases, RED on `main` today. They are executable drafts in this folder (`T303` to `T317`, `.red.mjs`, with `fixtures.mjs` and a local stand-in for GitHub's API; nothing reaches the network). Each fails on `main` for the missing behaviour (`renderTemplate is not a function`, no CLI file), and the DO turns them into delivered Cases **unchanged**: a Case that has to change returns to a PLAN.
   - hosting/T303: `renderTemplate` gives exact bytes: the `KAAL-PR-template: <TYPE>` line, the intro comment, each chapter as `## <name>` with its guidance as a comment, one line end at the end; with and without an intro.
   - hosting/T304: the same declaration renders the same bytes; CRLF in the declaration comes out as LF.
   - hosting/T305: `renderBody` gives exact bytes in the declared order whatever the key order; texts are trimmed and LF.
   - hosting/T306: `renderBody` refuses a missing, an unknown and an empty chapter, and a declaration without chapters, with `MISSING_CHAPTER`, `UNKNOWN_CHAPTER` and `INVALID_DECLARATION`, naming the chapter.
   - hosting/T307: eleven invalid declarations (lower-case type, `DEFAULT`, nameless or repeated chapter, an unknown field, guidance holding `-->`, a file name, comment syntax or recognition field, an auto-merge value outside the set, a title rule that is not a pattern) are refused by both renderers with `INVALID_DECLARATION`.
   - hosting/T308: `checkTemplates` on a real temporary directory passes when all match and names a missing, a differing and an undeclared file.
   - hosting/T309: the generator modules import no `node:fs`, `node:child_process` or `node:http`, and are shipped.
   - hosting/T310: `raisePullRequest` resolves the revisions, compares, reads the type list, the owner's declaration and the write areas at the **base** revision, all before the first write; then sends exactly `POST /repos/o/r/pulls` (title, head, base, the `renderBody` text, the declared draft flag) and `POST /graphql` `enablePullRequestAutoMerge` with the opened node id and the declared method; the result lists the steps done.
   - hosting/T311: the method enabled is the one the owner's declaration at the base says (`squash`, `merge`, `rebase`), `none` or absent enables nothing, the declared draft flag is applied, and under every method no request merges, reviews or approves.
   - hosting/T312: an unlisted type, `DEFAULT`, a head or base outside `raise`, a title that meets a `forbid` rule and invalid chapters are each refused with `RAISE_REFUSED`, the rule and the owner, and nothing is written.
   - hosting/T313: write boundaries from the revision-bound diff: a path in a phase the type may not carry, in no area, outside `packages`, in a delegated area, or in a name that only shares a prefix is refused and named; legacy names read through; an empty diff is refused; a SYNC (`may: []`) is refused (fail closed, open question below).
   - hosting/T314: partial failures: a refused first step ends there (`STEP_FAILED`, no step done, one write); a refusal of the second step (HTTP 403, a GraphQL error in a 200, a network error) reports `steps: ["open"]`, `failed: "auto-merge"` and the number and URL of the pull request that exists, with no retry, merge, close or delete and no token in the message; an opened head that is not the revision checked reports `failed: "revision"` and enables nothing.
   - hosting/T315: no token is refused before any call; the token is sent only in the `Authorization` header, never in a body, a path, an error or any console output.
   - hosting/T316: the CLI raises from the chapters file and `GITHUB_TOKEN`, prints the URL, exits non-zero on any refusal naming the rule, writes nothing on a refusal, and rejects `--auto-merge`, `--merge-method`, `--draft`, `--merge`, `--declarations`, `--types`, `--write-areas`, `--changed` and `--policy`.
   - hosting/T317: production authority is not caller-selected. Caller-supplied declarations, type list, write areas, changed paths (empty or forged), policy, merge method, auto-merge and draft are refused before any call, not even a read. A permissive policy and declaration committed on the head are never read (no read at the head revision) and the base's rules decide, including the merge method. Every unknown refuses with nothing written: a missing or non-JSON policy file, a declaration without the type, an unresolved head or base, a failed compare, a compare cut off at 300 files.

## The interface the Cases fix

All from `@kaihacksai/kaal-hosting`; the CLI is `scripts/pull-request-cli.mjs`, bin `kaal-hosting-pull-request`.

- `renderTemplate(declaration): string`, `renderBody(declaration, chapters): string`, `checkTemplates(declarations, directory): Promise<{ ok, problems: { file, problem: "missing" | "differs" | "undeclared" }[] }>`.
- `raisePullRequest({ repo, type, chapters, head, base, title }, { token, fetch?, api? }): Promise<{ number, url, steps }>`. Its options are transport only. The policy files it reads at the base revision: `packages/kaal-engineering/skills/kaal-engineering/references/pull-request-types.json` (read as `{ types: [{ type, owner }], invalid: [...] }`), `.../write-areas.json` (C36's shape) and `packages/<owner>/13-source/pull-request-types/<owner>.json` (`{ types: [declaration, ...] }`). If Engineering's final shape of its two files differs, the Cases return to this PLAN.
- Errors carry a `code`: `INVALID_DECLARATION`, `MISSING_CHAPTER`, `UNKNOWN_CHAPTER`, `RAISE_REFUSED` (with `rule`: `caller-authority`, `caller-merge-choice`, `caller-draft-choice`, `token`, `revision`, `type-list`, `declaration`, `write-areas`, `head`, `base`, `title`, `chapters`; and `owner`) and `STEP_FAILED` (with `steps`, `failed`, and `number` and `url` once the pull request exists).

## Questions, settled by the reading below unless said otherwise

- **One file or one per capability.** Settled by the revised C37: Engineering's file lists the seven types and names the owners (`kaal-change` for PLAN, DO, ACT, HOTFIX; `kaal-release` for SYNC, PROMOTION, WIRE) and holds the recognition and no chapter. Each owner declares its own types in its own package, in the form this Change defines.
- **SYNC, PROMOTION and WIRE by the agent path.** Engineering's C36 gives SYNC and WIRE `may: []`, so the diff of a pure merge cannot be judged by areas, and the agent path refuses them (fail closed, T313). Whether a pure-merge diff is judged by Release's `verify Sync` or by a rule in Engineering's file is theirs to say; until then these types are raised by hand.
- **Chapters of PLAN and DO.** They have no source. Whoever owns them (Change, release or Engineering) writes the first declaration; Hosting does not decide their content.
- **The body builder's other home.** Release's API body builder becomes a caller of `renderBody` in Release's own Change.

## Not in this Change

Any DO. Writing or installing a template (a WIRE, Kai's go); the content of any type; a second host; the verifier (Release); merging or approving a raised pull request; Engineering's definition file; version, publication or pin moves.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: the format and its validator, `renderTemplate`, `renderBody`, `checkTemplates`, T303 to T317 as delivered Cases, the ids allocated in `04-test/package-check/testing.md`, the element texts of `interface.md`, the README and Skill entry, and Hosting's suites on all three hosts.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
