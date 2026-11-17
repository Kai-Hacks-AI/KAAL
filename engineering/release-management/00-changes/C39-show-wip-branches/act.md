# C39 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The package rule was written as plain facts (version, tags, published versions, changed since tag) before any reader existed, so the Script stayed a pure function and the reader could be reviewed apart. Each review round added a Case that failed on the previous head (T559 for tag pagination and a cut comparison), so the fixes are proven.

## Learned

An unfinished list is not an empty list: a cut tag page or a cut file comparison must give UNKNOWN, never "no tag" or "unchanged". `latest` alone is never proof that a package is current, every version and dist-tag counts. The host-term Case (`coordination/T36`) and the open-pieces Case (`coordination/T38`) guard the Script and the command, so a new word or a new read must be argued in the PLAN. A code scanner flags a single-slash replace on a scoped package name, a global pattern fixes it.

## Lacked

A way to read the tags of one package without paging through all of them. A shared fixture for facts with branches, so each Case does not rebuild its own. The tag convention was decided late (`@kaihacksai/<name>@<version>`), so `parseTag` had to accept both forms.

## Longed For

The six unscoped packages renamed, so the unscoped form can leave `parseTag`. A real run of the overview against the live repository recorded as evidence after the promotion. The inventory feeding the promotion seat decision.

## Follow-ups

- Record a live overview run after promotion.
- Remove the unscoped tag form once the rename has landed.
