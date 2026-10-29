# Guard: Testing

This is Guard's Product Verification Test Plan: the one that ships, and that your installation runs. Every promise in [Intent](intent.md), [Requirements](requirements.md) and [Architecture](architecture.md) is checked by a delivered Test Case, allocated to the publisher's Engineering Test Plan, or named below as verified by no Test Case. Each case names, in its title, the identifiers it checks, for example `guard/T61 [guard/F1, guard/A1]`. The identifiers are the trace: there is no separate traceability framework.

## The loops

| Loop | Checks | Where | Runs in your installation |
| --- | --- | --- | --- |
| Intent | the outcomes hold for a user of Guard | `test/acceptance/intent.test.mjs` | yes |
| Requirements | each obligation holds | `test/acceptance/requirements.test.mjs` | yes |
| Architecture | each element keeps its placement, ownership, boundaries and dependencies | `test/acceptance/architecture.test.mjs` | yes |
| Code | the implementation behaves as designed | `test/unit/*.test.mjs` | yes |

The three outer loops are the acceptance boundary. A case there exercises the package as a consumer would: it packs or uses the installed copy, installs it into a fresh repository of its own in the operating system's temporary directory, and checks what a user observes. The Code loop tests the implementation from the inside.

Every case is a plain `node:test` file that needs only Node and Git.

## Running them

In your installation, one command runs the delivered cases against the installed copy and ends in `verified`, `failed` or `cannot verify` (guard/F31–guard/F36):

```sh
npm explore @kaihacksai/kaal-guard -- npm test
```

The package's README says what each result means and what `verified` does and does not tell you.

## Allocated to the publisher's Engineering Test Plan

Some promises cannot be checked by a run in your installation. They are obligations allocated to the publisher's Engineering Test Plan, which does not ship. Each one is named here, never silently (guard/F38). `npm test` lists each one as not verified by this run, allocated to the publisher. An allocation says what the publisher runs; it is not evidence that the run passed.

<!-- allocated: read by the publisher into the manifest -->
| Allocated | Identifiers | Allocated to |
| --- | --- | --- |
| The verification itself | guard/I8, guard/F31–guard/F36, guard/F38–guard/F40, guard/N13, guard/A18 | the publisher's Engineering Test Plan: its Test Cases of the verification itself run against a packed candidate in a fresh consumer on Linux, macOS and Windows, in the publisher's release evidence, because a delivered run cannot verify its own verifier |
| Moving between published versions | guard/F11, guard/F14–guard/F16 | the publisher's Engineering Test Plan: its release acceptance moves between two versions installed from the registry, in the publisher's release evidence, because that needs two published versions |
<!-- end of allocated -->

## Verified by no Test Case

A promise no Test Case verifies, in either plan, is named here and reported as unverified, never as allocated.

<!-- unverified: read by the publisher into the manifest -->
| Unverified | Identifiers | Why |
| --- | --- | --- |
| Guidance | guard/F20 | it is guidance for people and agents, in the Skill and the README, which Guard never parses; the publisher reviews it with each release, and no Test Case checks it |
<!-- end of unverified -->

## Not applicable

A case may declare the platforms where it does not apply (guard/F40). There it is not run, and `npm test` names it as not applicable; it does not count as skipped. A case skipped anywhere else is `cannot verify`. Platforms are named as Node names them: `linux`, `darwin`, `win32`.

<!-- applicability: read by the publisher into the manifest -->
| Case | Not applicable on | Why |
| --- | --- | --- |
| `test/unit/lifecycle.test.mjs > pre-push template > supplies no changed paths when Git cannot compute them, so a check that needs them cannot judge and blocks` | win32 | it starts the hook template with `sh` and a POSIX shim made executable by its file mode, which Windows does not give a Node process; on Windows, Git runs the shipped hook in guard/T9 and guard/T10 |
<!-- end of applicability -->

No identifier is declared not applicable on any platform.

## The trace

One row per delivered case: its identifier, its loop, the identifiers it checks, and what it checks.

