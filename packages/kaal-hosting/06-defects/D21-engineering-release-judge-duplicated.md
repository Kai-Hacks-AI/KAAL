# hosting/D21: Hosting's tests re-judge release readiness and the verification record with Engineering's Release judge, and import a KAAL path to do it

Owner: Hosting. Raised on 9 November 2026 by the Owner: tests live in one place and run against their targets, and a dependency on KAAL is fine for development but not for running. Hosting's publisher tests import `engineering/release/release.mjs` and call its `readiness` and `verification`, so the same judgments are made twice: once by Engineering's Package control on every package that leaves main, once by Hosting's own Cases. The release engine is to be removed from that path, and these imports would then stop the publisher suite from running.

## Where it sits

Located in the order Intent, Requirements, Architecture, Code, on main 251e814.

- **Intent:** hosting/I5 and hosting/I6 ask for a correct package and a consumer-run verification. Neither asks Hosting to judge release readiness.
- **Requirements:** hosting/F15 (exact runtime versions) and hosting/F21 and hosting/F22 (the result and evidence record) are Hosting's contract and stay. No Hosting Requirement asks for Engineering's judge to be re-run. Only `00-changes/release-interoperability/plan.md` cites it (engineering/F32).
- **Architecture:** hosting/A25 places the publisher-only Cases; it does not place a re-judgment of Engineering's rules.
- **Code:** `04-test/engineering-check/publisher/release-record.test.mjs` (hosting/T83, hosting/T84, hosting/T85, hosting/T86) and `dependency-successors.test.mjs` (hosting/T174) import the judge.

## Record

```json
{
  "id": "hosting/D21",
  "context": "hosting (publisher tests, release interoperability)",
  "expected": "Hosting's tests assert Hosting's own contract (hosting/F15, hosting/F21, hosting/F22) against Hosting. Engineering's readiness and acceptance rules are judged once, by Engineering's Package control, and no Hosting test imports a file of KAAL's engineering directory.",
  "observed": "release-record.test.mjs and dependency-successors.test.mjs import ../../../../../engineering/release/release.mjs and call readiness() (hosting/T83, hosting/T174) and verification() (hosting/T84 to hosting/T86), so Engineering's rules are re-judged inside Hosting and the publisher suite depends on that file to run.",
  "where": "packages/kaal-hosting/04-test/engineering-check/publisher/release-record.test.mjs and dependency-successors.test.mjs",
  "status": "open",
  "tests": ["hosting/T270", "hosting/T271"]
}
```

## Cases

| Identity | Role (a role of an ordinary Test Case, not a kind of Case) | File |
| --- | --- | --- |
| hosting/T270 | RED role on 251e814: two Hosting test files import a file of the engineering directory | [no-engineering-import.red.mjs](no-engineering-import.red.mjs) |
| hosting/T271 | passes before and after the fix, behavior that already works and must keep working: the five exact runtime dependency versions of hosting/F15 | same file |

**Confirming Run (9 Nov, Node 24, Linux, 251e814):** the Case in its RED role fails, naming `release-record.test.mjs` and `dependency-successors.test.mjs`, and the other passes. The fix is a separate Change; the Cases are not edited.
