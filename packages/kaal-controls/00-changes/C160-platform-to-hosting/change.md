# C160 change

## PLAN

1. Add the Case T1710 under controls/N8 (plain `.test.mjs`, never renamed, package-relative like T1574). It reads every `.mjs` of `skills/kaal-controls/scripts` and fails on a file system, process or operating system import, on a `node:path` import other than `posix`, and on line-ending handling (`\r`, `EOL`). It is RED on the collector (ten lines in five files) and is run GREEN against an uncommitted throwaway rewrite.
2. Amend controls/N8 by one sentence: the scripts do no platform work of their own (no file system, process, operating system or line-ending code); what they judge comes in as text from hosting, with `/`-separated, repository-relative paths.
3. No script, Skill word or record change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector, and with the collector synced with main:

1. The semantic functions (`findControls`, `registryAt`, `findEvidenceDue` and the like) keep taking `{path, text}` entries and return what they return today. Their callers change.
2. The reading moves out of the scripts into hosting's functions: the directory walks and file reads of `check-controls.mjs`, `evidence.mjs` and `find-controls.mjs` and the file read of `judge-mode.mjs` use hosting's `read`, `list` and `readFile`; the Git read of `registry.mjs` uses hosting's `readRevision`. Each returns files keyed by a `/`-separated relative path, which is the path form the `posix` comparison in `recognize-adapter.mjs` assumes (that comparison is import-specifier syntax and stays).
3. Line endings: hosting hands over text; controls does not normalise it. If hosting's text can still carry `\r\n`, that is a hosting gap (design question 2), not a controls fix.
4. The `node_modules` and `.git` skips and the extension filters stay in controls only as a list of what the check judges (a name filter on paths, no walking).
5. T1710 GREEN; the package suite GREEN and unchanged in what it asserts. A mutation, as in C25 and C159: one file system import put back in a script and one `\r\n` replace put back, each alone turns T1710 RED.

## ACT

A retro entry in the collector.

## Design questions, with recommendations

1. **How controls reaches hosting.** Hosting is TypeScript and controls ships plain `.mjs`. Recommend the entry points that read (CLIs and thin runners) import hosting's functions, and the judging functions stay pure over `{path, text}`. Hosting is an allowed dependency of the package (controls/N8); it is then declared in `package.json`. Hosting to confirm the entry points are consumable from plain `.mjs` as published.
2. **Line endings and path form.** Recommend hosting guarantees `/`-separated, repository-relative paths and, where a check needs line-stable text, offers it; controls then holds no normalisation. Hosting to confirm what `read` and `readRevision` guarantee today; any gap is a hosting Change that this DO waits on.
3. **Scope.** `judge-ratchet.mjs` splits its history text on `\n`: that is the format of the record it judges, not a platform matter, and stays.
4. **Order.** Recommend this Change before the station split and the metadata Changes, since all three touch the same scripts and the package must be scrubbed once.
