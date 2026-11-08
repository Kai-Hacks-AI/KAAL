# Architecture and the chosen route

## Diagnosis (preserved)

An exact `0.0.1` pin cannot be satisfied by a 0.0.2 workspace. npm then installs a
nested registry 0.0.1 beside the workspace copy. That breaks C15's
single-candidate guarantee and the Core "no nested node_modules" assertion, and is
the "Missing from lock file" failure seen in the earlier #838 CI run. Keeping the
consumers on 0.0.1 is therefore not an option.

The required end state is exact pin alignment: every workspace consumer of
`@kaihacksai/kaal-foundation` pins exactly the workspace version. This is not
circular. The workspace link satisfies it locally, so `npm ci` does not depend on
the registry, and the publish order stays Foundation first.

## Chosen route (Owner decision on this PR: Engineering-coordinated, option A)

Coordination is not ownership transfer, and no shared Change sequence or
Foundation-owned collector is created.

| Owner | Owns |
| --- | --- |
| Foundation | The 0.0.2 declaration and version work (C15/C16) and its own Change numbers. Nothing in Core, Change or Testing. |
| Core | Its exact Foundation pin, the matching assertion in `engineering/acceptance/embed.test.mjs`, its acceptance, and its own Change number. |
| Change | Its exact Foundation pin, the `providers.test.mjs` registry fixture, its acceptance, and its own Change number. |
| Testing | Its exact Foundation devDependency pin, its acceptance, and its own Change number. |
| Engineering | Dependency ordering, coherent root-lock generation, trusted migration admission, and any atomic or staged `main` delivery, preserving each owning Change and its review gates. |

Owner separately authorizes integrations, SYNCs, promotion and publication. Nothing
here does.

## What Foundation asks of Engineering

Core travels alone under the current trusted-main isolation checker, and #833 does
not by itself admit this transition. Foundation asks Engineering to define the
ordering and admission route so that the 0.0.2 version bump and the three owners'
pin updates reach `main` without a state where `npm ci` or the no-nested-copy
assertion is red. Never hand-edit the lock; never weaken the nested-copy assertion
or the acceptance ledger.

## Invariants and evidence to preserve

- No nested `@kaihacksai/kaal-foundation` anywhere after the transition.
- A consumer left on 0.0.1 must fail the no-nested-copy check (negative case).
- A clean `npm ci` and Acceptance on Linux, macOS and Windows (C16's T51 scenario).
