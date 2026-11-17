# release/D1: `check PR Envelope` refuses the agreed hotfix route

Owner: the release capability thread. Raised on 17 November 2026 from the CPO's review of the ACT of release/C63, which recorded the mismatch. It is a defect of the control and of the Cases that fixed the old route. This record changes no source, test or requirement.

## Record

```json
{
  "id": "release/D1",
  "context": "release (check PR Envelope, release/A33; requirement release/F17)",
  "expected": "A HOTFIX pull request into a hotfix/* branch from a Development branch is on its route; a PROMOTION from hotfix/* into main and a SYNC into hotfix/* or wire/* are on theirs.",
  "observed": "The HOTFIX route row requires a head under hotfix/, so the agreed HOTFIX is a FAIL, and a HOTFIX from a hotfix/ head into main is accepted. Any other TYPE from a hotfix/ head is a finding that it must be a HOTFIX, so the PROMOTION from hotfix/* into main is a FAIL, and its route row also requires a kaal/ head. The SYNC row requires a base under kaal/, so a SYNC into hotfix/* or wire/* is a FAIL.",
  "where": "05-src/plan-body/envelope.mjs (ROUTE, ROUTE_HINT, ROUTE_UNJUDGED and the hotfix/ head rule); 02-requirements/F17-envelope-rules/F17.md (the Route and HOTFIX body and head lines)",
  "status": "confirmed",
  "tests": ["release/T870", "release/T871", "release/T872", "release/T873"]
}
```

## Where the defect lies

Both. The control states the old route in code. The Cases fix the old route as the expected result: release/T161, T188, T189, T190, T191 and T192 assert that a HOTFIX comes from a hotfix/ head, that its base is not judged, or that F17 says so. The requirement F17 states it in words. The check is live, so a real HOTFIX into hotfix/* is refused today.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T870 | RED: a HOTFIX into hotfix/* from a Development branch is on its route | T870.red.mjs |
| release/T871 | RED: a HOTFIX off its route is a finding naming the route | T871.red.mjs |
| release/T872 | RED: a PROMOTION from hotfix/* and a SYNC into hotfix/* or wire/* are on their routes; the other routes are unchanged | T872.red.mjs |
| release/T873 | RED: F17 states the agreed route and no longer the old one | T873.red.mjs |

**Answered** only by a Run in which T870 to T873 pass in the Change that corrects the control and F17, with the six old Cases amended to the agreed route and passing, and every other Case of release-management still passing.

## Owner, acceptance, verification

- **Owner:** the release capability thread.
- **Acceptance:**
  - a HOTFIX with a base under hotfix/ and a head outside it is on its route;
  - a HOTFIX into main, into a collector or into a bare hotfix branch, or from a hotfix/ head, is a FAIL naming the route;
  - a PROMOTION from hotfix/* into main fits;
  - a SYNC into hotfix/* or wire/* fits;
  - the other routes are unchanged;
  - F17 states it.
- **Verification:**
  - the amended Cases are shown RED against the old control (done in the PLAN, `evidence.md`) and then GREEN in the DO;
  - the Cases are run in the DO;
  - the body of the HOTFIX template of release/C63 is run through the corrected check in the DO and reaches its UNKNOWN verdict with no finding.
- **Block:** the templates WIRE does not proceed until this Defect is answered.
