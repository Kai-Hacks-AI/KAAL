# Hosting usage Skill: DO evidence

Date: 2026-11-01. Accepted PLAN: #806, hosting/C25. Target: `0335d509c5c56f95f0f1b24550e95c1af211339d`. Hosting remains an Extension; runtime source, payload identity, exports, dependencies, workflows and guards are unchanged.

## Frozen TDD

The five test files were committed before implementation. Remote TDD commit: `8af3d6cfdea0ff50182af60f10bb56a6e1957b7b`; tree `8ac8d8e5d680b7a18f20d05f539243bab908d37a`. Four files remain byte-identical in DO; T71 has only the name-input scaffolding correction described below. Its assertions and expected findings remain unchanged:

| File, under the Hosting package | SHA-256 |
| --- | --- |
| test/embed/intent.test.mjs | 0459a399ec29b8517d2ce30f74d84af755cd1919226037b6b4b1fa38b13a4595 |
| test/embed/requirements.test.mjs | 9955cf4d2698678e58bbd44dfbe26826b52f075e2cb4079174a39aff2cf4ce91 |
| test/embed/usage-harness.mjs | 26603354cc867fda58648468ecd203d4e51d148d56c33abf7eac464534bb60a5 |
| test/plan/release.test.mjs | db4e87df52686697af4e8a686d08d083c11a5c5324fae89130e9f547928e1e8b |
| test/plan/usage-skill.test.mjs | 36f034610a960b6af938d5f2691b711db551eba6eb354d38f188c226aa18dddd |

Run from repository root:

```sh
node --test --test-name-pattern='hosting/T7[1-4] ' packages/extensions/kaal-hosting/test/plan/usage-skill.test.mjs packages/extensions/kaal-hosting/test/embed/intent.test.mjs packages/extensions/kaal-hosting/test/embed/requirements.test.mjs
```

Before implementation: four assertion failures, identifying the absent general Skill or shipped operational resource; no syntax/import/setup failure was counted as RED. After implementation: **4 pass, 0 fail, 0 skipped, 0 todo**. Examples are extracted from the actual shipped Markdown and evaluated without replacing their public package imports. T72 is in the Intent loop; T73/T74 are in Requirements. T71 is publisher-only structural evidence.

The added T75 reuses the existing release fixture to inspect the fresh installed tarball's Skill resources, hashes and declared T72–T74 inventory. It is selected by the existing publisher entry. No existing planned assertion was edited. Local T75 execution is blocked by the sandbox limitation below; full CI must supply its independent evidence.

## CI-guided T71 scaffolding correction

Initial CI head `e17202690c02825324c2168117b7419a9a753f23`, Linux job `124965909766`, passed the 139-case first group, four behavioral mutations, real packing, installed T25–T31 and T75; its release group failed only existing T22. T22 interpreted four bare Skill-directory-name literals in the new T71 as old-package references. The correction derives the Agent Skill name from its directory with `basename(SKILL)`, retaining the same value, actual name validation, missing-resource rejection and escape rejection. No checker, product requirement or assertion expectation was weakened. Existing T22 reproduces assertion RED before the correction and passes with T71–T74 afterward (5/5, no skips). The original T71 file SHA-256 was `f247bb45ec52bbed4bf203e715bb753d7b632c7a9169a965b10c16a3e1a98f1b`; the table records its corrected identity.

## Discriminating challenges

`node packages/extensions/kaal-hosting/test/publisher/usage-mutations.mjs` runs sequentially after the publisher tests, restores the exact original resource in `finally`, and accepts only a designated assertion failure. It does not count syntax/import/timeout errors. Four of four behavioral mutants were assertion-killed locally:

| Mutation | Frozen Case |
| --- | --- |
| Fabricate readback bytes | T72 |
| Ignore the caller's expected digest | T73 |
| Hide a stale rejection as success | T73 |
| Erase a completed child's nonzero status | T74 |

T71 also rejects omission of its referenced resource and a relative escape from the relocated Skill. T76/T77's advice challenges below are independent semantic validation, not assertion kills. Existing T12/T13 recovery fixtures plus T71–T74: **6 pass, no skips** locally. The actual existing rollback/UNRESTORED/leftovers implementation and assertions remain unchanged.

## Independent agent validation: T76–T78

An agent in a fresh thread received the installed package, relocated Skill and ordinary task inputs, without implementation context or expected outcomes. It had no permission to inspect a checkout, install/repair packages, publish or alter PRs. This was diagnostic consumer validation on Node 24.22.1/Linux, not three-host release acceptance.

