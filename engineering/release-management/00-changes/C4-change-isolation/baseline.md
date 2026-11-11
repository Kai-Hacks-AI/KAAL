# C4 baseline

The baseline is `main` at `8720c401fd6aa3ea8f78f1d2f1f3e5d8d7c2a6af`. Work that is not on `main` is not delivered functionality, and this Change depends on nothing that is not on `main`.

- `main` holds Change Isolation as machinery: the judge `engineering/change-isolation/check.mjs` with its ledger, two Guard declarations that name it, a hook, six workflows and the rulesets that require its checks (`inventory.md`).
- `main` holds no Intent, Requirements, Architecture or Cases for it in `engineering/release-management/`. `engineering/controls/README.md` describes it as a planned Control and says that nothing below it exists yet.
- The judge exports no verdict function and prints no record. Its command line ends with an exit status of 0, 1 or 2 and human text.
- The declarations of `main` place Change Isolation at Integration IN and Promotion IN (`runs: [ci]`) and, inside the check `push`, at Development OUT together with two other judgments.
- The local hook and the pull request check do not judge a Change the same way: the hook never reads the ledger (`inventory.md`, H1).
