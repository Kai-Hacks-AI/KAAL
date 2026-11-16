# C39 interface

## Facts added to `showWip(facts, config)`

```
branches: [ { name } ]                                   // every branch of the repository, main included
packages: [ { name, version, private, latest, tags, beyondTag } ]
  latest:    a version string, null for never published, absent for not observed
  tags:      [ "0.0.1", "0.0.2-rc.1" ]  // versions of tags named <package>@<version>, absent for not observed
  beyondTag: true | false                // main has commits the newest tag equal to latest does not; absent for not observed
```

## Config added

```
default: "main"
places: [ { place: "hotfix", branch: "hotfix/*" }, { place: "wire", branch: "wire/*" }, { place: "kaal", branch: "kaal/*" } ]
development: "development"                // the place of every other branch
```

## The inventory in the report (only when `facts.branches` is present)

```
inventory: {
  places: [ { place, branches: [ { branch, place, listed, transports: [ { ref, into, type, disposition, reason } ] } ] } ],
  packages: [ { name, private, version, state, next?, coming?, stock, reason?, note? } ],
  overview: { places: [ { place, branches, withTransport, transports } ], packages: { <state>: count } }
}
```

`listed` is false for a branch that only a PR named. A transport holds the reference and a pointer to the existing disposition, never the PR's full content.

## `renderInventory(report, { place? })`

Without `place`: one line per place with counts, and one line per package state. With `place`: one line per branch of that place and its transports. An unknown place throws.
