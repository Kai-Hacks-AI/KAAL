# C108 baseline

The baseline is the collector `kaal/release/act-real-green` at 1168212, with no commit of its own. It is 6 commits behind `main`.

- Nothing judges whether the Changes that a promotion carries are reflected by a retro, the ACT. The checks of the `30 - promoting` station read the content of the promotion; the Dispatcher raises a PROMOTION when the ACT of a collector has merged and does not look inside.
- The judge of release/C103 (`hold Act`, `05-src/phase/judge-act.mjs`: `actOf`, `applicableCases`, `judgeAct`) is a draft in that Change's PLAN (#2125), not in this tree. This Change's DO follows that DO; the Cases that call the judge are RED here for the absence of both.
- Highest ids, read on 20 Nov 2026 against the 68 open pull request heads and `main`: C107, I57, F83, A73, CTL28, T1293 (release/C107), I56, F80, A71, CTL24 and T1267 (release/C103). The ids below follow them.
- Runner on this baseline: 300 tests, 284 pass, 16 fail (the same 16 fail on `main`).
