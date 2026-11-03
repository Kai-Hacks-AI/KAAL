# Agent's full report, verbatim (packaging/T59)

The agent was given only `skills/package-engineering/SKILL.md` (as of commit 08942e7) and `neutral/account-D.md`, `account-E.md` and `account-F.md`. It had no tools for the packages, no `expected.md` and no mapping. The report follows without edits.

---

# Review of accounts D, E and F, following the package-engineering skill

All three judgments come from reading the four files only. I ran no tools, and I had no installed copy and no package files. Each conclusion below is marked as either "from the account's text" or "conditional on inspections I would run".

---

## Account D: `acme-lister` 0.4.0 (planned)

### Claim being judged
The account states no claim. Mine, marked as mine: "When built, `acme-lister` 0.4.0 will meet D1 and D2 as consumers receive it." The account is a plan. Nothing is built, installed or run, so there is no release claim to judge. I can only judge whether the plan is adequate.

### 1. What the tools observed
- Nothing. There is no installed copy and no artifact, so there are no tool observations.
- The account says "Nothing is built or installed yet" and "Evidence record: None yet."
- Inspections I would run once a candidate exists:
  - Pack once and record the digest.
  - Install into a fresh consumer, run the installed verification, and diff the consumer project before and after.
  - List the dependencies and their resolution sources.
  - Read the declared commands, exports and files.
  - Look for a shipped manifest and hash-check it if there is one.
  - Count the declared Cases against the Cases that ran.
  - Break the modules in a scratch copy and rerun the tests.

### 2. What I judged and why
All of this is conditional, because there is no installed copy.

**Boundary inventory, done independently.** From the account's own text I get these boundaries:
- Incoming:
  - The `list(archive)` API.
  - The CLI.
  - The argument and format contract.
  - Exit 2 and the named errors.
  - The stdout format, one name per line.
- Outgoing:
  - Node `zlib`.
  - The filesystem read of the archive.
  - "Without extracting it to disk", which is an obligation not to write.
  - Any dependency used to parse the archive's entries.

**Gap: the tar layer.** A `.tgz` is gzip plus tar. `zlib` handles only the gzip layer. Node core has no tar parser, so listing names needs either hand-written tar parsing or a tar dependency. The account lists no dependency. That means one of two things:
- The account is missing a boundary, an outgoing dependency on a tar library, with an unlisted provenance and pin obligation (practice 3).
- Or the package hand-parses tar, which is an undeclared in-package contract that nothing tests.

I flag this as likely. I can't confirm it without the real files.

**Obligation-to-Case check.**

D1 has several obligations:

| Obligation | Covering Case | Judgment |
| --- | --- | --- |
| Success: print names, one per line | T1 | Partly. It covers a 3-file archive with names "in order". Per the fixture and expectation it checks three names, but it does not say whether the names are exact paths. It is silent on directories and nested paths, and silent on the empty archive. |
| Refuse a relative path | T2 | Covered in principle. The plan states it. I would still read the fixture. |
| Refuse a missing file | T2 | Covered in principle. |
| Refuse an archive in any other format | None | **Uncovered.** The contract promises this refusal, and no Case feeds a non-`.tgz` file (a zip, plain text, a bare `.tar`, a bare `.gz`, a corrupt or truncated `.tgz`). |
| Absolute path accepted | T1 | Implicit only. T1 does not say it uses an absolute path. |
| "Named error" | T2 | The plan says "named error", but I can't judge it without the fixture. A weak assertion could pass on exit code alone. |
| Exit 2 | T2 | Covered in principle. |

The "any other format" refusal is the clearest hole in the plan. T2's title also says "relative path, missing file", so even the way it is described omits the format refusal.

