# engineering/C22 evidence (PLAN)

Run on 19 November 2026 in a clean checkout of `origin/main` at e221e990, Node 24, Linux, after `npm ci` and `npm run build`. The Cases run through a small driver that imports each `.red.mjs` and calls `run()`.

```
RED   engineering/T386 - git show was started: git ls-tree -r -z --full-name main | git show main:n0/N0.md | …
GREEN engineering/T387
GREEN engineering/T388
RED   engineering/T389 - base main: 0 registered scope(s), 0 admitted Capability Node(s)   (exit 0, expected 1)
```

T386 and T389 fail for the stated reason only; T387 and T388 are GREEN by design. The built `packages/kaal-hosting` on `main` exports no `readRevision`.

Measurement on this repository's `main` (built `readRevision` of the Hosting DO versus the check's present reads): 1 call, 112 ms, 2,089 files, 7.7 MB, 1,069 Markdown files, 3.04 MB; present way 1,070 starts, 3,681 ms.
