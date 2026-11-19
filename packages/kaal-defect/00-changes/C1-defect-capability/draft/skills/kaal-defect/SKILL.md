---
name: kaal-defect
description: Define a Defect, give it an identity and check that a Test Case proves it. Use when you find something wrong and must decide whether it is a Defect, name it, or check that Defects are proven.
license: MIT
---

# KAAL Defect

A Defect is a negative Requirement: what must not be the case. It is raised from the side, and its root sits beside Intent.

## Route

Finding, then Test Case, then Defect, then a Change or a HOTFIX. A finding that no Test Case proves is not yet a Defect. The Test Case is owned by kaal-testing (see kaal-testing). The HOTFIX needs one Defect and a Test Case RED on main (see kaal-release). The Requirement a Defect negates is owned by kaal-requirements (see kaal-requirements).

## Identity

`<capability>/D<n>`, counted per capability. The record stays with the context that raised it. A placement elsewhere never moves it.

## Proof

A Test Case verifies a Defect, as it verifies a Requirement. The Test Case names the Defect in its `tests`; a Defect lists no Test Case.

Run `node scripts/check-defects.mjs <dir>`. It reports `unproven` for a Defect no Test Case names and `invalid` for an id that does not fit, and exits 1 on either. It does not run a Test Case.