D2: "read without extracting to disk" has an obligation about state preserved, and T3 is the Case for it.
- T3 checks "working directory afterwards … directory listing unchanged".
- That only covers the process's working directory. Extraction could go to the OS temp directory, the archive's directory or the home directory, and T3 would still pass.
- The Case can fail on some violations. It cannot fail on the obligation as stated ("to disk" anywhere).
- Per the skill, a Case that cannot fail on the obligation does not exercise it.
- It also runs after T1's success, if sequenced that way, and it is not clear it is tied to a run that lists an archive. If it checks a fresh directory with nothing run, it passes trivially.
- A stronger design would snapshot the temp directory and the archive's own directory too, or run with the filesystem restricted.

D2's other aspects have no Case:
- A corrupt gzip stream, or a stream that stops partway. The refusal is promised only by "any other format" in D1, and nothing tests it.
- Tool failure from `zlib`. The stand-in problem below applies here too.

**Stand-in limit.** If T3 or any later Case fakes `zlib`, it shows only that the package handles that stand-in. The plan doesn't say whether it uses real `zlib`. The fixtures are real files, which is good.

**Conflict between obligations.**
- D1 says to read the archive. D2 says to write nothing.
- There is no direct conflict.
- One latent tension: the "named error" output must go somewhere. That is stderr, which is not "to disk".
- I name no conflict for the owner to resolve.

**Evidence check.** The planned run is `npm test` on Linux with Node 24, once built. Against the skill, that is thin:
- `npm test` in the source checkout is not the installed verification in a fresh consumer (practice 2).
- No candidate digest is planned.
- No mention of pinning or provenance.
- No mention of a manifest. Per practice 4, if none is shipped, the report must say it is absent.
- No mention of Case accounting (practice 5).
- No behavior check (practice 6).
- The planned run also doesn't name a platform claim. A plan that says "Linux, Node 24" is silently narrowing, so the narrowing should be stated.

### 3. What stays unknown
- Everything about the built package.
- Whether a tar dependency exists.
- Whether the Cases run and fail on broken modules.
- Whether the digest, runtime and host of any later run match.
- The exact fixtures and error names.
- The empty, nested and directory-entry archive behavior.

### 4. What only the owner can decide
- Whether D2 means "never write anywhere" or "never write into the working directory". That is the contract to settle before T3 can be adequate.
- Which tar approach to take, and whether the dependency is acceptable.
- What "in order" means, and which names appear for directory entries.
- Whether and when to release.

**Verdict:** the plan is not yet adequate. Two obligations are uncovered or under-tested, and one dependency boundary is probably missing. These are conditional findings. Adding the format-refusal Case, strengthening T3, and declaring the tar boundary would fix the plan.

---

## Account E: `acme-counter` 2.0.1

### Claim being judged
The account's claim is explicit: "the package meets its obligations on Linux with Node 24.22.1." I judge that claim as written. The narrowing leaves out macOS and Windows, other Node versions, and other filesystems. It also leaves out the claim that obligations are met only in the sense the Cases test.

### 1. What the tools observed
These are the account's own reported observations, not mine. I repeated none of them.
- One candidate: `acme-counter-2.0.1.tgz`, digest `a7c1…09fe`, packed with npm 11.21.0.
- A fresh consumer on Node 24.22.1, Linux.
- `npm test` reports `result: verified`, exit 0, with cases T1..T4 passing.
- The tarball digest in the run equals the release record's digest.
- Truncated digest: I can't tell from `a7c1…09fe` that it is the same digest throughout. The elision hides most of it.

Inspections I would run:
- Recompute the digest of the tarball.
- Inspect the installed tree.
- Read the dependency list and where each came from.
- Check for a manifest.
- Account for Cases against the declared set.
- Break the modules in a scratch copy and rerun.
- Read the T3 and T4 fixtures.

### 2. What I judged and why

**Boundary inventory.**
- Incoming: the API and CLI. The refusal, exit 2 and counting contract.
- Outgoing:
  - E2 reads the directory tree through `fs`.
  - E3 writes a cache file to a caller-named path.
  - Any dependencies not listed (none are declared).
- The `--cache` flag is also an incoming option on the CLI. Its contract is F3 and appears only in E3.

