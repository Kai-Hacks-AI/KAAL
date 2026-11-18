# C61 interface

## Facts added per branch of `facts.branches`

```
{ name, head?, ahead?, settled? }
  head:    the commit the branch points at; absent for not observed
  ahead:   number of commits on the branch that main does not have; absent for not observed
  settled: false when the host knows no closed or merged piece from this branch;
           { outcome: "delivered" | "discarded" | "closed", head } for the newest closed or merged piece from this branch: the host's merged read as delivered, closed unmerged as only closed (a transport's outcome, not a decision to discard), and discarded only from a separate explicit discard decision that nothing reads yet (head = that piece's last commit);
           absent for not observed
```

## Added to each entry of the inventory

```
state:   "wip" | "delivered" | "discarded" | "UNKNOWN"
settled: true | false      // state is delivered or discarded
```

The first rule that applies:

1. The branch has an open piece (`transports` not empty): `wip`.
2. `head` or `settled` absent: `UNKNOWN`.
3. `settled` is an outcome and its `head` equals the branch `head`: `delivered` or `discarded` as the outcome says, whatever Git ancestry says (a squash promotion). An outcome `closed` never settles the branch: it is `UNKNOWN`; `discarded` exists only with the separate explicit decision.
4. Otherwise (no settled piece, or commits added after it): `wip` when `ahead` is more than 0, `UNKNOWN` when `ahead` is 0 or absent (nothing proves what became of the work).

Insufficient or conflicting evidence is therefore never settled. The default branch is not in the inventory. The not-observed list of the station report does not change (release/T555 keeps that).

## The overview

Each place of `overview.places` also carries `delivered` and `discarded`, the number of its branches in those states.

## `renderInventory(report, { place? })`

- With a place: the branch line ends with ` DELIVERED` or ` DISCARDED` for those states.
- With `place: 'settled'`: one line per settled branch, `<branch> DELIVERED|DISCARDED`, in the order of the places, and `no settled branches` when none. `settled` is a view, not a place: an unknown place still throws.
- Overview: each place line also shows `<n> delivered, <n> discarded`.
- Nothing here deletes or changes a branch.
