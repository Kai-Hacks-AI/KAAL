# hosting/C118 change

## From

Evidence names a commit. A commit id is a name Git gave to a revision, and the caller picks which one: the variable closest to hand (`GITHUB_SHA`) is the revision of the trigger. Even a correct head does not say which files were examined: a merge checkout has the head as a parent and other files, and a working copy at the head may have been changed. The content a run examined, the provenance it claims (the event, the trigger, the Git commit) and the relations between them are different facts, and Hosting states each once. Which content was examined, and whether a record is about it, is a judgment, and it is not Hosting's.

## To

Content first. Git is provenance, and an adapter detail of it. Four functions and one command state facts and none decides.

1. **`contentIdentity(files)`, pure.** The identity of a set of files by their bytes and their paths: SHA-256 over one line per file, the paths in string order, each line the JSON array `[path, sha256 of the bytes]` and a line feed, as `{ algorithm: "sha256", digest, files }` (the count). The order the files were given in, their modes, their times and any Git object are not part of it. A byte or a path changes it; bytes belong to their paths; an empty set has an identity. A value that is not bytes is `INVALID_SOURCE`.
2. **`readCheckout(root, { head? })`.** What a working copy actually holds and where it comes from: `content`, the identity of the files of the working copy (`.git` and links to directories left out); `headContent`, the identity of the files of the commit `head` names, read from the repository, or `null` when none was asked or that commit is not in it (not an error); `git`, the commit at `HEAD` and its parents, or `null` only when `root` holds no `.git` (an ordinary directory still has content). Read-only; a repository or file that cannot be read is an error, never a guess: a directory that holds a `.git` Git cannot read is `REVISION_UNREADABLE`, and is never taken for a directory without Git.
3. **`describeRun(source, observed?)`, pure.** `source` is `{ eventName, event, trigger? }`: the name of the event, its payload and the revision of the trigger (`GITHUB_SHA`) when the caller has it. `observed` is `{ content?, headContent?, git? }`, what a reader found, as it is. The head the event names is read from the event and from nowhere else: `pull_request` and `pull_request_target` at `event.pull_request.head.sha`, `push` at `event.after`, `merge_group` at `event.merge_group.head_sha`; any other event is `UNSUPPORTED_EVENT` (a later Change may add one), and a field of another event is never read.
4. **The answer, as distinct facts.** A frozen `{ event, content, headContent, provenance, relations }`. `content` and `headContent` are content identities or `null`. `provenance` is `{ eventHead: { revision, source }, trigger, git, relations }` with the Git relations `triggerIsEventHead`, `gitCommitIsEventHead`, `gitCommitIsTrigger` and `eventHeadIsGitParent`. `relations` is `{ contentIsHeadContent }`: the one relation between contents, true only when both identities are given and equal. Every relation is `null` when an input it needs was not given: nothing is said. Revisions are full commit ids in lower case (40 or 64 hexadecimal characters; an abbreviation, a missing id and the id of a deleted ref, all zeros, are `NOT_A_REVISION`).
5. **A commit relationship is provenance and never identity.** A merge commit that has the head as a parent is stated as that (`eventHeadIsGitParent: true`) and its content is stated as what it is (`contentIsHeadContent: false` when the files differ). The same commit with changed files is stated (`gitCommitIsEventHead: true`, `contentIsHeadContent: false`). No fact is named as what was judged or examined, none is a verdict, and no relation is called enough. A false relation is stated, not refused; a push whose trigger is not its new commit is stated.
6. **No authority from the caller.** The source takes `eventName`, `event` and `trigger` only and `observed` takes `content`, `headContent` and `git` only; any other key, an identity of the wrong form and a Git provenance without `parents` are `INVALID_SOURCE`. `describeRun` and `contentIdentity` read no environment, no file and no Git, and do not change their input.
7. **The command `kaal-hosting-run-facts [--checkout <dir>]`.** Reads `GITHUB_EVENT_NAME`, `GITHUB_EVENT_PATH` and `GITHUB_SHA`, reads the checkout when given, and prints one `kaal-hosting-run-facts {…}` line: `result: "facts"` and the answer, or `result: "cannot-determine"` with the code and reason. It prints facts and no verdict: exit `0` when the facts were read, whatever they say, `2` when they could not be (an unreadable event is `EVENT_UNREADABLE`), never `1`, as `kaal-hosting-revision` does. A consumer reads the facts, determines which content it examined, and gives Testing the content identity it chose (the `digest` of `content` or of `headContent`).

