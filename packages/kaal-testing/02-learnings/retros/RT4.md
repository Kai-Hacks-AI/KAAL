---
id: testing/RT4
format: 4L
reflects: [testing/C74]
---
Account of: I am the Testing agent who planned `testing/C74` (`#2240`) and executed its DO (`#2265`, twice) on collector `kaal/testing/hold-adapter`, and who wrote this retrospective; Kai and the CPO gave the go, the direction to take Hosting first and the approvals, Hosting built the listing option (`hosting/C112`), and this is my own account.

## Liked
- subject: writing the seven Cases `T384` to `T390` as plain `.test.mjs` files with exported ids in the PLAN, before any code
  keeps: when the DO had to be redone on Hosting, every observable outcome was already pinned, so the second version needed only an `await` in six Cases and the same seven passed.
- subject: stating the `node:fs` exception openly in the DO's pull request, with the alternative and what it would cost
  keeps: the CPO chose the other route in one comment and nothing else depended on the pull request, so the redo cost one Change of Hosting's and one revision of mine, not a contract Testing would later have to unwind.
- subject: running the Cases against a throwaway reference implementation kept outside the repository
  keeps: the PLAN's Cases were known to pass against some implementation before the DO began, so a failing Case in the DO pointed at the DO.

## Learned
- subject: Hosting's `list` refuses a link to a directory and cannot leave a name out, so a checkout that holds `node_modules` cannot be listed through it
  source: the doc comment of `list` and `references/operations.md` in `packages/kaal-hosting` as they were before `hosting/C112`, and the failure observed in the first DO; the new options are in the same reference after #2278.
- subject: a collector branched before a judge changed fails `verify Stages` until a SYNC of main is merged in, and each promotion that lands afterwards needs another
  source: release's explanation of `#2253` on `#2265` and `#2260`, and the two SYNCs this collector took (`#2266`, `#2286`).

## Lacked
- subject: a look at Hosting's listing against the catalog's needs before writing A54
  decision-point: writing architecture A54 ("walks the tree once") and `T384` to `T390` as synchronous calls, without reading what Hosting's `list` does with links.
  cost: the first DO took a read of `node:fs`, which the boundary Case, the README sentence and its evidence pin all had to declare; the CPO then chose Hosting first, which needed `hosting/C112` (PLAN, DO, ACT, promotion) and a second DO.
  findable: yes
  address: Skill
- subject: whether the collector held main's tip before the DO was opened
  decision-point: opening `#2265` on a collector branched before `#2253`.
  cost: a red `verify Stages` and `Branching`, `#2266`, a second SYNC `#2286` for `hosting/C112`, and two merges of the collector into the DO with a conflict in the `scripts.test` line and in `T160` each time.
  findable: yes
  address: AGENTS.md

## Longed For
- subject: a Case lifecycle in which a RED Case is discoverable without a `.red.mjs` file
  worked-anyway: the catalog lists `.red.mjs` files as parked and the CPO's approval says that recognition is transitional, not an endorsement of the form.
- subject: Hold consuming `catalog.complete` and both quote forms in `release/C125`
  worked-anyway: the evidence file carries `catalog.complete` and a duplicate id is UNKNOWN in the map, so a defective catalog cannot show GREEN even before C125 lands.

Decisions: none made, the owner decides.
