# Engineering: RED Cases for a promotion that carries its own ledger entry (PLAN #1019, Change 1 of 3)

Capability: Engineering. Collector: kaal/engineering. Record number is provisional until
integration.

## Intent

Kai (5 November): move the ledger hotfix (#1019) ahead of Hosting 0.0.1, so a promotion carries its own transition ledger entry and ledger-only PRs end. The route is three separate Changes: this one (the RED Cases), the checker and adapter, and the `.github`-only review-event workflows.

## Plan and Do

PLAN: `engineering/change-isolation/ledger-in-promotion-plan.md` (PR #1019), Cases R1 to R21. This Change adds one file, `engineering/change-isolation/ledger-in-promotion.red.mjs`, engineering/T90 to T110. It fixes the interface the implementing Change must provide (`check(..., { carried, attested })`, `attestation.mjs`, two workflow files). No checker, workflow, ruleset or ledger changes here.

## Check

Run by hand, as the other `*.red.mjs` Cases: `node --test engineering/change-isolation/ledger-in-promotion.red.mjs`.

Today: 7 pass and 13 fail. The seven passes are the controls on the current checker (R2, R3, R5, R7 to R10); they must keep passing so a design that admits everything turns them RED. R1 is RED because the checker ignores a carried entry. The others are RED because `attestation.mjs` and the workflows do not exist. R11 (hook agreement) is planned with the hook change.

## Act

Answered only when the same unchanged file is GREEN in the implementing Change. Do not edit it to pass. No promotion or publication is authorized.