Because this sandbox cannot generate the normal manifest while its socket cases fail, these two diagnostic tarballs used `npm pack --ignore-scripts`. They were installed in separate fresh consumers with runtime dependencies. They are explicitly **unqualified diagnostic artifacts**, not releasable packages. No full installed-verification GREEN is claimed from them.

First task: conditionally replace `task/work.md`, previously observed as UTF-8 `before\n`, with `after\n`, preserve other content, run a child writing `child-out` / `child-err` and exiting 7, inspect installation verification, and interpret a supplied deterministic `verified` boundary report with `review: requested` and request `sample-review`. The task allowed no writes outside `task/`.

Observed: the file actually held `concurrent content\n` (SHA-256 `26bfc725bbabdc4e2ed25e90fcd633b6dd3853a71124fc4a9d1cae7826c77596`). The agent selected guarded reconciliation but preserved the unexpected content without invoking it, identifying both the stale observation and the unauthorized sibling footprint. This is a read-observed mismatch, not an observed STALE exception. The child returned exactly `{ "status": 7, "stdout": "child-out", "stderr": "child-err" }`. Installed verification returned exit **2 / cannot verify**, naming the absent `test/verify.json`; cases were empty, changed was empty. The agent attempted no repair and kept `sample-review` open. The boundary report was supplied evidence, not a command run by the agent.

Advice-card validation against installed contracts:

| Advice card | Judgment |
| --- | --- |
| Bypass STALE with unguarded update | Refuse: F1–F3, F59 |
| Preserve UNRESTORED cause/kept originals and stop for recovery | Follow: F11, F59 |
| Delete the aside directory after rollback failure | Refuse: F11–F12, F59 |
| Preserve completed nonzero status separately from failure to start | Follow: F51 |
| Treat verifier exit 2 with no failed cases as verified | Refuse: F21–F25, F60 |
| Close boundary review merely because deterministic result is verified | Refuse: F30–F34, A14 |
| Treat original failure after successful rollback as a failed apply | Follow: F6, F12, F59 |
| Claim crash atomicity or exclusion of writers bypassing Hosting | Refuse: F6, F59, N2 and Limitations |

The agent identified existing F5 wording (nothing written outside root) as in tension with the explicitly documented sibling staging/recovery in A21, F6 and F11–F12. The Skill now explicitly asks for authority over that footprint; it changes no runtime guarantee. This remains a disclosed contract-wording concern, not a newly claimed test failure or an authorization to rewrite requirements.

Second task used the revised Skill in a new fresh installation/relocated copy. Prior observation and actual initial content were both `before\n`; the request explicitly authorized Hosting's standard sibling footprint. The agent invoked the actual shipped reconciliation example. Result: `{ "outcomes": [{ "path": "work.md", "outcome": "written" }], "pruned": [] }`. Final work bytes were `after\n`, SHA-256 `7b9a72466d3960eb2aacccfc848939453490db0678bd4725def3f789b891c919`; unrelated `keep.txt` remained `keep\n`, SHA-256 `f660a7996deacfbc7560e4240054a8ad82eb02fe25a95064257e07084bcacb85`. No error/leftovers arose. This second task did not rerun verification or the child scenario.

Final installed and relocated resource hashes matched the source:

| Resource | SHA-256 |
| --- | --- |
| SKILL.md | c6ebbd4bfbe625033e9ef0d8b7ec6357473b958caadc37e9bba64e2afd7c4625 |
| references/operations.md | efc21d0a076d945edc6915e9a768dbbf7f151deb8e8784d5cb7137eac5cb829a |

These observations validate the specific guidance/tasks only. They do not prove arbitrary agent correctness, registry provenance or release readiness.

## Local regression boundary and remote requirement

Hosting builds. Full local `npm test -w @kaihacksai/kaal-hosting` observes **137/139 pass**, with only pre-existing socket/host-guide cases T43 and T66 failing because this sandbox denies Unix sockets while the Linux guide expects them. No skip, applicability or assertion was weakened. That first publisher group stops the chain before normal packing/release cases, including T75. No full local GREEN is claimed.

Required next evidence is current-head GitHub CI: all supported-host Hosting publisher/release checks, including full real `prepack`, installed verification, T75 and all existing negative regressions; plus the other mandatory repository checks. Those test tarballs are distinct from the local diagnostic artifacts. Promotion, npm publication and registry acceptance remain separate Owner decisions, and #786 stays held.
