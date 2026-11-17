# C61 interface

## Facts added per branch of `facts.branches`

```
{ name, ahead?, promoted? }
  ahead:    number of commits on the branch that main does not have; absent for not observed
  promoted: true when a pull request from this branch into main merged and the branch holds nothing beyond that pull request's head; false when none did; absent for not observed
```

## Added to each entry of the inventory

```
state:     "empty" | "done" | "open" | "UNKNOWN"
candidate: true | false     // a branch that is empty or done, has no open transport and is not the default branch
```

- `empty`: `ahead` is 0 and `promoted` is not true.
- `done`: `promoted` is true.
- `open`: otherwise.
- `UNKNOWN`: `ahead` and `promoted` are both absent. It is never guessed and never a candidate. The not-observed list of the station report does not change (release/T555 keeps that).

## The overview

Each place of `overview.places` also carries `empty` and `done`, the number of its branches in those states.

## `renderInventory(report, { place? })`

- With a place: the branch line ends with ` EMPTY` or ` DONE` for those states.
- With `place: 'stale'`: one line per candidate, ` <branch> EMPTY|DONE`, in the order of the places, and `no empty or done branches` when none. `stale` is a view, not a place: an unknown place still throws.
- Overview: each place line also shows `<n> empty, <n> done`.
