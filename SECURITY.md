# Security Policy

## Reporting a vulnerability

Report vulnerabilities privately through GitHub's private vulnerability reporting: [report a vulnerability](https://github.com/Kai-Hacks-AI/KAAL/security/advisories/new). Do not open a public issue, pull request or discussion for a suspected vulnerability.

Include what is affected (package, Engine file or workflow, and the commit), how to reproduce it, and what an attacker gains.

## Scope

The whole current tree of this repository's `main` branch, including its dependency metadata (`package.json`, `package-lock.json`) and its GitHub Actions workflows. Only the current state of `main` is supported; there are no maintained release lines.

## Triage

The Owner triages every report and every security alert (Dependabot, code scanning, secret scanning). A report is acknowledged within 7 days.

A fix goes through `kaal/hotfix`: a Change into `kaal/hotfix`, then its promotion to `main`, landed back to back so the fix is public for as short a time as possible before `main` carries it. The security advisory is published once the fix is on `main`.

## Exceptions

An alert that is not fixed is dismissed in GitHub with a written reason. That dismissal is the record of the exception; there is no separate exception list.

Code scanning (CodeQL) is advisory: its results are triaged as above and do not block merges.