Cases (executable drafts in `run-facts.red.mjs`; they run on a checkout with the DO, and pass against it; each of the five fails when the identity's order, a relation or an exit code is changed):

- hosting/T349: the head the event names, the trigger and their relation are stated for a pull request, a `pull_request_target`, a push and a merge group; content is `null` and every relation to it `null` when not given; a trigger not given is `null`; the id is lower case; a 64 character id is a revision; a field of another event is never read; the answer is frozen; no field is named as what was judged or examined and none is a verdict.
- hosting/T350: an event that is not one of the four, a missing, short, non-hexadecimal, too long or all-zero head, a bad trigger, and a source, a content identity or a Git provenance of the wrong form are refused with the named code; a push whose trigger is not its new commit is stated, not refused.
- hosting/T351: content is related to content and Git to Git: the same content is the same, other content is other, and without either nothing is said; a merge that has the head as a parent is a different content; the same commit with other content says so; a merge that does not hold the head, another commit and a mixed-case id are stated and none is refused; without a trigger nothing is said about it; a working copy that is not a Git working copy is not an error.
- hosting/T352: `contentIdentity` is the identity defined above, written out independently in the Case; it ignores the order of the files and whether the bytes are a Buffer; a byte, a path or the pairing of bytes with paths changes it; a path with a line feed cannot pass for another; an empty set has one; a value that is not bytes is refused. `describeRun` reads no environment (a hostile `GITHUB_SHA` and event variables change nothing), imports nothing that reads the host, and works on frozen input.
- hosting/T353: `readCheckout` and the command on a scratch repository with a real test merge commit: the content of the working copy equals the identity of its files without `.git`, the content of the head commit is read from the repository, the parent relationship is true and the contents differ, both stated; at the head the contents are the same; a changed file at the head is other content with the same commit; a commit that is not in the repository gives `headContent: null`; a directory without `.git` still has content and no Git provenance, while a directory that holds a `.git` Git cannot read is `REVISION_UNREADABLE` from `readCheckout` and exit `2` from the command; no `--checkout` says nothing about a working copy; an unknown event and a missing event file exit `2`; it never exits `1`.

## Boundary with the other capabilities

- **Hosting** (this Change) states the content of a working copy, its identity and the provenance as separate facts, and nothing about what they mean for evidence.
- **The consumer** (a workflow, a control, Release's records) determines which content it examined and says so; it chooses the working copy, the paths and whether the head's content is the scope of its evidence.
- **Testing** (C84, #2881) owns the meaning of the examined content in evidence and the pure check. C84 now takes an opaque content identity (any non-empty string) with no Git concept, so `contentIdentity` of this Change is what a consumer passes to it (its `digest`, or `sha256:` and the digest where a consumer wants the algorithm in the string). Hosting does not know Testing's field names and Testing does not read Hosting's output; the consumer connects them. This Change leans on nothing of C84.
- **Controls** would own a ratchet that no record boundary reads `GITHUB_SHA` for evidence. Separate, and it needs Kai's go.
- **Release** keeps its repaired records and `--head`; it can read these facts later, a change of its own.

## Design questions

1. **What is the content.** The files of the working copy, bytes and paths, without `.git` and without links to directories. Modes, times, line-ending conversions and untracked files are not interpreted: untracked and changed files are part of the content because they are in the working copy. A consumer that wants a narrower scope (an `under`) asks for it in a later Change; this one reads the whole copy. Proposed.
2. **The identity.** SHA-256 over `[path, sha256]` lines. The alternative is Git's tree id, which is a Git identity and the CPO's hold names it as the thing not to substitute. Proposed.
3. **The head's content is a fact, not the scope.** `headContent` is read when the commit is in the repository; a shallow checkout that lacks it gives `null`. A consumer that needs it fetches it; Hosting does not fetch (no network). Proposed.
4. **Relations as booleans, `null` for not given.** Keeps facts distinct and makes no relation a label. Proposed.
5. **Four events.** `pull_request`, `pull_request_target`, `push` and `merge_group` are the ones the controls run on; any other is refused until one names a head.
6. **The name.** The command `kaal-hosting-run-facts` is next to `kaal-hosting-revision` (which reads a ref's files) and does not replace it.

## Residual risks, kept visible

- Hosting cannot say what the consumer examined. A consumer that records one content while it examined another is not detected here; the facts side by side are what a reviewer and Testing's check can compare it with.
- Bytes are what the working copy holds: a line-ending conversion by the checkout (a Windows runner with `autocrlf`) gives other bytes than the blob, so `contentIsHeadContent` can be false for a correct checkout. It is stated as it is, never papered over; the consumer decides.
- The content identity covers the files `list` reports; a link to a file is read as the file, a link to a directory is left out, and a file that cannot be read is an error and not a gap.
- Package exports are not a sandbox: a caller that never calls these and reads `GITHUB_SHA` is stopped only by the Controls ratchet, not by this Change.

## Not in this Change

Any DO. The ratchet; a change to Release's records or to Testing's check; a decision of what counts as the examined content; fetching a commit; a workflow, WIRE, flag, ruleset or required check; any call to GitHub's API (the event of the run is a file the runner wrote); a publication.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/run-facts.ts` (`contentIdentity`, `describeRun`, `RunFactsError`), `readCheckout` in `scripts/revision.ts`, their exports, the command `scripts/run-facts-cli.mjs` (the build list, `bin` and the interface table), T349 to T353 as delivered Cases in `04-test/package-check/run-facts.test.mjs` unchanged, the ids in `04-test/package-check/testing.md`, the element texts (I25, F113, A50), the README and operations entries.

## ACT

The retrospective, in the ACT template's chapters, after the DO.

## Amendment

After the first review of the DO (#2894): the Case T353 gains the distinction between a directory without Git and a directory with an unreadable Git, which the PLAN already required ("a repository or file that cannot be read is an error"). The drafts show the Case that was missing: `readCheckout` returns `git: null` only for a directory that holds no `.git`, and an unreadable `.git` is `REVISION_UNREADABLE` from the function and exit `2` from the command. No other expectation changes.
