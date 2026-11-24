# C33 gap

| Gap | Target artefact | Baseline | Gap |
| --- | --- | --- | --- |
| engineering/G123 | F94 | The two gate jobs of C32 check out the merge result and run the judge and `judge-mode` from it | A pull request that edits the judge runs its own version, so the gate can be made to pass; the CPO requires this closed before the checks are required |
