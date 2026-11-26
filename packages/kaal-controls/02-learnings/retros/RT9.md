---
id: controls/RT9
format: 4L
reflects: [controls/C142]
---
Account of: I am the controls thread. I wrote the PLAN and the DO of C142 (verify Adapter) and this retro of my own collector. This is my account only: I have not asked the CPO or Testing what they lacked.

## Liked
- subject: building the DO against a Case that already existed on the collector
  keeps: T1517 was RED before `verify-adapter.mjs` and GREEN after it, so the DO was the smallest code that satisfied the Requirement, with no design left to decide.

## Learned
- subject: a check can keep what it confirmed on the error it throws
  source: `findUnadapted` throws with `confirmed` and `unknown` when one observation is missing, so the adapter's UNKNOWN still carries the confirmed nonconformances beside it, as F203 item 3a asks.
- subject: only the controls the check judges need an observation
  source: a control with neither a station nor a delivery is skipped, so its missing observation is no unknown; a stale or malformed observation still is.

## Lacked
- subject: a way to see that the Case and the unit tests together cover every branch of a pure check
  decision-point: writing the unit tests after the Case was GREEN.
  cost: three extra unit tests, written by reading the code and not from a coverage figure.
  findable: no
  address: none

## Longed For
- subject: a shared helper for the validation each of C142 to C146 repeats (non-empty string, plain object)
  worked-anyway: each script carries its own two-line copy, which keeps the checks independent until a concern needs the helper.

Decisions: none made, the owner decides.
