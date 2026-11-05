# Hosting: Test Plans

Hosting declares the two Test Plans every KAAL package has (hosting/F71). This file is the Boundary Check record; it ships with the package.

## Package Check

Hosting's own verification Cases: `test/verify.json` lists every delivered Case and the identifiers each covers, and `npm test` runs them against the installed copy (hosting/F20 to hosting/F25). `docs/testing.md` allocates what only the publisher can run.

## Boundary Check

**Status: not applicable.**

**Reason:** Hosting is the operating-system boundary (hosting/I10). Platform logic belongs here and nowhere else, so the check that lists where code decides by platform has nothing to find that Hosting is not meant to hold. Hosting's own sources and tests are not a target of the check (hosting/F67, hosting/A29).

This is a declared status with a reason, not a Case outcome. Nothing is omitted silently, and Hosting records no finding list and no decision of its own. The scan itself, `kaal-hosting-boundary --target <path>`, is Hosting's contribution to every other package's Boundary Check (hosting/F64 to hosting/F69).
