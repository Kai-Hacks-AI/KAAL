# C22 baseline

The baseline is `main` after the promotion of release/C12, C20 and C21 (#1536). `main` holds the envelope judge, the HOTFIX head rule, the verdict contract and the Hotfix interface (release/F16).

- A `DO` from a head `hotfix/x` into a collector gives no finding: the route row of DO looks at the base only.
- A HOTFIX with an empty Defect chapter gives no finding: only the Change chapter is checked for content.
- The Change chapter shape of a HOTFIX is reported as having no row.
- Every HOTFIX result is UNKNOWN, for the base and for the Change identity.
