# Pull Promotion: the smallest coherent capability (scope challenge)

Status: **proposal for CPO alignment, answering the scope challenge of 12 Nov 2026.** It supersedes the parts of [decomposition.md](decomposition.md) that it contradicts (named in section 6). Nothing is implemented and no DO, merge or promotion is authorized.

## 1. The three steps, taken as the intent

1. **Walk the collectors**, from `main` looking upstream.
2. **Identify the collectors that have fulfilled their PDCA**, from the authoritative evidence for PLAN, DO, CHECK and ACT, not from a readiness policy of our own.
3. **If more than one qualifies, say which moves next**, by an explicit, authoritative ordering; **if none qualifies, say why and what evidence is missing.**

I agree this is the right size. The capability I built in `pull/C1` is larger than that, and the E1/E2/`pull/C3` decomposition grew to carry the extra.

## 2. Three things that must stay apart

| Question | Who answers it | What Pull Promotion does with it |
| --- | --- | --- |
| **PDCA completion**: has every Change in the collector done PLAN, DO, CHECK and ACT? | The Changes' own records and the controls that own CHECK | **Decides it.** This is the whole capability. |
| **CI and branch readiness**: is the collector current with `main`, do admission checks pass on a promotion? | The preventive controls (Branching, Promotion Source, the merge queue, the rulesets) | Never judges it. May show an observed conclusion as context. A red control blocks the promotion by itself; Pull Promotion neither repeats nor replaces it. |
| **Authorization to promote** | The Owner | Never grants, withholds or models it. Its output says "PDCA complete", never "may promote". |

Pull Promotion is a detective, advisory capability. It must not become a second gate or hold approval criteria of its own.

## 3. The three steps, made concrete

**Enumeration.** Collectors are not guessed from the host. The authoritative Release declaration lists them and where each promotes: the collectors whose target is `main`, then, upstream, the collectors that feed those. The walk starts at `main`. A declared collector the host does not have is reported as a gap; a host collector in the collector namespace that the declaration does not list is reported as undeclared and not judged.

**PDCA evidence, per Change in the collector.** A Change is complete when, in that collector and not yet delivered:
- **PLAN, DO and ACT** have landed. Landing is the authoritative evidence of each, because landing in a collector is itself the result of the preventive gate (approval and checks of the Integration ruleset). Reviews are not re-judged.
- **CHECK** holds: the checks that the Release declaration names as the Check phase are green on the collector's head. Which checks they are is declared, with their owning control, not decided here.

A collector qualifies when every Change in it is complete. A missing phase is named. A fact that cannot be read is UNKNOWN, never a pass.

**Prioritization.** The explicit order and the work-in-progress limit are the Release declaration's. Pull Promotion applies them to the qualifying collectors and returns them in that order, the first being the one that moves next. It invents no order and no limit; where the declaration states none, it lists the qualifiers unordered and says so.

**Output.** For each declared collector: qualifies, does not qualify (with the missing phase or check per Change) or not judged (with the missing fact), plus the ordered list of qualifiers. No verdict named READY.

## 4. Comparison with the current `pull/C1`

| Part of `pull/C1` | Verdict | Why |
| --- | --- | --- |
| One named collector in, one verdict out | **Reduce to enumerate and order** | The intent has Pull Promotion walk the collectors and prioritize; it does not take one as argument. |
| `lifecycle` (PLAN, DO, ACT landed in the collector, legacy records identified) | **Necessary** | It is step 2. The legacy list is a reporting aid, not a rule, and may leave the capability. |
| `verification`, `protection` (checks by owner) | **Necessary, as one CHECK** | They are the CHECK phase. Their split into two judgments is a presentation of which control owns which check. |
| `sequencing` (behind the target, dependencies between collectors) | **Elsewhere** | "Behind `main`" is branch readiness, owned by the preventive controls. Order and dependencies between collectors are the authoritative ordering of step 3, read from the declaration. |
| `validation` (reviews approved at the landed version) | **Accidental** | Landing already proves approval; re-judging it makes a second gate. |
| `attribution` (which check has which owner) | **Accidental** | It exists to police the invented owner map. With CHECK declared by the Release declaration it disappears. |
| Holds (`WAIT`, escalate) | **Elsewhere** | A hold is the Owner's authorization. Pull Promotion does not model it; if the Release declaration carries holds it may display them. |
| Gap relevance (`pull/F19`), `gapRules` | **Reduced** | Only the gaps of the four observations below can matter, and they are structured. The prose fallback and `gapRules` go. |
| Next-step recommendations (OPEN, REVIEW, REVISE, LAND, WAIT) | **Accidental** | They are Show WIP's vocabulary. The only recommendation is "this qualifier is first in the declared order". |
| Reading Show WIP's lane and findings (`flow`) | **Accidental** | Already ruled out by the CPO. |

## 5. The smallest observations and what they imply

Pull Promotion needs only these observations, nothing else of the host:
1. the declared collectors that the host has, with the head version;
2. the pieces landed in each collector, with their type, their Change id and the order they landed in;
3. the last delivery of each collector (the collector version a landed promotion carried), to tell what is already delivered;
4. the conclusions of the declared Check checks on each collector's head.

Not needed, and left to Show WIP and the controls: open pull requests, fit, comments, reviews, merge state, authors, per-piece check history.

So the shared element E1 shrinks to these four observations plus the structured gap, and is justified only if Show WIP consumes the same four. Show WIP needs more, so E1 is their intersection and each consumer extends it with what is its own. If the Track Work / Show WIP Intent discussion finds that the overlap is too small to justify a shared contract, the alternative is a small observer private to Pull Promotion with a distinct contract, which duplicates no mapping because the four observations are not Show WIP's. I recommend E1 only if that discussion confirms the overlap.

## 6. The smallest path, and what it changes in the earlier proposal

1. **The authoritative Release declaration** (owned by Release; the collectors and where they promote, the Check checks and their controls, the order and the WIP limit). It is the one source of policy and the first dependency. If it does not exist as one record, that is its own PLAN.
2. **`pull/C3`, now a replacement rather than an amendment** of the capability: enumerate, establish PDCA, order, explain. `pull/C1` stays as the record of what shipped.
3. **The observer** for the four observations (E2), with E1 reduced as in section 5, or private to Pull Promotion if the overlap is too small.
4. **The integration** (`pull/C2`): the command that runs the observer and the capability by hand.
5. **Wiring**: separate, later, not planned.

Superseded in [decomposition.md](decomposition.md): the six judgments and their allocation (section 4), E1 as the full observation model (section 2), and the need for `pull/F19`'s relevance rule. Kept: the transition of Show WIP's supplier, the separation of capability, integration and wiring, the preservation of `pull/C1`.

## 7. Questions for the CPO

1. Is "landing in the collector is the evidence of PLAN, DO, ACT, and the Release-declared checks are the evidence of CHECK" the right authoritative evidence, with reviews not re-judged?
2. Is "branch readiness" (behind `main`, admission) rightly kept out of eligibility, shown at most as observed context?
3. Does an authoritative Release declaration with the collector graph, the Check checks and the order already exist, or is it a Change of its own?
4. Should the output stop saying READY and say only "PDCA complete"?
