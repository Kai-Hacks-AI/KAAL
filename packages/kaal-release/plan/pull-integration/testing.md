# Pull Promotion v1 command: Testing (target)

Two runnable RED Cases, `T14.red.mjs` and `T18.red.mjs`, kept out of the default CI run so CI stays green. Both fail because the command does not exist. T14 needs a runner with Node and one supported credential (pull/F15): `KAAL_LIVE=<owner/repo> node -e "import('./T14.red.mjs').then(m => m.run())"`. The capability's Cases (T19 to T23) belong to `pull/C3` and are listed in [v1.md](v1.md).

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T14 | F14, F15 | The command on the real repository prints a result for every declared collector (qualifies, does not qualify naming what is missing, or not judged naming the missing fact) and the qualifiers in the declared order; with no usable credential, or for an unreadable host, it fails naming what is missing; the gatherer's source holds no request that is not a GET. |
| pull/T18 | F20 | The command exists and imports nothing of Show WIP; no workflow, hook or scheduled-job file in the repository names `pull-promotion`. |

It states what it does not prove: that the host was not mutated by anything else, an adversarial gatherer, and the later refinements deferred in [v1.md](v1.md) section 4.
