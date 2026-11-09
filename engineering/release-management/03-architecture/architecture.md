# Architecture

## The flow (system view)

```
 13-change-branch      12-kaal            11-main               10-npmjs
 (a Change on its   (KAAL installs     (promoted state)      (published version)
  working branch)    the package)
        |                  ^                  |                      ^
        |  squash into     |  KAAL installs   |  Release (by hand)   |
        |  collector,      |  its own         |  pack once, verify,  |
        |  promotion to    |  published       |  approve, publish    |
        |  main            |  package         |                      |
        +----------------> +<-----------------+--------------------->+
                                              ^                      |
                                              +---- Accept ----------+
                                                 (registry bytes vs tested bytes)
```

Pull-oriented: each station owns its **in** move. This PLAN designs only the right-hand border (`11-main` to `10-npmjs`) and the stock of `10-npmjs`.

## Elements

- **release-management/A1 [F1]. Version gate.** Today `readiness()` (`engineering/release/release.mjs`) inside Pack. Planned additions, each a separate DO with its own RED Case: greater-than-latest (G1), release tag (G2), version-set-by-Change (G3).
- **release-management/A2 [F2]. Approval gate.** `release.yml` Publish job, `environment: npm`; `publishable()`. Planned: the release record names the approving run (G5).
- **release-management/A3 [F3]. Promotion check.** `provenance()` and Accept. Planned: the record carries the promotion it came from (G9).

Nothing above changes `.github` in this PLAN; `.github` changes travel alone as their own Change.
