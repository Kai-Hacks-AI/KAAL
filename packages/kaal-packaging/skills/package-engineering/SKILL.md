---
name: package-engineering
description: Judge whether a software package is ready to be used or released, as a consumer would receive it, and say what you observed, what you judged and what stays unknown. Use when checking a package before release, reviewing what it ships, assessing whether its tests exercise what it promises, or deciding whether evidence supports a claim about it.
license: MIT
---

# Package engineering: observe, then judge

A package is what a consumer receives, not what its author has on disk. Tools can give you observations that anyone can repeat. Whether those observations are enough is your judgment. Say which is which, every time. A judgment is reasoned, recorded and open to being wrong. It is never a proof that nothing is missing.

## Practices

1. **Measure and check the artifact, never the source directory.** Pack once, the way release packs. Everything below looks at that one artifact, by its digest or version.
2. **Verify the installed copy in a fresh consumer.** Install the artifact the way a consumer does, run its own verification there, and leave the consumer's project unchanged. A check run in the source checkout says nothing about what ships.
3. **Pin dependencies exactly, and know where they came from.** Every runtime dependency is one exact version that the install shows was fetched from a registry. A dependency installed from a local tarball, a path or a Git reference works only for you. Report it as blocked and interim, not as accepted. A recorded resolution is not independently checked provenance.
4. **Hash-check what shipped, when the package says it ships a manifest.** Compare each installed file with the manifest's digest. A package that ships no manifest has not declared this evidence: say it is absent. A manifest that is unreadable, or lists files that are missing, is a broken declaration and fails. A file that differs from an intact manifest makes the evidence untrustworthy, so report it as unknown, not as a pass.
5. **Account for cases exactly.** Every declared Case runs once. A missing, duplicate, undeclared, skipped or todo Case means you cannot say the verification ran. A declared Case that fails is a failure, not an unknown.
6. **Test behavior, not presence.** A verification that still passes when every module it checks is broken decides from presence, files or digests. Break the modules in a scratch copy and run it again. If it still passes, say so. Whether its assertions are adequate is its owner's to show.
7. **Publish what you verified.** Pack once, record the digest, verify that artifact, and publish that exact artifact, never a repack. A release is a decision for its owner.

## Results

Use three results and keep them apart: verified, failed, unknown. Unknown is not a soft failure and not a soft pass. Report it with its cause, and say what would resolve it. Do not round it either way, and do not call a failed check passed because the package's own tests passed: that is its own contract, reported beside yours.

## Assess a package's boundaries

Use this when asked whether a package's boundary account and tests are adequate.

1. **State the claim being judged.** If the account gives none, write one yourself, mark it as yours, and judge that. If the account narrows its own claim, judge the narrowed claim and report what the narrowing leaves out as unknown and outside the claim, not as a defect.
2. **Gather observations.** Read the package's documents and any manifest. Run the tools you have on the installed copy and note each finding. Evidence the account reports, such as a run, a digest or a host, is reported by its owner and not observed by you: say so, and say when a digest is elided or a run is given as a range so that duplicates, skips and todos cannot be told. List what the package declares: commands, exports, scripts it starts, files it reads or writes, and dependencies. **If there is no installed copy**, because the account is a plan or a description, say so, judge only what the account itself supports, and mark every conclusion that needs the real files as conditional.
3. **Inventory the boundaries yourself, then compare.** A boundary is an interaction entering or leaving the package: its API and commands coming in, the tools, files and other packages it calls going out. A dependency can be incoming for one contract and outgoing for another, so record the actual obligation, not the field it came from. For each, find its owner and its contract. Then ask what each stated mechanism needs that the account does not list, such as a format that the named library does not handle, and treat a likely missing boundary as a finding to confirm.
4. **Check each obligation against the package's own Cases.** For every obligation, find a Case that exercises success, a Case for each refusal the contract promises, and one that shows state preserved where it is promised. Read the Case's fixture and expectation, not only its title. If you only have titles, say you have not read the fixtures and mark the conclusion conditional. A Case that cannot fail on the obligation does not exercise it, and a check on state must cover every place the obligation says (for example, not only the working directory when the obligation is about the whole disk). A stand-in for an outside tool that the Case's own author controls shows only that the package handles that stand-in, so name that limit.
5. **When two obligations conflict**, meaning there is an input for which both cannot hold, do not pick one silently. Name both, say which Case, or which new Case, would show the answer, check whether the existing Cases happen to use only inputs where both hold, and leave the choice to whoever owns the contracts.
6. **Check the evidence against the claim.** Match the claim to the candidate (its digest or version), the runtime versions, the host, and whether the installed verification or only the source suite ran. A run on another artifact, another runtime or a log that stops early does not support the claim. Leave it unresolved and say what would resolve it.
7. **Report in four parts, kept apart**: what the tools observed; what you judged and why, with the obligations and evidence you relied on; what stays unknown; and what only the owner can decide or authorize, such as a release.

Do not accept an account because it has headings, links, Cases and passing tools. Do not take over another package's contracts, tests or product choices: name the gap and leave it with its owner. Do not infer another package's correctness from this package's result.

## KAAL layer

For a package that follows KAAL's own package contract, read the `kaal-packaging` skill beside this one. It names the contract's requirements and the tool that decides them (`conform`, with `--profile general` for the checks above and the default profile for the whole contract).