**The conflict.** E2 says "Never write outside its scratch directory." E3 says "Write the cache file to the path the caller names."
- These conflict when the caller names a path outside the scratch directory.
- The account does not name the conflict. It does not say how the package resolves it.
- Per the skill, I must not pick one silently. I name both and say which Case would show the answer: a Case that passes `--cache <path outside scratch>` and checks whether the file is written (E3 wins) or refused (E2 wins).
- The choice is for the contract owners: acme-counter/F1 and F3, and whoever owns the scratch directory rule.
- T4 hides the conflict. It uses `--cache out.json` "in the scratch directory", which is the one input where both obligations hold at once. So the Case set never touches the conflict. The passing run says nothing about it.
- A second reading may make the conflict go away: "its scratch directory" could mean the directory the caller supplies. The account doesn't say. This is the owner's to define.

**Case-by-obligation check.**

| Obligation | Case | Judgment |
| --- | --- | --- |
| E1 success (5 files) | T1 | Covered. Open question: what counts as a file? Subdirectories, symlinks and hidden files are untested. A flat 5-file fixture can't show recursion, although the account says it "reads the directory tree". |
| E1 refuse relative and missing | T2 | Covered in principle. |
| E1 absolute path accepted | T1 | Implicit. |
| E1 a file passed instead of a directory | None | The contract names only relative and missing refusals, so this is not promised. I note it as an untested edge, not a gap. |
| E2 never write outside scratch | T3 | **Weak.** It checks that the directory listing is unchanged afterwards. That is the counted directory, or the working directory, and not "outside the scratch directory" generally. Writes to the OS temp directory or home would pass. A run that writes only the cache (T4) passes it too. |
| E3 write cache to the named path | T4 | Success is covered, with the path inside scratch. The count is written. "Holds the count" is a content check. |
| E3 refusals | None | The contract promises none. An unwritable path is untested. |
| E3 state preserved | None | An existing cache file is not tested (overwritten or preserved). |

**The "verified" result.** `result: verified` reports that the Cases passed. It is the package's own contract, reported beside mine. It does not decide:
- The E2/E3 conflict.
- Whether T3 could fail.
- Whether the verification still passes when the modules are broken (practice 6). I have no evidence either way. The account says nothing. I would run this and mark the verification "unknown" until then.

**Evidence against the claim.**
- It matches on candidate (digest equal to the release record), runtime (Node 24.22.1), host (Linux) and install-in-a-fresh-consumer. That is a sound basis for the narrowed claim as far as it goes.
- But the claim is "meets its obligations", and one obligation pair is in conflict and not tested at the conflict point. The evidence supports "the four Cases pass on this artifact", not "the obligations are met".
- The digest is truncated in the account, so I can't confirm it from the text.
- Case accounting: "T1..T4 pass" gives a range, not a count. I can't tell whether duplicates, skips or todos existed. I would confirm the run reports four cases, four declared, none skipped or todo.
- Dependencies and manifest: not addressed. Absent evidence is unknown, not a pass.
- "Installed into a fresh consumer" is stated. Whether the consumer project was left unchanged is not.

### 3. What stays unknown
- How the package behaves when `--cache` names a path outside scratch.
- What "scratch directory" means.
- Whether T3 could ever fail on the obligation.
- Whether the tests pass with broken modules.
- Whether dependencies exist and are pinned from a registry.
- Whether a manifest ships.
- The exact digest.
- The behavior on subdirectories and symlinks.
- Every platform other than Linux with Node 24.22.1.

### 4. What only the owner can decide
- How E2 and E3 resolve when they collide. Either the cache path must be inside scratch, or "outside scratch" has an exception for the named cache path. This is the contract owners' choice, not mine.
- What "scratch directory" is.
- Whether the release goes ahead.

**Verdict:** the evidence supports the narrowed run claim (candidate, runtime, host, install). It does not support "meets its obligations", because of the unresolved E2/E3 conflict and a T3 that can't fail on E2. The status is unknown for the conflict, not failed and not verified. Resolving it needs the owner's ruling and a Case for the out-of-scratch cache path.

