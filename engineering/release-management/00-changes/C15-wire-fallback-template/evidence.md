# C15 evidence

## Provenance

- Baseline: `main` at `a7ce82dae43a9232ba2b3b90db62d7a1fbe58234`, whose default template has the chapters Intent, Design, Verified by and Validated by.
- Method: T177 and T181 run over a tree that holds the documents of release/C14 and release/C15 with the old default template, and over a tree with the default template file of #1458. The nine other Cases of release/C14 were run over both trees as well.

## Result

| Case | Tests | With the old default template | With the template of #1458 |
| --- | --- | --- | --- |
| release/T177 | A42 | RED: the default template does not say that it is the fallback | green |
| release/T181 | G48 | RED: the default template does not start with the DEFAULT declaration | green |

With the template of #1458 all ten Cases (T172 to T181) are green.

## Order

#1458 was delivered into `kaal/release/wire-fallback-template` before this PLAN existed, which is the order the Owner has since ruled against. Its promotion #1461 is held until release/C14 is delivered.
