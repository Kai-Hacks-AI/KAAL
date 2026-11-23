# architecture/D1: the untagged kaal-architecture has no N+1 copy in engineering

Found at `packages/kaal-architecture/`, on the promotion of architecture/C16 (#2133) into `main`. A Defect of the repository's setup, found in the context of Architecture.

## Record

```json
{
  "id": "architecture/D1",
  "context": "architecture (the untagged package, where it runs)",
  "expected": "A capability with no release has no N, so its N+1 is what the repository runs: the machinery of packages/kaal-architecture is deployed at engineering/architecture, and exactly one of .kaal/<cap> and engineering/<cap> holds a skill (engineering/F40, engineering/F50).",
  "observed": "kaal-architecture has no N: @kaihacksai/kaal-architecture is not on npmjs (the registry answers 404 on 2026-11-20, while @kaihacksai/kaal-guard answers 0.0.4 from the same registry) and the repository holds no release tag of it. engineering/architecture does not exist, and neither it nor .kaal/architecture holds the skill: the capability is developed in packages/ and runs nowhere.",
  "where": "packages/kaal-architecture/, engineering/",
  "reach": "packages/kaal-architecture/, engineering/"
}
```

## Proof

architecture/T27 asks the npm registry whether the package exists (it is private in the repository, which says nothing of what was published, so that is not the premise). Not found means no N, and then it fails on `main`: `engineering/architecture` holds no machinery. If the registry has the package, the Case does not judge, and if the registry cannot be reached it cannot judge either.

## Not claimed

Which Change deploys it, and whether the deployment is a wire or a copy, is Engineering's. No control caught this: the control that would, one source per skill, does not exist yet. That is a gap in the controls, not a part of this Defect.
