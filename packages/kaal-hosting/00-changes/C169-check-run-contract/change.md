# hosting/C169 change

## From

1. The fact `postCheckRun` returns says `externalId: "run-77"` because the caller asked for it, whatever GitHub's answer holds. A reader of the fact takes a correlation to be confirmed that Hosting did not confirm.
2. `{ ...check, status: undefined }` (or any other key outside the check with the value `undefined`) is accepted and ignored, against the C117 PLAN's "any other key is `INVALID_CHECK`".

## To

1. **The external id is verified, not echoed.** When the caller gave one, GitHub's `external_id` must be that text, otherwise `CHECK_MISMATCH` (another one, none, an empty or a non-text one). When the caller gave none, none is reported; GitHub's empty, null or absent id is "none", and any text it invented is `CHECK_MISMATCH`. The fact states only what GitHub returned. hosting/T354.
2. **A key outside the check is refused whatever its value.** Only the listed keys may be present; `undefined`, `null`, `false`, `0` and an empty string are values too, and `externalId: undefined` means none. The same holds for an option key and for a symbol key. hosting/T355.

## Because

A fact Hosting makes is a statement others rely on: it must not claim what was not confirmed, and the closed list of what a caller may name must be closed in fact. Both are Hosting's own contract (hosting/F112), found before any consumer relied on it.

## FAR (because of Features we have to Accept Regression)

1. Regression: Hosting's Cases T1 to T348 stay GREEN. T345 posts with an external id the stand-in echoes, and T347 refuses by value; neither changes.
2. Accept list: none.
3. Feature Cases, RED today. Executable drafts in this folder (`post-check-contract.red.mjs`; red on `main` with C117, green on the implementation they describe). The DO turns them into delivered Cases **unchanged**.
   - hosting/T354: the external id is reported only as GitHub returned it; another, a missing, an empty and a non-text one are `CHECK_MISMATCH` with one request each; none asked, none reported, and an invented one is `CHECK_MISMATCH`.
   - hosting/T355: every key outside the check, with each of five falsy values, and every option key with `undefined`, and a symbol key of the check or of the options, is refused before any call; `externalId: undefined` is allowed and means none.

## Not in this Change

Any DO. A retry, an update or a listing of check runs; the Inspector's workflow (Controls); a ruleset; any WIRE.

## DO

Not authorized by this PLAN. On the merged PLAN: `scripts/github/app-checks.ts` (the external-id comparison and the key checks), T354 and T355 delivered in `04-test/package-check/app-checks.test.mjs`, the wording of hosting/F112 and A49, the allocation row, and the README and operations entries where they speak of the fact.

## ACT

The retrospective, in the ACT template's chapters, after the DO.
