---
id: architecture/D1
reach: packages/kaal-architecture/, engineering/
---
# architecture/D1: the untagged kaal-architecture has no N+1 copy in engineering

Found at `packages/kaal-architecture/`, on the promotion of architecture/C16 (#2133) into `main`. A Defect of the repository's setup, found in the context of Architecture.

## Expected

A capability with no release tag has no N, so its N+1 is what the repository runs: the machinery of `packages/kaal-architecture` is deployed at `engineering/architecture` (one source per skill: exactly one of `.kaal/<cap>` and `engineering/<cap>` holds it). See engineering/F40 and engineering/F50, and Kai's rule that an untagged package is N+1.

## Observed

`packages/kaal-architecture/package.json` is `"private": true` and the package has never been published, so there is no N. `engineering/architecture` does not exist. Neither `engineering/architecture` nor `.kaal/architecture` holds the skill, so the capability is developed in `packages/` and runs nowhere.

## Proof

architecture/T27 reads the package and the repository and fails on `main`: the package is unpublished and `engineering/architecture` holds no `skills`.

## Not claimed

Which Change deploys it, and whether the deployment is a wire or a copy, is Engineering's. No control caught this: the control that would, one source per skill, does not exist yet. That is a gap in the controls, not a part of this Defect.
