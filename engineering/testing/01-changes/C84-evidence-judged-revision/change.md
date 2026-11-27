# C84 change

## Finding

Release/D20 recurred three times: the record of check 1 (release/C165), check 2 (release/C158) and check 4 (release/C159) took its `sha` from `GITHUB_SHA`, which on a `pull_request` run is the test merge commit, not the head that was judged. Each caller repaired its own line (the head now comes from `--head` or `KAAL_HEAD_SHA`, pinned by release/T1603, T1607 and T1608), so the old and the new verdict could not be matched for one revision, and nothing stops the next caller from doing the same. Kai asked that evidence identifies what was actually judged, regardless of what triggered execution, and that this be a common contract and not each caller's responsibility.

Today Testing's observation record already carries `revision` (what the run reports it ran at) and `expectedRevision` (what the consumer judged) and makes every Case UNKNOWN when they differ. What is missing is the definition of the contract, a check any producer or reader can call, and a name for the D20 case, so that a mismatch caused by taking the trigger says so.

## PLAN

1. The contract (`I52`, `F177`): a record names the **judged** revision, the full commit id of what was examined, resolved by the caller from a source that names the judged revision (the head of the pull request, or the checkout that was examined), whatever revision triggered the run. The trigger may be the same revision (a push); only a mismatch is invalid. A short or missing id is not a revision.
2. A pure check `lib/revision.mjs` (`checkRevision({ recorded, judged, trigger })`, export `./revision`) returning `{ ok, findings }`. Findings: `judged-not-a-revision`, `recorded-not-a-revision`, `recorded-is-trigger` (the recorded id equals the trigger and differs from the judged one: the D20 case; equal ids are ok), `recorded-not-judged`. It reads nothing and decides no verdict.
3. The observation record applies it: `assembleObservation` takes `triggerRevision` (optional) and `observe-at` takes `--trigger-revision`; a finding goes into `evidence.integrity` and every Case is UNKNOWN. A record whose revisions agree and are real revisions is unchanged, whether or not the trigger is the same revision.
4. Cases `testing/T420` to `testing/T425`, plain `.test.mjs` in their destination folders (the `C30`, `C80` and `C83` precedent), RED on this tree and GREEN in place in the DO:
   - `T420` (`testing/I52`), `T421` (`testing/F177`), `T422` (`testing/A63`): each file equals its draft.
   - `T423` (`testing/F177`): `checkRevision` is `ok` for equal full ids (also when they differ only in letter case) and for a push where recorded, judged and trigger are the same; it names `recorded-is-trigger` for a merge commit taken as the record's revision, `recorded-not-judged` for another id, and `judged-not-a-revision` and `recorded-not-a-revision` for a missing, short or non-hex id; it does not change its input.
   - `T424` (`testing/F177`): `assembleObservation` with a good run report gives GREEN for a record of the judged head; a record of the trigger gives UNKNOWN for every Case with `recorded-is-trigger` in `evidence.integrity` and the catalog not complete; a short id that equals itself gives UNKNOWN with the two findings; a record with no `triggerRevision` behaves as before.
   - `T425` (`testing/F177`): `kaal-testing observe-at --trigger-revision` writes the record with the finding and exits `0`, and exits `2` writing nothing when `--trigger-revision` is not a full revision.
5. Evidence: `T420` to `T425` RED on this tree, `T420` to `T422` GREEN on a throwaway DO with the drafts placed, `T423` to `T425` GREEN with a throwaway prototype.

## Boundary with the other capabilities

- **Testing** owns the meaning of "judged revision" in evidence, the check and its use in the observation record.
- **Hosting** would own the resolver that gives the judged revision and says where it came from (the event's head, or the checkout), and the trigger revision next to it. That is a separate PLAN and comes after this one. This Change takes both as input and reads neither git nor the environment.
- **Release** keeps its repaired records. They can call `checkRevision` later, a change of its own. Nothing of release changes here.
- **Controls** would own a ratchet that no record boundary takes its revision from a raw `GITHUB_SHA`. Separate, and it needs Kai's go.

## Design questions

1. **Full ids only.** A 40 or 64 character hexadecimal id counts, compared without letter case; an abbreviation does not, because it cannot be matched across repositories. Proposed; the alternative is to allow a unique prefix.
2. **Where the trigger comes from.** The caller says it (`--trigger-revision`), because Testing cannot read the environment. A caller that omits it still gets `recorded-not-judged` on a mismatch, only without the cause named.
3. **Findings stop the Cases.** A revision finding goes into `evidence.integrity` and every Case is UNKNOWN, as for an untrusted report, even where the two ids are equal but not real revisions (for example both `abc`). Proposed, because evidence of an unnamed revision cannot be matched to anything.
4. **Record field names.** The observation record keeps `revision` and `expectedRevision`. Other records keep their own names (`sha`); a common field name is for later, with Release.

## Residual risks, kept visible

- A producer that names the head in the record but judged something else is not detected. The check compares names, not what was examined; the resolver (Hosting) is what ties the name to the checkout.
- A caller can pass the trigger as the judged revision too. The check sees equal ids and says ok. Only the source of the judged revision (the resolver) prevents it, so this Change is half of the contract.

## Not in this Change

No resolver, no ratchet, no change to Release's records, no workflow, WIRE, flag, ruleset or required check, and no change to `run`, `observe` or `mutate`.

## Ids

Change `testing/C84`, Intent `testing/I52`, Requirement `testing/F177`, Architecture `testing/A63`, Cases `testing/T420` to `testing/T425`. Ids are taken by hand and Release confirmed no clash; on a clash the newer PR renumbers.
