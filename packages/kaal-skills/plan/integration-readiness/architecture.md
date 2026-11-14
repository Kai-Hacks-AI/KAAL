# kaal-skills: integration readiness (Architecture)

Architecture keeps two concerns apart, as the Architecture Skill states them: Solution is what the contract is and must do, Delivery is how it is realized and made available.

## Solution

- **skills/A1: the contract.** A small set of Requirements (F1 to F7, N1, N2) and Cases (T260 to T267) that any capability can satisfy on its own. A capability depends on none of it.
- **skills/A2: the declaration.** One file per capability, owned by that capability, beside its ownership claim. It is data: owner, mechanisms, and what a caller needs to read a result. It follows the pattern Testing already owns for `ownership.kaal.json` and `evidence.kaal.json` (the owner keeps the file; one format is read the same way for every owner), without Testing's help.
- **skills/A3: the verdict.** For each Requirement a declaration gets PASS, FAIL or UNKNOWN, with a reason per mechanism. UNKNOWN never counts as PASS. The vocabulary is the CPO's, and no capability's own words are replaced.
- **skills/A4: activation.** For a judgment capability the declaration also carries a situation and a reminder, as data. An integrator (Engineering, later) reads it and decides whether, where and how to surface it, for example in an agent's instructions or a hook's output. The reminder is the capability's words, so the integrator never has to restate the capability's rule to cause the agent to consider it. A script mechanism needs no reminder: calling it is its activation.
- **Relations.** The declaration states what a caller may invoke; the *Installation Contract* (Core) states what an installer copies into a repository, and its `surface` assets are installed only by the capability's own lifecycle. They do not merge: a capability can be integration-ready and ship no installable asset. Guard owns the executing check (`command`, `runs`); a declared `script` mechanism is what such a check would call, and Engineering writes that check later. BASS gives the levels; Testing's own rule (verification is proof, validation is judgment, neither stands in for the other) is why `skill` mechanisms may not claim an outcome.

## Delivery

- **Where.** `packages/kaal-skills/`, with no `package.json` entry other than a private name and a test script (N1). Its README states the contract; `format.md` states the declaration format; the Cases and a test-only evaluator live under `test/`.
- **The evaluator.** `test/lib/conforms.mjs` exports `conforms({ declaration, root, fixtures })`, `verdict(result)` and `discover(root)`. It is read only by the Cases and is not exported from the package. `discover` finds `packages/*/integration.kaal.json` by convention, with no registry; a package without one is returned with status UNKNOWN. This is the "one place, run against the target" pattern: capabilities' own suites never re-implement the Cases.
- **Fixtures.** A capability's fixtures are its own executable module (its inputs can be binary or large, so not JSON). In this PLAN they are Testing's draft, under `evidence/`.
- **Interfaces.** Incoming: each capability's declaration and the package files it points to. Outgoing: none. `kaal-skills` imports no capability; its Cases run each declared mechanism in a child process.
- **Owner of what.** Capability: its declaration, mechanisms and fixtures. `kaal-skills`: the contract and the Cases. Engineering and the Controls Change: every hook, workflow and ruleset, and every decision about an existing control.
