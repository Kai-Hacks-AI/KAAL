# Change Isolation by reverse traceability

> PLAN (engineering/C11): nothing below exists yet. This follows the Owner's direction on #683 (comment 6542689212). **Isolation is computed by reverse traceability, not by a file allowlist.** Both earlier designs are withdrawn: the exact-path `MIGRATIONS` entry (48c70c7) and the declared rename transformation. `check.mjs` and its tests are as the target holds them.

## The invariant

A Change isolates when **every path it touches lies in a location it selected, and everything it selected lies within the impact computed from what it changes.** Two concerns stay distinct:
- **Impact is analysis.** Reverse reachability from the changed elements shows what *may* be affected. It authorizes nothing.
- **Selection is authorization.** The Change's own declared scope says what it *will* change. It is stated before the work and approved with the Change's PLAN.

The current rules stay the defaults:
- **Core travels alone** for every Change that declares no scope.
- **`.github` travels alone** always, with no exception.

## How it is computed

1. **What is being changed.** A Change states the elements it changes: an Intent, a functional or nonfunctional Requirement, or an Architecture element, each by its owner's identity, such as `hosting/F31`. It also states its **selected scope**: the capabilities it will change. Both are outgoing statements in the Change Node, beside `delivers` and `requires`. Their shape is the Change capability's to define (prerequisite P1). Engineering reads them and defines neither.
2. **Reverse traces.** From each changed element, Engineering follows incoming traces through Graph's `traverse(id, { direction: "in" })`:
   - Requirements and Architecture that cite it;
   - the Test Cases that test those;
   - the realizations that depend on it;
   - and so on, transitively.

   Each trace is its owner's relationship, with its owner's meaning (prerequisite P2). Graph supplies only the traversal. Engineering adds no relationship and no meaning.
3. **Impact.** The capabilities owning any reached element are the computed impact.
4. **Structured locations.** Each capability's isolation unit is the folder its ownership claim attributes to it. The claims exist today for Core, Graph and Testing (`ownership.kaal.json`), and #609 moves them to Markdown (prerequisite P3).
5. **The judgment.** It is `check.mjs`, read from the target as today. A Change that touches Core, or more than one capability's location, is judged against what its Change Node on the target states, never what the candidate states:

| Finding | Verdict |
| --- | --- |
| A touched path outside every selected capability's location | fails: outside the selected scope, naming the path |
| A selected capability outside the computed impact | fails: selected without a trace, naming the capability |
| A touched path that no ownership claim attributes | traceability finding, unresolved, naming the path. Never admitted, and never answered with a filename exception |
| A changed element that is not found, or a trace that does not resolve | traceability finding, unresolved, naming the element or trace |
| A touched `.github` path beside anything else | fails, as today |
| No Change Node on the target for the candidate, or one stating no scope | "Core travels alone" applies, as today |

A Change selecting several capabilities is then judged at their granularity. What a file's content says within a selected location stays Review's to judge (testing/F75). Engineering judges isolation, not content.

## Hosting/C11 as the example

#657 renames Hosting's package. Its changed element is Hosting's package identity, a Hosting Requirement whose identifier Hosting assigns. Reverse traces from it, read on `kaal/hosting` (bf98e7b):
- **Realizations that depend on it:** the package manifests that declare `kaal-hosting` as a dependency. They belong to Core, Engineer Skill, Graph and Testing. Engineering's drivers also import it, and the root scripts select it with `-w kaal-hosting`.
- **Their Test Cases,** which import it in turn.

**Computed impact:** Hosting, Core, Engineer Skill, Graph, Testing and Engineering. Foundation is not reached: it declares no dependency on Hosting.

**#657's selected scope** would be exactly those six. Its 62 paths at 38960b7 lie in their locations, or are the root files every workspace shares, such as `package.json` and `package-lock.json`. Who owns those is P3's to settle. So #657 isolates, and **no file of it is named anywhere.** A different importer set would compute a different impact, and nothing would be frozen.

**Traceability findings today.** Hosting, Engineer Skill, Foundation and Engineering have no ownership claim on `kaal/hosting`. Their paths would be reported unresolved until each owner declares one. That is a completeness gap to close, not a reason for an exception.

**Discriminating examples.**
- If #657 also touched Foundation, it would fail: Foundation is outside the impact.
- If it selected only Hosting and Core, every Graph path would fail: outside the selected scope.

## Requirements

- **engineering/F25. Impact by reverse traceability.** Engineering computes a Change's impact from its stated changed elements by following incoming traces transitively through Graph, and attributes each reached element to its owner. It keeps no list of relationships or locations of its own.
- **engineering/F26. Selection is the authority.** Only the scope a Change selects in its Change Node, as the target holds it, admits paths beyond one capability. A selected capability must be within the computed impact. A touched path must lie in a selected capability's location.
- **engineering/F27. Missing traces are findings.** An unattributed path, an unknown element and an unresolved trace are each reported unresolved, naming what is missing. None is admitted.
- **engineering/N13. Defaults unchanged.** Without a stated scope, "Core travels alone" applies. `.github` travels alone without exception. No pull request number, and no list of paths, is consulted as authority.
- **engineering/N14. Pure and read from the target.** The judgment reads only the target's Nodes and claims and the candidate's path list. Same input, same verdict. The candidate is never executed, as `change-isolation.sh` guarantees today.

