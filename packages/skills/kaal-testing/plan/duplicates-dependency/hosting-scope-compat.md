# Hosting scoped-name compatibility record for the duplicates acceptance scenario

Compatibility-only edit made on the Hosting 0.0.1 SYNC route (step 2, main `dd39d3b` into `kaal/hosting`, #869; route in #765).

The packed scenario `test/acceptance/duplicates.test.mjs` arrived from main byte-identical to C51 `7952449` (SHA-256 `7219a41d182c0ba9f33b272fc6509371c59e7b3409d09ea1f4806f26ca4e0829`), as recorded in `do-evidence.json` and `sources.json`. Those records are historical evidence of the relocation on main and are **not rewritten**. On the Hosting collector the package identity is `@kaihacksai/kaal-hosting`, so exactly two specifiers change:

- `import { execute } from "kaal-hosting"` becomes `import { execute } from "@kaihacksai/kaal-hosting"`.
- `install(["kaal-testing", "kaal-hosting"])` becomes `install(["kaal-testing", "@kaihacksai/kaal-hosting"])`.

The scenario on this collector has SHA-256 `c35d4b2b9bfb5eab8f9b12da9480eb308aa9bb36da28857089b256bb2b4872de`. No assertion, fixture, script text or helper changes. After Hosting's promotion and the Testing scoped rename (C36) the scenario is governed by that Change; nothing here pre-empts it. The `kaal-testing` name is unchanged here.
