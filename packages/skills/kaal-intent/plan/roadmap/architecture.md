# Intent product plan: Architecture

- **intent/A5. Order follows dependency, not importance.** `intent/C5` has no upstream dependency, so it can be reviewed while Requirements and Core move. `intent/C6` and `intent/C7` are DOs that depend on other owners' accepted contracts and are never started ahead of them.
- **intent/A6. Same route as every collector.** Each change is a working-branch PR into `kaal/intent`, landing by squash, claiming one Change Record. Promotion to main and any SYNC follow the Owner's SYNC policy and the critical path Hosting → Foundation → Core; Intent asks for neither here.
