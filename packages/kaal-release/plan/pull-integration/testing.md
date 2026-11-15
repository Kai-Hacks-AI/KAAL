# Pull Promotion v1 command: Testing (target)

Two runnable Cases, `T14` and `T18`, in `test/pull/` since the DO (they were `.red.mjs` beside this document in the PLAN). `T14` always checks the credential failure, the read-only source and the recorded live run (`engineering/release-management/05-src/pull-promotion/evidence/`), and with `KAAL_LIVE=<owner/repo>` it runs the command on the real host again. The capability's Cases (T19 to T25) belong to `pull/C3`.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T14 | F14, F15 | The command on the real repository prints a result for every declared collector (qualifies, does not qualify naming what is missing, or not judged naming the missing fact) and the qualifiers in the declared order; with no usable credential, or for an unreadable host, it fails naming what is missing; the gatherer's source holds no request that is not a GET. |
| pull/T18 | F20 | The command exists and imports nothing of Show WIP; no workflow, hook or scheduled-job file in the repository names `pull-promotion`. |

## Revision (13 Nov 2026): the command as built on file state

The requirement pull/F14 above was rewritten to describe the gatherer of the file-state capability (`pull/C4`), which shipped with its DO (#1527). **No new behaviour and no new RED Case:** T14 and T18 already exist and are green, and they cover the revised F14: the credential failure, the GET-only source, the recorded real-host runs, the gatherer's pure readings (`deltaOf`, `historyOf`, `executionsOf`, on a recorded CI log) and the gatherer and the capability run together on a host-shaped fixture. This revision only makes the PLAN say what was built.

It states what it does not prove: that the host was not mutated by anything else, an adversarial gatherer, and the later refinements deferred in [v1.md](v1.md) section 4.
