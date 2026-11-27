# C84 change

## Finding

Release/D20 recurred three times: the records of check 1 (release/C165), check 2 (release/C158) and check 4 (release/C159) named a revision that did not identify what the check had judged (on a `pull_request` run the variable the callers used is the test merge commit, and the check judged the head). Each caller repaired its own line (release/T1603, T1607 and T1608), so the old and the new verdict could not be matched for one thing, and nothing stops the next caller from doing the same. Kai asked that evidence identifies what was actually judged, regardless of what triggered execution, and that this be a common contract and not each caller's responsibility.

The CPO then fixed the level of the contract: it is **content identity**. Evidence must correspond to the content actually examined. Git commits, branches, event heads and trigger revisions are facts of Hosting and of a source, not Testing concepts, and Testing requires no identity format. Hosting provides content and provenance, the consumer establishes what it examined, and Testing checks the evidence against that identity.

Today Testing's observation record carries `revision` (what the record names) and `expectedRevision` (what the consumer examined) and makes every Case UNKNOWN when they differ. What is missing is the contract stated without a source in it, and a finding that says what is wrong, instead of an unexplained mismatch. The names `revision` and `expectedRevision` of the existing command (`--revision`, `--expect-revision`) stay; in the contract they are the recorded identity and the examined identity.

## PLAN

1. The contract (`I52`, `F177`): a record names the **identity of the content examined**, an opaque non-empty string. The consumer says which identity it examined. Equal means the evidence is of that content; anything else makes the record evidence of nothing. Testing reads no source and assumes no format: two equal non-empty strings are the same identity whatever they look like.
2. A pure check `lib/identity.mjs` (`checkIdentity({ recorded, examined })`, export `./identity`) returning `{ ok, findings }`. Findings: `examined-identity-missing`, `recorded-identity-missing`, `recorded-not-examined` (both given and different). It reads nothing and decides no verdict.
3. The observation record applies it: `assembleObservation` passes `revision` as `recorded` and `expectedRevision` as `examined`, and adds each finding to `evidence.integrity`; every Case is UNKNOWN and the catalog is not complete. A record whose identities are equal is unchanged. No new flag.
4. Cases `testing/T420` to `testing/T425`, plain `.test.mjs` in their destination folders (the `C30`, `C80` and `C83` precedent), RED on this tree and GREEN in place in the DO:
   - `T420` (`testing/I52`), `T421` (`testing/F177`), `T422` (`testing/A63`): each file equals its draft.
   - `T423` (`testing/F177`): `checkIdentity` is `ok` for equal non-empty identities of any form (a hexadecimal id, a digest with a prefix, a version string), is case sensitive, names `recorded-not-examined` for two different identities, and `examined-identity-missing` and `recorded-identity-missing` for an absent, empty, blank or non-string identity (both named, the examined one first); two equal blank identities are not `ok`; it does not change its input.
   - `T424` (`testing/F177`): `assembleObservation` with a good run report gives GREEN for a record whose identity equals the examined one, for identities of different forms alike; a record of another identity gives UNKNOWN for every Case with `recorded-not-examined` in `evidence.integrity` and the catalog not complete; a record with no identity, or no examined identity, gives UNKNOWN with the missing finding.
   - `T425` (`testing/F177`): `kaal-testing observe-at` with identities that are not Git ids (for example `tree:9f2c` and `build-2026.11.27`) gives GREEN and no finding when they are equal; with different identities it exits `0`, every Case is UNKNOWN and `recorded-not-examined` is in the record; with a missing `--revision` or `--expect-revision` it exits `2` and writes nothing, as before.
5. Evidence: `T420` to `T425` RED on this tree, `T420` to `T422` GREEN on a throwaway DO with the drafts placed, `T423` to `T425` GREEN with a throwaway prototype.

## Boundary with the other capabilities

- **Testing** owns the meaning of content identity in evidence, the check and its use in the observation record.
- **Hosting** would provide content and provenance: what was examined and where it came from, with an identity for it. That is a separate PLAN and comes after this one. This Change takes the identities as input and reads no source.
- **The consumer** (a workflow, a control, a hold Act) establishes which content it examined, and so which identity to compare with.
- **Release** keeps its repaired records. They can call the check later, a change of its own. Nothing of release changes here.
- **Controls** may later add a ratchet over how a record boundary takes its identity. Separate, and it needs Kai's go.

## Design questions

1. **Opaque identity.** Any non-empty string that is not blank is an identity; the comparison is exact, with no normalization of case, because Testing does not know the format. Proposed; the alternative is a typed identity (`kind` and `value`) so that two identities of different kinds can never be equal.
2. **Findings stop the Cases.** An identity finding goes into `evidence.integrity` and every Case is UNKNOWN, as for an untrusted report. Proposed, because evidence of unnamed content cannot be matched to anything.
3. **Names in the record.** The observation record keeps `revision` and `expectedRevision`. A neutral pair of names (`identity`, `examined`) is for later and for other records, with Release; renaming in this Change would change the shape a reader already reads.
4. **Naming the cause.** A mismatch says only that the identities differ and shows both. Why they differ (for example that one is the identity of the run and not of the content) is for the one who holds the provenance, Hosting.

## Residual risks, kept visible

- The check compares identities and does not know what was examined. A producer that names the right identity and examined other content, or a consumer that takes the examined identity from the same place as the record's, is not caught. Only the provider of content and provenance (Hosting) ties an identity to content, so this Change is half of the contract.
- An opaque string says nothing about its source. A blank-looking or constant identity passes if both sides agree; nothing here stops a producer from always writing the same string.

## Not in this Change

No provider of content or provenance, no ratchet, no change to Release's records, no workflow, WIRE, flag, ruleset or required check, no new command flag, and no change to `run`, `observe` or `mutate`.

## Ids

Change `testing/C84`, Intent `testing/I52`, Requirement `testing/F177`, Architecture `testing/A63`, Cases `testing/T420` to `testing/T425`. Ids are taken by hand and Release confirmed no clash; on a clash the newer PR renumbers.