---

## Account F: `acme-hasher` 1.0.0

### Claim being judged
The account states one: "claimed for Linux with Node 24.22.1 only. macOS and Windows are not claimed and have not been run." I judge the narrowed claim. The narrowing leaves out macOS, Windows and other Node versions. It also leaves out other filesystems, which matters for F2, where size-change detection relies on `fs` behavior. Not claiming those platforms is honest and consistent with the evidence.

### 1. What the tools observed
These are the account's own reported observations, not my runs.
- Candidate `acme-hasher-1.0.0.tgz`, digest `3be9…c014` (truncated), packed once with npm 11.21.0.
- Fresh consumer, Node 24.22.1, Linux.
- `npm test` gives `result: verified`, exit 0, cases T1..T4 pass.
- Tarball digest equal to the release record's.
- No other platforms were run.

Inspections I would run: the same set as for E. For F specifically I'd read T3 and T4's stand-in code and check whether F2's refusal depends on any `fs` behavior the stand-in doesn't model.

### 2. What I judged and why

**Boundary inventory.**
- Incoming:
  - The `hash(file)` API and CLI.
  - Refusals (relative path, missing file, directory), exit 2, the named error, and printing the SHA-256.
- Outgoing:
  - Reads bytes through `fs`.
  - Hashes through `crypto`.
  - It makes two obligations from one field: "read once", and "refuse if the size changes".
- Not listed: dependencies (none declared), and the CLI's stdout/stderr split. Whether a refusal writes anything to stdout is covered in T2 ("prints no digest").

**Case-by-obligation check.**

| Obligation | Case | Judgment |
| --- | --- | --- |
| F1 success | T1 | Covered. `abc` with a known digest is a real expected value, an independent oracle. It is a tiny file, so it doesn't exercise multi-chunk reads. Large and empty files are untested. |
| F1 refuse relative, missing, directory | T2 | Covered, and it names all three. It also checks that no digest is printed. That is a good assertion. I would read the fixture to confirm each is a separate sub-case, and that the named error is checked, not only the exit code. |
| F1 absolute path accepted | T1 | Implicit. |
| F2 read once | None | **Uncovered.** No Case counts reads or opens. "Read the file once" is stated as an obligation. T3 and T4 don't check it. A package reading twice, for example to stat then read, would pass T1. |
| F2 refuse on size change while reading | T3 | Covered, but only through a stand-in. |
| F2 failing read, no partial digest | T4 | Covered, again probably through a stand-in. The obligation is a promised refusal, not stated in F2's text. F2's text says only "refuse if its size changes". T4 tests an obligation not in the account, so the account's boundary text is behind its own Cases. Mild finding. |

**Stand-in limit.** T3 uses "a stand-in `fs` that grows the file during the read". The Case's author controls the stand-in.
- It shows only that the package handles that stand-in's behavior.
- It does not show that real `fs` reads produce a detectable size change in the way the package checks.
- A stand-in that grows the file may not model shrinking, a change that cancels out, or a change between the stat and the read.
- Real races are timing-dependent and can't be reproduced reliably, which is why a stand-in is reasonable. The limit should still be stated, and I state it here.
- T4's midway-failure stand-in has the same limit.
- A real-fs complement is possible for T4: a path that errors on read (for example a file made unreadable, which fails differently when running as root).

**Claim against evidence.**
- Candidate, runtime, host and fresh-consumer install all match the narrowed claim. The digest equals the release record's.
- The unrun platforms are stated, not hidden, and the account does not claim them. That is correct handling of an absence. It's an unknown, reported as unknown, not as a pass.
- The same caveats as E apply: truncated digest, "T1..T4" range rather than a count, and no word on dependencies, manifest or behavior under broken modules.
- Whether `verified` could still pass with broken modules is unknown. I'd check it. T1's known digest and T2's refusals decide from behavior, which is encouraging. T3 and T4 depend on the stand-in. If a broken module let a stand-in short-circuit, they could pass vacuously. I can't tell from the text.

