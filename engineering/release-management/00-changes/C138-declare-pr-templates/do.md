# C138 do

## What the DO added

- `05-src/wiring/templates/`: the first line of `act.md`, `hotfix.md`, `promotion.md` and `sync.md` is now `<!-- KAAL-PR-template: <TYPE> -->` with its TYPE; `plan.md` and `do.md` are new sources, copied from the installed `.github/PULL_REQUEST_TEMPLATE/plan.md` and `do.md` with the declaration on top, so the six declared TYPEs each have one source. `wire.md` is not touched and not declared.
- T1540 renamed from `.red.mjs` to `.test.mjs`, green: the reader derives exactly PLAN, DO, ACT, SYNC, PROMOTION and HOTFIX from the sources without a finding, each opening with `Change`, each source opening with its declaration.

## Checked

The Cases runner: 415 of 415 green on this tree (T640, T650, T660 and T830 were amended in the PLAN and are not touched here). The DO changes no Case other than the rename of T1540, which follows the lifecycle that exists today and is not endorsed as the model (see release/C136).

## Not done

No `.github` file is edited and nothing is installed: the installed templates carry no declaration until a WIRE, byte-equal to these sources, with the Owner's go. WIRE and DEFAULT are not declared, as agreed. Until the WIRE, the check release/CTL11 reads the templates of the base commit and still sees an empty registry on `main`.
