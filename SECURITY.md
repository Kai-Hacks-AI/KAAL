# Security Policy

## Reporting a vulnerability

Report vulnerabilities privately through GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/Kai-Hacks-AI/KAAL/security/advisories/new). Do not open a public issue, pull request or discussion for a suspected vulnerability.

Include what is affected (package, Engine file or workflow, and the commit), how to reproduce it, and what an attacker gains.

## Scope

The whole current tree of this repository's `main` branch, including its dependency metadata (`package.json`, `package-lock.json`) and its GitHub Actions workflows. Only the current state of `main` is supported; there are no maintained release lines.

## Triage

The Owner triages every report and every security alert (Dependabot, code scanning, secret scanning). A report is acknowledged within 7 days.

A fix follows the repository's established Change governance (see `engineering/github/branching.md`). Publishing the security advisory is a separate, Owner-led coordinated-disclosure decision. The fix reaching `main` is a condition for it, not a trigger: the Owner also weighs remediation readiness, affected parties, coordination with the reporter, and exposure risk.

## Exceptions

A valid alert stays open while it is being remediated. An alert is dismissed only with a justified, written reason in GitHub, such as a false positive or an accepted risk stated explicitly. That dismissal is the record of the exception; there is no separate exception list.

CodeQL analysis is required for applicable pull requests: missing or failed analysis, and findings exceeding the established security threshold, must prevent integration. Technical enforcement of this requirement is governed by the repository's security controls. Until that enforcement is verified, the requirement is a directive applied in review, not a guarantee given by the repository's checks.