### 3. What stays unknown
- Whether the "read once" obligation holds.
- Whether the stand-ins are faithful to real `fs`.
- Whether the verification fails when modules are broken.
- Dependencies and their provenance.
- Manifest presence.
- Exact digest.
- Case counts, skips and todos.
- Behavior on large and empty files.
- Any platform other than Linux with Node 24.22.1.

### 4. What only the owner can decide
- Whether "read once" is a true obligation or only a description, and then whether a Case is required for it.
- Whether the stand-in-based evidence is enough for the size-change refusal.
- Whether to release 1.0.0 for the stated Linux scope.

**Verdict:** this is the best of the three. The claim is narrow and honest, and the evidence matches it. The remaining gaps are the "read once" obligation, which has no Case, and the stand-in limit on F2. I would call the claim "verified for the Cases it has, plus unknown for read-once and for stand-in fidelity". It is not a clean verified for all of F2, and it is not a failure.

---

## Comparison, briefly
- D is a plan, so everything is conditional, and the plan has an uncovered refusal, a weak state-preserved Case and a probably missing tar boundary.
- E has the most important finding: two obligations conflict, the Case set avoids the conflict, and the "verified" result can't speak to it.
- F is mostly sound. It has one uncovered obligation and a stand-in limit.
- None of the passing `npm test` results shows that no obligation is missing. They are each package's own contract, reported beside mine.

---

## Skill gaps

**Missing or unclear**
1. **No guidance on judging a Case fixture I can't read.** Step 4 says "read the Case's fixture and expectation, not only its title", but these accounts give only a title-level table. The skill doesn't say what to do when the fixture is not available. I treated my judgments as conditional. The skill should say so explicitly.
2. **Plans.** Step 2 covers "no installed copy", which helped for D. It doesn't say whether a plan's Test Plan can be judged for adequacy or only the account's coverage, and it doesn't say how the Results words (verified, failed, unknown) apply to a plan. I used "not yet adequate".
3. **What "verified" in the package's own result means next to the skill's three results.** The skill says the package's own tests are "its own contract, reported beside yours" but gives no wording for reporting an unreproduced owner-reported observation. I treated the accounts' evidence as reported, not observed. A line about attribution of observations would help.
4. **Missing-dependency detection.** Nothing prompts you to ask whether an unlisted dependency is needed (the tar case in D). Step 3 asks you to inventory boundaries yourself, which pointed me there, but the skill gives no method for noticing an implied dependency. That worked here through domain knowledge.
5. **Granularity of "state preserved".** The skill mentions "state preserved where it is promised" without saying how wide the state is. The weakness in T3 in both D and E is a scope question (which directory). The skill doesn't help you judge it.
6. **Truncated digests.** The skill says to compare digests, but gives no guidance on a digest elided in a written account.
7. **Case accounting from a range.** "T1..T4 pass" can't show duplicates or todos. Practice 5 covers this, but only from tool output, so I could only flag it.
8. **Stand-ins.** The skill says to name the limit but not how to decide whether a stand-in is acceptable when the real behavior is a race. I judged it reasonable but limited.

**Hints at an answer rather than a method (candid)**
- Step 5's example ("one says never write outside a scratch directory and another says write a record somewhere") is almost exactly Account E's E2/E3 conflict. That reads as a pointer to the answer for one account, not a method. A neutral example would be better.
- Step 1's example ("narrows its own claim, for example to one platform") matches Account F's narrowing closely.
- Step 2's "no installed copy, because the account is a plan" matches D.
- Step 4's "A stand-in for an outside tool that the Case's own author controls" matches F's T3 and T4.
- Together, each of the three accounts has a named example in the skill. I expect that makes these three easy and tells us little about unfamiliar accounts. A harder test would use accounts the skill's examples don't mirror.
- Practice 3's "installed from a local tarball, a path or a Git reference" never came up in these accounts, since none states provenance, and the skill doesn't say what to do when provenance is not stated at all. I reported it as unknown.
