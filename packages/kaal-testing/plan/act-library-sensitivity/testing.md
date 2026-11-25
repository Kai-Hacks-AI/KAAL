# ACT library sensitivity: Testing

The planned Cases live in `packages/kaal-testing/test/plan/act-library-sensitivity/`, named `T<n>.test.mjs` and never renamed. They read the pilot record, `plan/act-library-sensitivity/pilot.md`, and so are RED by assertion until `testing/C79` writes it. They decide structure only, never prose. The aggregate `test/plan/act-library-sensitivity.test.mjs` runs them and `testing/C79` appends it to `package.json` `scripts.test`.

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| testing/T395: the pilot record is pinned and complete | testing/F170, testing/F171 | the record exists, names a 40-hex commit SHA, holds at least twelve mutant rows `M<n>` with the six cells filled, each observation starting `killed by <Case>`, `survived`, `invalid` or `unresolved`, and every claim `K1`–`K8` of `requirements.md` appears in a row or is listed untested with a reason |
| testing/T396: every survivor is handed over, none is fixed here | testing/F172, testing/N38 | each `survived` row's judgment starts with one of the seven allowed judgments, the record lists the justified Cases as text, and the Change touches no file under `engineering/` (read from the record's own statement of the files it adds, checked against the tree it sits in) |

## RED evidence

`node --test packages/kaal-testing/test/plan/act-library-sensitivity.test.mjs` on `main`: both are RED by assertion (`missing: …/pilot.md`). See `evidence.md`.
