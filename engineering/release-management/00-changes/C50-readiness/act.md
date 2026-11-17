# C50 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The Owner's questions settled the Change before any code grew around it: "Readiness" was not a good name, and a check is a pure detection. So the control is `release/CTL3` verify Package, type detective, with Intent `release/I28` "publishing intact", and making it preventive is a second control that wires it in. The judge is a pure function, `judgePackage({manifest, directory, registry}, declaration)`, that returns verified, failed or unknown with findings, and it never asks the registry unless told to. T610 to T615 went from RED to green on their own assertions.

## Learned

SemVer needed the official grammar, not a lookalike: T615 checks valid and invalid versions for both the package version and the exact dependency rule, and build metadata is refused. The declaration, `verify-package.json`, holds only the scope `@kaihacksai/` and the repository URL, so the judge stays free of settings. The Change id, name and collector keep "readiness", since renaming them would have moved the history for no gain.

## Lacked

Nothing runs the judge on a real package in CI yet. The control is declared and tested against fixtures, so its claim stops at what T610 to T615 observe. The other six controls of `engineering/release` (source tests, pack once, installed verification, publish gate, first-publication steps, registry acceptance) are still undeclared.

## Longed For

One promotion that carries C50, then the next migration, source tests, as its own Change, until `engineering/release` can retire without reducing protection.

## Follow-ups

- Promote C50 in the CPO's order, after the template collectors.
- Migrate source tests next, then pack once, installed verification, the publish gate and registry acceptance, each as its own Change.
- A preventive control that wires verify Package into Publishing is a separate decision for the Owner; release/CTL4 is not started.
