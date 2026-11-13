# Pull Promotion v1 command: Testing (target)

Two runnable Cases, `T14` and `T18`, in `test/pull/` since the DO (they were `.red.mjs` beside this document in the PLAN). `T14` always checks the credential failure, the read-only source and the recorded live run (`engineering/release-management/05-src/pull-promotion/evidence/`), and with `KAAL_LIVE=<owner/repo>` it runs the command on the real host again. The capability's Cases (T19 to T25) belong to `pull/C3`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T14 | F14, F15 | The command on the real repository prints a result for every declared collector (qualifies, does not qualify naming what is missing, or not judged naming the missing fact) and the qualifiers in the declared order; with no usable credential, or for an unreadable host, it fails naming what is missing; the gatherer's source holds no request that is not a GET. |
| pull/T18 | F20 | The command exists and imports nothing of Show WIP; no workflow, hook or scheduled-job file in the repository names `pull-promotion`. |

It states what it does not prove: that the host was not mutated by anything else, an adversarial gatherer, and the later refinements deferred in [v1.md](v1.md) section 4.
