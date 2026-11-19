# C96 change

## PLAN

1. Add the Cases T1165 and T1166 (release/F73), T1167 and T1168 (release/F74) and T1169 (release/A67), all RED, next to the elements they test, and the drafts in `interface.md` (the Requirements F73 and F74, the extended declaration and reader, `deliveryMixed` in the checker, `withDelivery` and its use in `run.mjs`, the shorter `evidence.do`).
2. Observe the expected RED and that each Case can pass with the drafts as the DO's files (`evidence.md`).
3. The PLAN adds no source file, nothing under `.github`, `.githooks`, `.kaal`, `.agents` or `.claude`, no variable and no setting.

## What changes, in the Owner's terms

- **Delivery is every declared location.** `.agents` and `.claude` join the declaration, each wirable (the Owner's default: a WIRE may install unless a dedicated control says otherwise). The declaration gains `files`, the files at the repository root that are delivery: `package.json` and `package-lock.json`. They are not wirable yet: a WIRE target is one file under a root, and a WIRE of a root file needs an exact-file rule in the classifier and the install judge, a later slice.
- **Delivery never travels with solution.** `deliveryMixed` of Change Isolation reads the declaration and names every solution path in a change that touches delivery. It is detective: it prints and gates nothing, so no new enforcement starts. Core's rule stays as it is and a change that touches Core is not judged by the new one.
- **Pull Promotion counts delivery as DO evidence from the declaration.** Its own declaration keeps `packages` and `engineering`. The command composes the rest. The package `kaal-release` stays standalone.

## FAR

1. **Regression tests (protect what we have).** All Cases of `engineering/release-management` and all tests of `engineering/change-isolation` that are green on `main` stay green, including the CLI tests of the checker: its verdict, its violation lines and its exit code do not change. The reader's contract of C95 holds: T1162 and T1164 pass unchanged (a declaration without `files` is valid).
2. **Accept list (reduced contract, named Cases allowed to change).** Three Cases are amended in the DO, because the declaration now names more locations: T1159 (the declared roots are five, not three), and T1160 and T1161 (`.agents/skills/...` was their example of a path that is not a WIRE target, and `.agents` is now declared). They stay green after the amendment. No Case is allowed RED.
3. **Feature tests (everything the Change brings).** T1165 to T1169.

## Not in this Change

- Making `deliveryMixed` preventive (the gate), and its own control with an id and a registration. The rule gates nothing until the Owner decides, after it has run for real.
- Subsuming Change Isolation's own `.github` rule into the new one. It stays; both say the same for `.github` today.
- A WIRE of a root file, and multi-file WIRE recognition.
- Core's own rule (it travels alone) and the transition ledger of Change Isolation, which still spells `.github` in what an entry never admits.
- Judging what a package contract installs against the declaration.
