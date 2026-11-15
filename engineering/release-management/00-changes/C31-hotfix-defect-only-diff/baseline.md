# C31 baseline

The baseline is `main` at 888ce0f (the promotion of release/C27). `main` holds the envelope judge with the HOTFIX head rule, the chapter rules and the verdict contract (release/C21, C22), and the Defect reference (release/C23).

- No code looks at the changed paths of a HOTFIX.
- Every HOTFIX result lists defect-only scope under not judged.
- A HOTFIX diff with no Case, or one that changes `packages/a/` and `engineering/b/` together, gives no finding.
