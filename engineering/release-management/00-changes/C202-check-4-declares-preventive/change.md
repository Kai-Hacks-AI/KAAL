# release/C202: the controls of check 4 declare preventive at the stations their check is judged at

## Reason
Release declares the mode a control is meant to run in, at a station, in the control's own record (`stations: [<Station>:<mode>]`, release/C167). The records of release/CTL40 (origin) and release/CTL41 (head evidence), the two controls of check 4 (`Promotion Source`), declare no station, so an adopting entry always asks for `detective`. The readiness of the swap (release/C201, `adoption-ready`) requires `preventive` at every station the helper can resolve. This Change makes the declaration for check 4, as its own small reviewed Change, so the swap WIRE carries nothing but the swap.

## The contract
- **Two records gain one line each.** `CTL40.md` and `CTL41.md` declare `stations: [Collecting:preventive, Hotfixing:preventive, Promoting:preventive, Wiring:preventive]`: the four stations a target can have (`stationOf`, release/C201), the check running on every pull request. Every station is a member of `STATIONS`. Nothing else of the two records changes: id, title, description, type, status, has, evidence and body stay as they are.
- **A declaration is intent, not enforcement.** The flag of the controls instance decides whether the intent applies (`advisory` reports without blocking; `on` blocks). With the flag `advisory` an entry reports and does not block. A job that has not adopted the flag (no `KAAL_FLAGS`) behaves as it does today, which is every installed workflow until a swap WIRE. An adopted entry with no flag file, a missing entry or an invalid value is an unknown decision: it fails with exit 1 and runs nothing (release/C167, T1801), never a pass. So a swap WIRE lands only after the flags are in place, which `adoption-ready` judges. This Change flips no flag, writes no flag file and installs nothing.
- **Only check 4.** The records of checks 1 and 2 (CTL23, CTL37 to CTL39, CTL42) are not touched. Each declares at its own swap.
- **Release owns the declaration, the Owner owns the flip.** The flip of the flag to `on` is a reviewed change of the controls instance on the Owner's own go, after this Change and the instance's `flags.json` are on main.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1800: the records of CTL40 and CTL41 are valid to the controls finder with the stations list, and declare `preventive` at exactly Collecting, Hotfixing, Promoting and Wiring, each a station of `STATIONS`; the rest of each record (id, title, description, type, status, has, evidence) is unchanged.
- T1801: with these records, the real entries of check 4 at every station: with the flag `advisory` a violation reports and exits 0, with the flag `on` it blocks with exit 1, satisfied facts exit 0, and with no flag file the entry exits 1 (an unknown decision), never 0.
- T1802: no record of check 1 or 2 (CTL23, CTL37, CTL38, CTL39, CTL42) declares a station in this Change.
All red until the DO.

## DO
The one line in each of the two records, the three Cases, nothing else.

## After it
ACT, PROMOTION. Then, on the Owner's separate go and in this order: the instance's flags for CTL40 and CTL41 (`advisory`, then `on`) and the swap WIRE of check 4, after `adoption-ready` for `promotion-source-plain.yml` is clean on main.

## Not in this Change
No WIRE, flag entry, flip, ruleset change or swap. No change to a judgment, an entry, a workflow or a trigger.

## Design: split and overlap
Split: none. Two records and one rule. It overlaps release/C201 only by reading its `stationOf` and `adoption-ready`, which are on the collector of C201; the DO is cut once C201 is on main.
