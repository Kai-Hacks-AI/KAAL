# C42 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The PLAN template now has its source in release management, built like everything else in engineering, and the HOW TO WORK table is a plain addition after the existing chapters. T620 to T622 went from RED to green by one file, `05-src/wiring/templates/plan.md`, equal to the draft in `interface.md`. Nothing under `.github` moved.

## Learned

The lifecycle changed twice during review: the CPO asked for the Worker's first step to be creating the branch and a draft PR, so the default table grew from four to five rows. Because the Cases list the rows in a MUST list, every revision touched the draft, the Cases and the chapter text together. A small script that rewrites those three places in one go removed the drift between them.

## Lacked

A check that the source template and the installed `.github` template still agree after a WIRE. Until the WIRE lands the two differ on purpose, and nothing records the difference.

## Longed For

One promotion that carries the six template Changes in order, then a single WIRE that installs them under `.github`, with the Owner loading only what a ruleset file requires.

## Follow-ups

- Promote C42 with the other template collectors, in the CPO's order.
- WIRE the PLAN template to `.github/PULL_REQUEST_TEMPLATE/plan.md`; it travels alone.