## Test Cases

These go in `engineering/change-isolation/check.test.mjs`. Each case uses fixture Nodes, claims and a candidate path list. Each is first observed RED against the deliberately wrong implementation named, and a RED that shows only a missing export counts as blocked. The cases are paired as BRITTLE requires (testing/F73): a negative for each way the invariant can be violated, and a positive for each extension it authorizes.

| Test | Checks | BRITTLE | Deliberately wrong implementation that makes it RED |
| --- | --- | --- | --- |
| engineering/T47 | A Change whose paths all lie in selected, impacted capabilities passes, whatever its file names or count | false RED | One that compares paths to a list |
| engineering/T48 | Adding a dependent capability adds it to the impact, and a Change selecting it passes with no edit to Engineering | false RED | One with a fixed capability set |
| engineering/T49 | A path outside every selected location fails, named | false GREEN | One that admits any path once a scope is stated |
| engineering/T50 | A selected capability that no trace reaches fails, named | false GREEN | One that trusts the selection without the impact |
| engineering/T51 | A reachable but unselected capability's path fails | false GREEN | One that treats impact as authorization |
| engineering/T52 | An unattributed path, an unknown changed element and an unresolved trace are each unresolved, named, never GREEN | false GREEN | One that skips what it cannot attribute |
| engineering/T53 | A scope stated only in the candidate's Change Node authorizes nothing | false GREEN | One that reads the candidate's Nodes |
| engineering/T54 | With no stated scope, Core beside another capability fails "Core travels alone"; Core alone passes | both | One that drops the default |
| engineering/T55 | A `.github` path beside a selected scope fails | false GREEN | One that lets a scope cover `.github` |
| engineering/T56 | Hosting/C11 replay: the six-capability impact is computed from fixture traces mirroring `kaal/hosting`. #657's 62 paths pass under that selection. Adding a Foundation path fails, and so does dropping Graph from the selection | acceptance | — |

## Prerequisites, each its owner's

- **P1. Change.** The Change Node's statement of its changed elements, and of its selected scope. The scope is by capability, never by path or PR. This is a Change PLAN that Engineering asks for.
- **P2. Trace owners.** The relationships must be traversable by Graph as Edges in their source Nodes, or derived from them by their owner:
  - Intent and Requirement owners: Requirement → Intent, and Architecture → Requirement;
  - Testing: Case `tests →` (testing/N7);
  - Packaging: a realization's dependency on another package's identity (packaging/F7).

  The bracket citations and manifests carry these today, but as text, not Edges.
- **P3. Ownership claims** for every capability's location, Hosting, Engineer Skill, Foundation and Engineering included, in the format #609 settles. The claims also settle who owns the root files every workspace shares.
- **P4. Graph** supplies `traverse` with `direction: "in"` on `main`. It needs nothing new.

## Scope

This is a PLAN: Markdown only. Its DO, in `check.mjs`, `check.test.mjs` and `change-isolation.sh`, starts once P1–P3 are available on the target. Until then, "Core travels alone" stays as it is, and #657 stays held. The Owner decides whether #657 waits for this DO or takes another path. This authorizes no merge of #657, no red-CI bypass, and no synchronization, promotion or publication.

## Amendment: an interim migration allowance for hosting/C11

> PLAN amendment (engineering/C11, interim). It asks the Owner to approve one interim mechanism before it is implemented, as the Owner's review of #707 (comment 6544538942) requires. Nothing below exists on this branch. #707 implemented it before this approval, and it stays unmerged until this amendment is decided.

**Why.** The Owner's re-review of #657 (comment 6543757589) asked Engineering for "the narrowly scoped, temporary allowance for hosting/C11's exact affected path set, with extra/missing/subset paths refused and `.github travels alone` preserved", to be removed by a separate Engineering Change after #657 lands. The design above withdraws exact-path allowances as the isolation mechanism, and its DO waits on P1–P3, which other owners hold. Without an interim allowance, #657 stays held until P1–P3 land.

**What is asked.** The Owner chooses one:

- **A. One interim allowance, lapsing with its use.** `check.mjs` admits exactly one Change, hosting/C11, when its candidate's path set equals the set recorded for it. A superset, a subset or any other set fails, naming the extra and missing paths. `.github` still travels alone. "Core travels alone" applies to every other Change, unchanged. The allowance cites this amendment as its authority. A separate Engineering Change removes it once #657 has landed, and no other Change may use the mechanism. It is a migration exception, not a model of isolation: the invariant above stays the target, and engineering/F25–F27 and N13–N14 are not met by it.
- **B. No interim mechanism.** #657 waits for the engineering/C11 DO, which waits on P1 (Change), P2 (trace owners) and P3 (ownership claims).

Engineering recommends **A**, because #657 unblocks Graph and Core, and P1–P3 belong to four other owners. Its DO is #707, rebased onto this amendment once it is approved: the cases engineering/T57 (the exact set passes), T58 (a superset fails, naming the extra paths), T59 (a subset fails, naming the missing paths), T60 (a `.github` path beside the set fails) and T61 (any other Change gets no allowance). Each is observed RED first against an implementation that admits any path set for hosting/C11.

**Scope.** Markdown only. Approving A authorizes only #707 as its DO, and B authorizes nothing. Neither authorizes a merge of #657, a red-CI bypass, or a synchronization, promotion or publication.