<!-- trace: written by the publisher from the cases' titles -->
| Case | Loop | Checks | What it checks |
| --- | --- | --- | --- |
| guard/T1 | Intent | guard/I2, guard/I3 | one check gives the same verdict through the hook and through CI, for the same facts |
| guard/T2 | Intent | guard/I1 | removing Guard leaves the repository's own tests intact |
| guard/T4 | Intent | guard/I5 | the packed package alone installs, operates and removes cleanly, and no other KAAL element appears |
| guard/T6 | Requirements | guard/F1 | runs the hook checks for the hook and only the named check for CI |
| guard/T7 | Requirements | guard/F2 | names every exit status by its own verdict and never collapses one into another |
| guard/T8 | Requirements | guard/F3 | serves the hook and CI from the same runner and the same list |
| guard/T9 | Requirements | guard/F4, guard/A4 | blocks a push on fail or cannot judge, says that CI decides, and is skipped by --no-verify |
| guard/T10 | Requirements | guard/F4, guard/A4 | lets a push through when every hook check passes or is not applicable |
| guard/T11 | Requirements | guard/F5, guard/A5 | fails the job on fail and on cannot judge |
| guard/T12 | Requirements | guard/F5, guard/A5 | reports not applicable as not applicable, never as a pass |
| guard/T13 | Requirements | guard/F5, guard/A5 | reports held as a warning, never as a pass, with the check's own explanation visible |
| guard/T14 | Requirements | guard/F6, guard/A4 | the hook follows the declarations without being changed, and names no check |
| guard/T15 | Requirements | guard/F7 | runs the trusted checker as it stands on the base, never the candidate's version |
| guard/T16 | Requirements | guard/F8, guard/F29, guard/A6 | registers every file init writes in the installation record, with its SHA-256 and the version that wrote it |
| guard/T17 | Requirements | guard/F8, guard/A6 | never overwrites a pre-existing hook, workflow or core.hooksPath, and prints the line to add |
| guard/T18 | Requirements | guard/F8, guard/A6 | upgrade and remove touch only unmodified managed files, and remove unsets only the core.hooksPath it set |
| guard/T19 | Requirements | guard/F9 | gives a check only its facts, from the repository root, with no stdin, wherever it is started |
| guard/T20 | Requirements | guard/F9 | the hook prints the base commit it used |
| guard/T21 | Requirements | guard/F10 | a command that cannot start is cannot judge, and it blocks |
| guard/T22 | Requirements | guard/F10 | a declared fact that is not supplied is cannot judge |
| guard/T23 | Requirements | guard/F10 | a check that is not declared is cannot judge |
| guard/T24 | Requirements | guard/F10 | verify fails on a ci check that no workflow job names (static configuration coverage only) |
| guard/T25 | Requirements | guard/N2 | the same run twice prints the same verdicts |
| guard/T26 | Requirements | guard/N3 | no state beyond the repository, core.hooksPath and Guard's checkout state in Git's metadata |
| guard/T27 | Requirements | guard/N4 | every fail or cannot-judge verdict says what to do next |
| guard/T28 | Architecture | guard/A3, guard/A7 | the runner knows nothing of the adapters or GitHub |
| guard/T29 | Architecture | guard/A7 | nothing depends on an adapter |
| guard/T30 | Architecture | guard/A8, guard/N6 | the package declares and imports no KAAL element and references no Engineering path |
| guard/T31 | Architecture | guard/A8, guard/N6 | the acceptance boundary is closed: its files import only Node built-ins and files inside it |
| guard/T45 | Requirements | guard/F19, guard/A13, guard/N11 | the packed package carries skills/kaal-guard/SKILL.md, named kaal-guard, with BASS sections and no script, and names no consumer |
| guard/T47 | Requirements | guard/F21, guard/F22 | a failing and a cannot-judge local run keep their exit statuses, verdict lines and the check's own stdout and stderr byte for byte, and add exactly one reminder line naming an existing Skill path |
| guard/T48 | Requirements | guard/F21 | a run of only pass, not applicable or held adds no reminder |
| guard/T49 | Architecture | guard/F21, guard/A15 | with --github, fail and cannot-judge annotations and the step summary name the Skill path, and a passing run's summary does not |
| guard/T50 | Requirements | guard/F23, guard/F24, guard/N10, guard/A14 | standalone init in a fresh repository installs the Skill only at .agents/skills/kaal-guard/, byte-identical to its catalogued content and equal to the package's source |
| guard/T51 | Requirements | guard/F23, guard/F8, guard/A14 | init keeps a pre-existing .agents/skills/kaal-guard/SKILL.md, reports it, and installs no other Skill file |
| guard/T52 | Requirements | guard/F23, guard/F12, guard/A14 | upgrade moves unmodified Skill files forward and keeps a modified one; remove deletes only unmodified Skill files and the directories it emptied, and leaves other skills in .agents/skills/ untouched |
| guard/T53 | Requirements | guard/F23, guard/N10, guard/N12, guard/A14 | the standalone lifecycle writes no supplier-specific location, even where such directories exist, and its report names the canonical path |
| guard/T54 | Requirements | guard/F26 | init, upgrade and remove create, edit and remove no AGENTS.md, CLAUDE.md or other instruction file; init reports the canonical path and how an agent reaches it, and proposes no supplier-specific pointer |
| guard/T57 | Requirements | guard/F23, guard/F8 | a modified deployment is kept and reported while the others move forward, and remove leaves it |
| guard/T58 | Architecture | guard/F27, guard/A17 | contract.json and the lifecycle agree: every asset standalone init writes is in the contract, every one in the contract is written, and the contract names no supplier location beyond the canonical one |
| guard/T59 | Requirements | guard/N1, guard/F27 | the package declares Node >=24; on an older Node every command exits as cannot judge, naming Node 24 as the next step, and the README states the prerequisite |
| guard/T61 | Requirements | guard/F1, guard/A1, guard/A2 | a check declared as <name>.md in its configuration directory runs with the meaning of its frontmatter, and its body changes no verdict and no order |
| guard/T62 | Requirements | guard/F18, guard/F10, guard/N4 | an undefined member, a wrong type or frontmatter outside the subset, in a declaration or in Guard's state, is cannot judge, named, and nothing is written |
| guard/T63 | Requirements | guard/F28 | the hook and workflow pass --config; without it the top level's declarations are found from any directory; only .md files directly in it count; with none it is cannot judge naming init |
| guard/T69 | Requirements | guard/F29, guard/F8 | shared configuration: init in a linked worktree sets core.hooksPath in the shared scope with its state in the common directory, and remove in the main checkout unsets it |
| guard/T70 | Requirements | guard/F29, guard/F8, guard/F12 | in a fresh clone, upgrade and remove judge each asset by the tracked installation record alone, and leave a core.hooksPath Guard did not set there |
| guard/T71 | Requirements | guard/F29, guard/F8 | worktree configuration: init in a linked worktree sets core.hooksPath for that worktree only, with its state in the worktree's metadata |
| guard/T72 | Requirements | guard/F29, guard/F8, guard/F19 | every asset init and upgrade install is byte-identical to catalogued content and valid in its format |
| guard/T73 | Requirements | guard/F29, guard/F8 | a file with published bytes that the record does not register is not Guard's, and a changed or missing registered asset is reported, not re-registered |
| guard/T74 | Requirements | guard/F17, guard/F10, guard/F30, guard/N4 | without --hook or --ci, init activates neither integration, reports each ci check no job declares with the step to add and init --ci, and verify fails on it with the same step |
| guard/T75 | Requirements | guard/F17, guard/F8 | init --ci installs Guard's workflow only where no workflow of the consumer's declares a check or verify, and never changes one |
| guard/T76 | Requirements | guard/F30, guard/N4 | init prepares the configuration and the installation record, activates neither hook nor CI, names both activations, and run again writes nothing |
| guard/T77 | Requirements | guard/F30, guard/F4, guard/F17 | hook and CI are activated apart and registered apart; neither implies the other, and activating again changes nothing |
| guard/T78 | Requirements | guard/F30, guard/F18, guard/N4 | each activation is undone on its own, keeping every declaration and Test Case; local is refused, naming hook |
| guard/T81 | Requirements | guard/F7 | a trusted checker Git records as executable keeps that mode in its base copy, so a check that runs it directly passes on the base's verdict |
| guard/T82 | Requirements | guard/F21, guard/F23, guard/A15 | after a standalone init deploys the Skill, a failing and a cannot-judge local run's reminder names the deployed .agents/skills/kaal-guard/SKILL.md, not the package's copy, and with --github so do the annotations and the step summary |
| guard/T84 | Requirements | guard/F28, guard/F10 | a declaration that is a symbolic link, and a directory named <name>.md, in the configuration directory each make run --hook, run --ci and run --check cannot judge, naming the entry; neither is skipped |
| guard/T85 | Requirements | guard/F27, guard/F29, guard/F12 | in a clone with core.autocrlf=true, the hook, the workflow and the Skill Guard installed and committed keep the bytes Guard wrote: the hook runs under sh, and upgrade and remove treat each file as Guard's unmodified file |
| guard/T86 | Requirements | guard/F4, guard/F27 | where core.fileMode is false, init --hook reports git add --chmod=+x .githooks/pre-push, and after the consumer runs it a fresh clone with core.fileMode=true runs the hook on push |
| guard/T87 | Requirements | guard/F5, guard/N1 | the workflow init --ci installs pins actions/checkout and actions/setup-node by commit SHA, uses Node 24, and has no ${{ expression in any run: line |
| guard/T88 | Requirements | guard/F8, guard/F13 | after the registered hook is deleted, init --hook reinstalls it and reports it reinstalled, and a push runs it; after the registered Skill is deleted, upgrade reinstalls it |
| guard/T89 | Requirements | guard/F10, guard/F17, guard/N4 | with a directory, and with a dangling link, named .github/workflows/x.yml, verify and init --ci are cannot judge (exit 2), naming the entry, and print no stack trace |
| guard/T90 | Requirements | guard/F8 | remove --config <dir>, for an empty directory inside and outside the repository, leaves that directory in place; plain remove after a bare init deletes the empty default .kaal/config/guard/ |
| guard/T92 | Requirements | guard/N1 | with a git that reports version 2.25, every command is cannot judge (exit 2), names Git 2.26, and changes nothing |
| guard/T94 | Requirements | guard/F7, guard/N4 | a candidate that drops trusted from a trusted check's declaration is cannot judge, names the check, says to land the declaration change on its own, and its checker never runs |
| guard/T95 | Requirements | guard/F7, guard/N4 | a candidate that changes a trusted check's command, or adds an outcomes entry, is cannot judge, naming the check, and neither command runs |
| guard/T96 | Requirements | guard/F7, guard/N4 | a candidate that deletes a trusted check's declaration is cannot judge, naming the check, and the run does not pass |
| guard/T97 | Requirements | guard/F7 | a check the base does not declare, and a changed check the base declares without trusted, run as the candidate declares them; an unchanged trusted check runs its base checker |
| guard/T99 | Requirements | guard/F7, guard/F10, guard/N4 | a base that resolves to no commit here is cannot judge for every check, naming the base, and nothing runs |
| guard/T107 | Architecture | guard/I9, guard/F37, guard/A19 | the package carries docs/ with Intent, Requirements, Architecture, Testing and Limitations; every identifier a delivered case cites is defined there; and no document there cites an Engineering path or a Change as its authority |
| guard/T119 | Requirements | guard/N15, guard/F29 | every checkout in the installed workflow sets persist-credentials: false, and the installed workflow is catalogued beside every content published from 0.0.2 on |
| guard/T125 | Requirements | guard/F2, guard/F18 | an outcomes key 0 or 3, a status Guard reserves for its own verdicts, is refused as cannot judge, naming 4 to 255 |
<!-- end of trace -->
