# Edge and scope

A Test Case points at a Defect with its first line, `// Case <id> tests: <defect id>`. The Defect lists no Test Case. A Defect is `<owner>/D<n>`, counted per owner, and its record is an md file whose front matter has `id`.

## Scope

A Defect describes the underlying undesirable condition, not merely the observed symptom or where it was found. It expresses its scope in its description; it has no mandatory path-based reach and its records carry no coverage metadata. A Test Case verifies that condition robustly, across its relevant manifestations and contexts, without a complex metamodel. Existing relationships: Test Case verifies Defect; Review validates Defect (is its scope meaningful) and validates Test Case (adequate, robust, reproducible); Testing owns the verification evidence; Architecture owns where the correction belongs.
