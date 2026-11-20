# architecture/D2: the package keeps its source at the package root, outside the package layout

Found at `packages/kaal-architecture/`, on the promotion of architecture/C16 (#2133) into `main`. A Defect of the package, found in the context of Architecture, and a different failure from architecture/D1: D1 is where the capability runs, D2 is how its folder is shaped.

## Record

```json
{
  "id": "architecture/D2",
  "context": "architecture (the package folder)",
  "expected": "The package folder follows the package layout that kaal-engineering holds in its layout template, packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json, as it stands now (engineering/F45 and the Changes that have since evolved it): its root files and its folders, with the Skill and the scripts in the source folder. The template is the authority and the Defect does not copy its folders.",
  "observed": "The package keeps lib/, skills/ and test/ at its root, and 00-changes, 01-intent, 02-requirements and 03-architecture under the older numbers: against the template as it stands on main, these root folders are not in the layout. 14-defects, which holds this record, is.",
  "where": "packages/kaal-architecture/",
  "reach": "packages/kaal-architecture/"
}
```

## Proof

architecture/T28 reads the template at the time it runs, lists the tracked root folders of the package and fails on `main`: `lib`, `skills`, `test` and four numbered folders are not in the layout.

## Not claimed

That every package is in the same state, and that the ratchet over `packages/` is the Change that moves it, are Engineering's. Where the correction belongs is Architecture's.
