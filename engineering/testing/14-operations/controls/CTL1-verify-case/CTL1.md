---
id: testing/CTL1
title: verify Case
description: It reveals any Case file that is malformed, unattributed, duplicated, missing callable run, or carrying a stale header.
type: detective
status: designed
has: [testing/I48]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# testing/CTL1 verify Case

A detective control that is meant to become preventive. `verify Case` consumes Testing's `kaal-testing/case-form@1` report for Case files in repository context, requires positive `catalog.complete === true` and `targets.checked === true`, and reveals authoritative form and attribution failures (`no-id`/`missing-id`, `invalid-id`, `duplicate-id`, `absent-attribution`, `malformed-attribution`, `missing-run`, `non-callable-run`, `unknown-subject`, and non-exempt `stale-header`) while preserving checker uncertainty (`unverified-target`, `catalog-incomplete`, `targets-unchecked`, `unreadable`) as `UNKNOWN`, never as false `FAIL` or `PASS`.

It checks form and attribution only: it does not parse source independently, does not allow policy exemptions to suppress uncertainty or execution/attribution failures, and does not judge assertion strength, coverage sufficiency (`demand Cases`), test drift (`limit Test-Drift`), or execution (`observe Cases`). It has one Intent, `testing/I48`, which holds the details with `testing/F173` and `testing/A59`. It rolls out detective first: (1) observed locally against real trees with all findings classified; (2) advisory CI and pre-push feedback behind a feature flag while collecting `[fixture:2, real:1, provoked:1:fail]` evidence; (3) preventive only with explicit Owner authorization.
