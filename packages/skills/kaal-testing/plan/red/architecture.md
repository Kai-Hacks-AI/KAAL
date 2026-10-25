# RED Evidence and Accepted Regressions: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A1** [testing/F1–testing/F6, testing/N1, testing/N2]: `kaal-testing/red` (`lib/red.mjs`, plain ESM) exports `outcomes`, `checkAccepted`, `classify`, `report` and `verdict`. It imports nothing, so it stays inside Testing's declared boundary, which permits only `node:path` and `node:url`.
  - `outcomes(events)` returns a run with these methods:
    - `outcome(id)`, which gives `"pass"` or `"fail"`;
    - `marker(id)`, which gives `"skip"`, `"todo"` or nothing;
    - `identities()`;
    - `unidentified()`, the titles of tests without an identity;
    - `findings()`. A duplicate identity is a finding keyed by that identity.
  - `classify({ results, base, accepted, branch, today })` returns these members:
    - `reds`: one `{ test, class, marker?, accepted? }` per RED;
    - `expired` and `stale`: the acceptances that applied to nothing;
    - `findings`: the acceptance record's findings;
    - `counts`: REDs by class, plus `accepted` and `green`.
  - `report` returns text.
  - `verdict` returns `{ pass, blocking }`, with `blocking` sorted. Testing does not run lanes and does not read GitHub, the repository or the clock: whoever runs a lane hands it the events, the base outcomes, the acceptance record, the branch and the date.
- **testing/A2** [testing/F3, testing/F4]: The acceptance record lives on the collector it governs, at `.kaal/config/testing/accepted.json`. It changes only through a Change that the Owner approves, and its `authority` is that approval. Testing reads it as data. It does not decide who may write it, and it does not check that the authority link resolves, which is Engineering's to enforce. A record that does not conform (`testing/F3`) accepts nothing, and its findings are reported.
- **testing/A3** [testing/F2]: Feature REDs are classified from evidence, not declared. A Feature RED is a Test Case the base has never run, and its identity traces it to the Capability and the PLAN that planned it. A failing test the base never ran is a Feature RED whether it was planned or added by mistake. Either way it blocks promotion (`testing/F6`), so it cannot reach `main` unnoticed.

  | Option | Feature REDs | Cost |
  | --- | --- | --- |
  | **A (proposed)**: classify from evidence | derived by comparing with the base | nothing to keep in step; a mistaken new failing test is allowed on the collector but blocks promotion |
  | B: register every RED | each Feature RED declared in a register, keyed by identity, as Engineering proposed on #381 | one entry per planned test, kept in step with every PLAN and every DO; an undeclared failure blocks development too |

  Only accepted regressions need a declaration under A, because only they need an authority. The Owner decides between A and B in review.
- **testing/A4** [testing/F6]: The consumers, each in its own Change:
  - **Engineering** (`engineering/C…`, after this PLAN): the development and promotion gates. A lane runs its required suites normally, with no `todo` or `skip` added to hide a RED, and passes their events to `outcomes`. It obtains the base's outcomes for the same suites. It reads the collector's acceptance record, then calls `classify` and `verdict` for its gate. The check's exit status is the verdict, and `report` is its summary. Engineering decides which suites a lane requires and how the base's outcomes are obtained.
  - **Guard** executes that check and reports its exit status. It keeps no acceptance policy of its own (`testing/I3`).
  - **guard/C13** lands on `kaal/guard` with its planned assertions unchanged and its REDs real, once the development gate exists.

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C4` PLAN, this Change | Testing | |
| `testing/C5` DO: `kaal-testing/red`, testing/T1–testing/T8 GREEN in Testing's `npm test` | Testing | `testing/C4` |
| `engineering/C…`: the development and promotion gates consume `kaal-testing/red` | Engineering | `testing/C5` |
| `guard/C13` with real REDs | Guard | the development gate |

`testing/C3` (conformance findings as evidence) is planned separately and is independent of this graph.
