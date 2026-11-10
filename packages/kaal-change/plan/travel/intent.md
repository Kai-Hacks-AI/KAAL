# A Set of Paths Travels Alone: Intent

This is `change/C10`, a PLAN Change. It ships no code. A later DO Change turns the planned tests GREEN.

CI's ownership assessment (`release/ci-ownership-map.md`, D2) found one rule, "a Change that touches this set of paths touches nothing else", written out by hand several times in KAAL. The Owner and the CPO decided it belongs in Change as one reusable capability, parameterized by path sets. Guard executes it, KAAL supplies its own path sets as data, and nothing existing retires until equivalent coverage is proved.

The copies today:
- `engineering/change-isolation/check.mjs`, run by `engineering/github/change-isolation.sh`: Core and `.github` travel alone, with a transition ledger.
- the inline shell in `.github/workflows/guard-acceptance-boundary.yml`: the Guard acceptance boundary travels alone, for `kaal/guard` only.
- Release Management's `isolate Change` control (`.github` alone).

`kaal-change`'s `/isolation` is a different judgment and is not a copy: it reasons from altered elements and Graph impact to a model-scoped `isolated`, `violated` or `unknown`, and reads no paths (change/N10). This PLAN adds the path rule beside it and does not touch it.

- **change/I26.** A path-set rule is stated once. A Change that touches a declared path set touches only that set and the companions the declaration allows. The rule, its declaration form and its verdict belong to Change. The path sets belong to the repository that embeds Change.
- **change/I27.** Executing the rule is separate from owning it. Guard runs the check and carries the verdict. The repository declares its sets as data, so a repository gains the rule by declaring a set, and no copy of the logic exists in a workflow or a script.
- **change/I28.** Nothing is retired because it was written. A hand-written copy retires only when the one rule reproduces its judgments, shown by Cases that run against both, and the retirement is its own authorized Change.
- **change/I29.** An exception to a rule is the authorization of change/I24, not a second mechanism. Whatever admits a spanning Change does so as an Accept-like entry authorized by an accepted PLAN, and the rule itself carries no ledger.
