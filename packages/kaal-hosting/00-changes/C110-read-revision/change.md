# hosting/C110 change

## PLAN

1. Add the drafts in `interface.md` (the Intent hosting/I18, the Requirements hosting/F80 to hosting/F84 and hosting/N12, the Architecture hosting/A38 with its interface row, the source of `revision.ts` and `revision-cli.mjs`, and the small edits to `index.ts`, `package.json`, the build, the Skill, the operation guide, the two `AGENTS.md` files and the README) and the Cases hosting/T258 to hosting/T265, all RED, in this folder.
2. Observe the expected RED, and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, no change to a shipped document, no version and no publication.

## The slice

Owner direction (19 Nov 2026): the three places each serve one reason: `engineering/<capability>` is the lab, `packages/<capability>` the product, `.kaal/<capability>` what a consumer embeds. From all the Git and GitHub work one service moves into Hosting now. The library is not a separate level: it is the Script inside the Skill, imported from code or run from the shell, from one implementation.

**The one service: read a revision's files.** `readRevision(root, ref, { under })` returns `Files` (Hosting's existing type, what `read` returns for a directory) for a commit; `revision(root, ref)` returns the commit id; `kaal-hosting-revision` is the same thing at the shell and prints facts.

Decided here, so the Cases can be strict:

- **Committed bytes only.** Never the working tree or the index. Bytes are returned exactly, which is why Git is started through `startPlan` but with a start that keeps bytes (`execute` returns text). That start is internal to `revision.ts`, not an export.
- **Three outcomes, never two.** Read, no such revision (`REVISION_NOT_FOUND`), could not be determined (`REVISION_UNREADABLE`). A blob or a tree is not a revision. A ref is data: one that starts with `-` is just a ref that names no commit.
- **Links and submodules are refused, not followed or skipped** (`REVISION_ENTRY`, naming the path), so a caller never receives a link's target text as if it were a file. `under` reads around them. This is the policy of Guard's `trusted.mjs`; it is also the one that is safe for a judge.
- **`under` is literal.** Each entry is a repository-relative file or folder name and nothing more: Git pathspec syntax (`*`, `?`, `[`, `:(glob)`, `:(exclude)`, `:!`, `:/`, `:(top)`, `:(icase)`, `:(attr:...)`) cannot broaden or change a read. Git is started with `--literal-pathspecs`, which Git's own command line honours whatever the environment holds, and a file whose name looks like pathspec syntax is read by exactly that name (CPO review of 19 Nov, hosting/T265).
- **Cost does not grow with the files:** three Git starts (`rev-parse`, `ls-tree`, one `cat-file --batch`), counted by Git's own trace.
- **The command prints facts, never bytes and never a verdict.** Exit 0 when read (also when `--under` matches nothing), 2 when it could not be. It never exits 1, because nothing it reports can fail a check. Whether this is the right revision is the caller's judgment.

## Not in this Change

GitHub in any form; Git history and topology queries (`merge-base`, `rev-list`, ancestry); the Git run facility as an export; writing a revision to a directory (Guard's `trusted.mjs` also keeps the executable bit, which `Files` does not carry; that stays open until Guard moves); any new package; any version, publication or pin move; `.kaal/hosting`; and every consumer: the other six readers of `baseline.md` stay as they are.

## First consumer: a following Engineering Change

`engineering/collector-capability/check.mjs` (about 20 lines of `ls-tree` and `show`) becomes one `readRevision` call, imported from `@kaihacksai/kaal-hosting`, which Engineering resolves to the in-repo package through the workspace (`packages/kaal-hosting` is a workspace of the root), so it does not wait for npm. Its output on a scratch repository is compared before and after. This is a separate Change because it is Engineering's code and a Change claims one owner's paths; it is PLANned once this Change's DO is in its collector. It is named here so it is not forgotten, not decided here.

## Order after this Change, as options, none part of it

The other readers (CTL19, Change Isolation, Guard, `kaal-controls`, lineage), one Change each, and only after their own Test Cases match what they do now; `kaal-controls` would gain Hosting as its first dependency, and Guard's requirement guard/N6 (Hosting imported only in its test harness) would be amended in a Guard Change. The GitHub transport. History queries. Writing a revision to a directory. Publishing Hosting with the operation.

## DO

Not authorized by this PLAN. On the merged PLAN, in the collector: add the drafts as the files they name (`revision.ts`, `revision-cli.mjs`, the edits, the element texts), turn T258 to T265 into `04-test/package-check/revision.test.mjs` (T258 to T262 and T265, shipped: they need Git, which Hosting's installed verification already uses for `isolatedEnvironment`) and `04-test/engineering-check/plan/revision.test.mjs` (T263 and T264, the publisher's), allocate the new ids in `04-test/package-check/testing.md`, and run Hosting's suites on all three hosts.

## ACT

A 4L retrospective in `act.md`.

## Left open

- **Windows and macOS.** The Cases were run on Linux only (`evidence.md`). They avoid host-specific facts (the link and submodule entries are made in the index, not on the file system; the trace counts Git's own starts), and the three-host lanes are what proves them.
- **Names Hosting would refuse on a host** (`read` refuses a name some host cannot hold). `readRevision` is in memory and refuses none. Whether it should is a design question; it returns the committed name as Git has it.
- **Ids are provisional.** hosting/C110, hosting/I18, hosting/F80 to hosting/F84, hosting/N12, hosting/A38 and hosting/T258 to hosting/T265 are the next free numbers on `main` at 3a3cf6e6 and are to be confirmed before the DO.
- **The executable bit** for Guard's later move (see Not in this Change).
