# kaal-skills

What makes a KAAL Skill integration-ready, stated once: the Intent, the Requirements and the Cases. It ships nothing. It is not a runtime, a framework or a package a capability depends on.

A Skill is integration-ready when a caller that is not an agent (a hook, a CI step, another tool) can invoke whatever the capability makes mechanical, read an honest result, and add none of the capability's rules to do so; and when whatever stays judgment is declared as judgment, with a mechanism the capability owns that returns the reminder an integrator can hand an agent. Each capability declares this in `integration.kaal.json` beside its `ownership.kaal.json` and realizes it in its own way. The declaration format is in [format.md](format.md).

```
plan/integration-readiness/    the approved PLAN (skills/C1): intent, requirements, architecture, testing, evidence, assessment
test/plan/integration-readiness/  the Cases T260 to T267 (skills/F1 to F7, N1)
test/lib/conforms.mjs          the common evaluator, read only by the Cases
test/integration.test.mjs      runs the Cases: npm test
format.md                      the declaration format
```

## Run

```sh
npm test -w kaal-skills      # or: node --test packages/kaal-skills/test/integration.test.mjs
```

The Cases evaluate a draft declaration of Testing and a draft of Architecture (a pinned snapshot of its collector), both under `plan/integration-readiness/evidence/`. A package's real declaration, once its owner adds one, is found by `discover(root)`: `packages/*/integration.kaal.json`, no registry. A package with none is reported UNKNOWN, never conforming.

## Verdicts

Each Requirement gets PASS, FAIL or UNKNOWN per declaration, with a reason per mechanism. Missing evidence (no fixture, a mechanism that cannot load, no activation, no declaration) is UNKNOWN. UNKNOWN is never PASS and never clear.

## Boundaries

`kaal-skills` installs nothing into a hook or workflow, migrates or retires no control, and is not a promotion gate: no ruleset, check or workflow requires a declaration. Wiring is Engineering's and the Controls Change's. Each capability owns its declaration, mechanisms and fixtures.
