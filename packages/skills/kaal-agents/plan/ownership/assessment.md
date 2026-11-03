# Agents: ownership assessment and the way to #643 (agents/C8 PLAN)

This PLAN ships no code and no test. It records what the Agents capability holds, who owns it, what stands between it and npm and main, and the order in which the open work should go. It authorizes no DO, sync, promotion or publication.

## 1. Ownership

Agents (`kaal-agents`) now has an owning thread. It owns the Discover and Escalate responsibilities of the Agent lifecycle, as the Agents Capability Node states: an Agent's readiness and operation within KAAL. It keeps the package, its collector `kaal/agents`, and Change numbering `agents/Cn`.

Boundaries stay as chartered in #278:
- Core owns what an Agent is and the registration, admission and catalog of Agents. Agents uses `catalog` and does not redefine it.
- Controls owns HAPTIC, the counterpart of PREACH. Agents cites it and does not restate it.
- Guard, Core and Packaging "cannot judge" outputs link to PREACH through their own owners (C1 of #886), never through an edit by Agents.
- Intent, Change, Communication and the Engineer Skill start where Agents ends.
- `kaal/agents-pointer*` branches are unrelated to this capability. They carry the root `AGENTS.md` pointer and share no lineage with main.

## 2. What exists

| Item | State |
| --- | --- |
| Capability Node `Agents`, claim, README | Merged to `kaal/agents` (#278) |
| NEW Definition | Merged to `kaal/agents` (#563) |
| PREACH Definition | Merged to `kaal/agents` (#613) |
| 0.0.1 consumer contract (agents/C4 PLAN, 18 planned tests) | Merged to `kaal/agents` (#623) |
| `orient`, `preach check`, `kaal-agents` Skill (agents/C5) | Merged to `kaal/agents` (#634) |
| Product docs, consumer cases, consumer verification (agents/C6) | **#643 open**, base `kaal/agents` |
| Release acceptance (agents/C7), `npm test` as the consumer entry | Planned, not started. agents/T15 is RED by design |

The collector is 5 commits ahead of main and 47 behind. Nothing of Agents is on main or npm.

## 3. #643: assessment

#643 is not orphaned in substance. It was the right next Change and its evidence is strong. It only lacked an owner to receive the re-review.

- **Review state.** Review 1 (changes requested, 30 Oct) asked for a truthful consumer promise. That was answered in c2a8fcc. Review 2 (comment, 30 Oct) asked for reconciliation with Packaging/C4 (#658) and Testing #639 and for installed evidence. That was answered in dd66af8, with the packed artifact installed offline and run under Node's permission model. **No review has been recorded since**, so the next step is the reviewer's, not a code change.
- **Open point for the reviewer.** dd66af8 amends the approved agents/T13 expectation (a changed, missing or added shipped file is *cannot verify*, not *failed*) to follow testing/F43, F48 and F50. If the reviewer rules against F50, one line reverts. This is the only item that needs a ruling.
- **Merge gate.** #643 merges to `kaal/agents` only. It carries no promotion and no publication, so it does not compete with the main-promotion order (#882, #328, #560).
- **Recommendation.** Leave #643 as it is. Do not rebase or sync it. Subscribe to its review events and answer them. Nothing in this PLAN changes its scope.

## 4. What stands between Agents and npm or main

| # | Blocker | Owner | Notes |
| --- | --- | --- | --- |
| B1 | Re-review and merge of #643 | Reviewer | See section 3 |
| B2 | agents/C7: `test` / `test:publisher` convention (#625) and clean packed-install acceptance (T15) | Agents, after Engineering's convention is on the `kaal/agents` base | Needs a SYNC, which the policy allows only when blocked or next in line |
| B3 | Scoped names. `devDependencies` and `pretest` name `kaal-core`, `kaal-graph`, `kaal-hosting`, `kaal-testing`; all move under Hosting's scoped rename | Hosting, then Agents | Agents must follow Hosting, not lead it |
| B4 | Core rename (C29), after which `lib/catalog.mjs` drops the unscoped `kaal-core` | Core, then Agents in a small Change | Needs approval to update the agents/T3 and T4 fixtures |
| B5 | The published name of Agents | Owner | Left open in #623, together with Core's #622 |
| B6 | Promotion to main and the first publish | Kai | Not requested here |

Agents is not on the Hosting, Foundation, Core critical path and must not slow it. Nothing below runs ahead of B3 and B4.

## 5. Proposed sequence

1. Now: land #643 through review. Agents does no other implementation.
2. After Hosting's scoped rename reaches main and Agents becomes next in line or blocked, ask Kai to authorize one SYNC `main` into `kaal/agents`. The SYNC may differ from main only at conflicts.
3. Then agents/C7 as its own DO PLAN: T15, the engineering convention and clean-install acceptance. Its PLAN comes first.
4. In a small Change, drop the unscoped `kaal-core` name once Core's rename lands.
5. Ask Kai to promote `kaal/agents` to main as one focused collector, and to decide the published name and the first publish.

## 6. Cross-capability asks, to be raised by their owners

- **Core, Guard, Packaging:** cite PREACH in "cannot judge" outputs. Agents offers the Definition and the `preach check` structure. Each owner decides its own wording.
- **Core:** `orient` depends on Core's `catalog` export and nothing else. Core's navigation work (#827) must keep that export stable.
- **Engineering:** the portfolio acceptance lane should include a clean install of `kaal-agents` once it is publishable.
- **Intent, Requirements, Architecture:** no ask yet. Agents' product documents follow the `docs/` contract that Packaging/C4 defines.

## 7. Not decided here

The published name, the sync, the promotion and the publication are Kai's decisions. This PLAN proposes the order and nothing more.
