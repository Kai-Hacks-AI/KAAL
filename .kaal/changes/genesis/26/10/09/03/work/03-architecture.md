# Architecture — Finding Judgment and Governed Disposition

Recommendation first. Nothing is built, sealed or established; the forks are the Owner's.

## The model in one line

**Review reports; the Reviewer's next round says whether a finding stands; authority, not Review, says whether it is done now; preservation is the Work and its seal; later is a candidate; understanding is a Learning.** No new capability owns a judgment, and nothing here is a findings registry.

```
 Reviewer ── round (findings) ──▶ Worker investigates, reproduces, states its position in work/
                                   │
        Reviewer's next round: each earlier finding STANDS or DOES NOT STAND  (validity; Review's)
                                   │
   does not stand ──▶ rejected      reasoning kept: the Worker's position + the round, both sealed with the Change
   stands ──▶ authority question (not Review's): is the correction inside the fixed Intent, the agreed
              Requirements/Architecture and the grant of THIS Work?
        yes (now)   ──▶ correct in work/, next round says it no longer stands
        no  (later) ──▶ preserve: a confirmed Defect in the Work's evidence; established results untouched;
                        Work continues where legitimate
        blocks the Work (unsafe / impossible / cannot meet its requirements) and the decision exceeds the grant
                    ──▶ stop and name it: the Owner; inside the inner loop, HOW
   later, once preserved ──▶ a candidate citing the Defect (#42) ──▶ a later governed Change picks it up
   what it taught        ──▶ a Learning citing the Defect as evidence (#72)
```

## 1. The distinctions, in the words an Agent should hold

| Distinction | The sentence | Owned by |
|---|---|---|
| **Finding** vs **confirmed Defect** | A finding is a claim in a round. A confirmed Defect is a finding that stands *and* is backed by what the briefing lists: claim and affected identity, violated contract, reproduction, executable evidence, the validity judgment. | Review (finding); the Work's evidence (Defect) |
| **Validity** vs **authorization** | Whether a finding is correct is settled by evidence and the next round. Whether the Work may change because of it is settled by the fixed Intent, the agreed results, the grant, and the Owner. A reviewer's say-so settles the first at most, never the second. | Review / Changing KAAL |
| **Review** vs **Work selection** | Review examines a result and reports. Selection decides what Work happens next. A finding becomes future Work only when someone writes a candidate and a human ranks it. | Review / #42 |
| **Current scope** vs **future Work** | Current scope is the fixed Intent and the agreed results this Change was handed. Anything else that is valid is future Work, preserved. | Changing KAAL / #42 |
| **Preservation** vs **correction** | Preserving evidence adds files beside an agreed result. Correcting changes the result. Only a governed Change authorizes the second. | Work seal / a later Change |
| **Autonomous judgment** vs **HOW** | The Worker and Reviewer may settle: standing, in-scope correction, rejection, deferral within the grant. HOW is for what the grant does not reach: a defect that blocks the Work, a dispute the loop cannot close, a scope call that is the Owner's. | Process (#75), HOW (#77) |

## 1a. Continuing with an unmet upstream obligation

A valid finding that cannot be corrected here leaves some upstream obligation unmet. Whether the Work may then go on is not a Review question and not the Worker's to improvise; it has one test: **was this Work handed that obligation to deliver?**

- **No** (the trial: `scope.md` hands the Work R2 to R4 and the architecture as it is; R1 is upstream and unmet by that architecture). Continuing is legitimate. The round that converges must say precisely what it examined: a *limited conformity* review (subject: the Code; standard: the architecture; expectation: does the Code realize it), which does not say the Code satisfies the Requirements. The unmet obligation is named in the round and in the Defect, and the finding stays valid and deferred.
- **Yes** (the Work is required to deliver it, and delivering it needs authority the Work lacks, here a revision of the architecture). Convergence would be false. The Work stops and names the Owner; inside an inner loop that is HOW. Nothing is implemented, nothing is erased, and the Defect is preserved all the same.

The observed violation is stated as against R1 (the requirement), never as a deviation from an architecture that the Code faithfully realizes.

## 2. Smallest allocation across existing capabilities

| Responsibility | Home | Status |
|---|---|---|
| The finding, its form, "stands / does not stand" in the next round, convergence | `kaal-review` (rounds) | exists |
| Challenge: the Worker investigates, reproduces, states its position and reasoning | `work/` of the Change (`rowing.md:81`) | exists, undocumented as a *position on each finding* |
| Disposition now / later / escalate | authority: fixed Intent, grant, Owner; stated by Changing KAAL / the Process | exists in spirit (ROWING "Not Generalized"); wording over-reaches (`kaal-changing` "a finding is work to resolve") |
| Confirmed Defect and its red test | the Work's evidence, sealed with the Change at close | **convention missing** (G2) |
| Rejected / disputed findings with reasoning | the Worker's position in `work/` plus the rounds | exists once the position is written |
| Preserving agreed results while a Defect is recorded | identity citation; the Work seal at close | exists |
| Future Work | candidate citing the Defect | designed (#42), **not built** |
| What the Defect taught | Learning citing it as evidence | designed (#72), **not built** |
| Autonomous convergence vs escalation | Agreement loop, HOW | #75 draft; accept/challenge/defer exists since the revision pinned in §6; **two mismatches remain** (§6) |
| Requests / Incidents | only when KAAL itself failed; never the client's own defect | exists; **not** used for D6 of a product |

A *Defect* is therefore a **state of a finding with evidence**, held in the Work of the Change that confirmed it. It is not a Node, a Skill, a type or a registry. I recommend against a Defect Skill for 0.0.1: it would own nothing Review, the Work and #42 do not already own.

## 3. Sealing between the Ds

The briefing asks where an authoritative boundary *genuinely* benefits from immutable identity.

- **Between the Ds inside one Change: no new seal, and one reason.** Identity is already free (`artifact-id.mjs`), and a Defect that cites `architecture.md` by its SHA-256 makes "the architecture is untouched" *checkable*: recompute and compare (trial step 7, 9). While the Work is open, `work/` is mutable by design; a seal there would be a phase, and phases were ruled out ("no other phases, state derived from artifacts/seals"; phase seals "must not be precluded"). Nothing is precluded here.
- **Where a seal earns its keep:** (a) the Work seal at close, which already freezes the Defect evidence and the architecture together, so a Defect found *during* the Change is preserved immutably *with* the result it concerns; (b) a result others build on across Changes: a Node is sealed by its birth; a Change is sealed by closing. A Defect found *after* a Change closed cannot be added to it ("nothing is added to a Change once it is admitted"), so it lives in the discovering Change, citing the closed result by identity. That is "beside, never by changing".
- **A Defect's own citable identity:** `artifact-id.mjs --named --domain defect <dir>` identifies a defect directory (trial: `5312c6be…`). Whether to *seal* such identities, or only cite them, is Fork 4; I recommend citing now.

## 4. A red test and "every merge must be green"

A preserved red test must not be collected by any suite that CI runs, or the repository could never merge. It is kept as evidence: a file named for what it is (`*.red.mjs`), outside `tests/`, with its observed failing output, run on demand by one command that is *expected* to exit non-zero (trial step 7). Never inverted into a passing test of the bug, which would turn the defect into a requirement. When the correcting Change lands, the red test is promoted to a green test in that Change; the preserved copy stays what it was.

## 5. Where "later" is found

Today: a later Change finds a Defect by reading closed Changes' `work/` for the convention (trial step 9) or by following a retro that points at it. That works and is weak. It becomes sound when (#42) a candidate cites the Defect, and the order puts it in front of an Agent; and when (#72) a Learning's Cue brings it back at the right situation. I recommend not inventing a third path.

## 6. The inner loop (#75), against an exact revision

Examined: `Kai-Hacks-AI/KAAL#75` at `0c2d05b` (§6a "Findings are not orders" and `agree.mjs`); Kai's Reviewer examined `901dd45b`. #75 moves, so any statement here is about those revisions. Read, not edited.

**The historical gap, and what has since answered it.** Earlier in this Change's life I read #75 as having no exit for a valid finding that is not implemented. That was true of its first revision and is no longer true. #75 now has answer events `accept` / `challenge` / `defer`, a ground quoted from the current subject or the Owner's grant words, a pinned reference to the round answered, reconsideration of unchanged bytes (not `unrevised` when every finding is challenged or deferred), `HOW(disputed)` when the Reviewer reports findings again on those bytes, and a `finding` line per finding in every brief. That is the mechanism this briefing asked for ("a Worker can investigate, challenge and disposition findings without treating them as orders"). Whether it is *correct* is #75's review, not this Change's, and a quoted ground or an existing carrier is not proof of authorization.

**Remaining mismatches, only these:**

1. **Authority for a valid blocking finding.** The closed HOW list now has `disputed` but still no condition for "valid, and delivering the obligation needs authority this Work lacks" (§1a, the *yes* branch). A Worker can `defer` such a finding and the loop can converge on it, which is exactly the false convergence §1a forbids. Recommend one more closed condition, raised when the Worker's answer says the finding blocks an obligation it was handed; to be answered by a human direction like any other. Outside the loop the same case stops and names the Owner, as the empty-Reviewer-seat rule does.
2. **The carrier a `defer` points at.** #75 names "typically a `kaal-request`/`kaal-incident` carrier, otherwise the project's own backlog". For a product Defect that is wrong twice over: Incident and Request are addressed to KAAL and `kaal-incident` says it is not for the client's own defects (trial step 8: the carrier is accepted and cannot hold the red test, the identities or the validity judgment), and "the project's backlog" is no governed place. The carrier a product Defect needs is the Defect record in the Work (§2: `defect.md`, red test, affected code, identities). That, not a Request or Incident, is what an answer's carrier should cite. This is wording in #75's thread and in the Skill text, not a change to its mechanism.

**Convergence with a preserved finding** (the question I earlier put as a fork) is settled by §1a: a limited conformity round may converge while the finding stays valid and deferred, provided the round says what it did not examine; a Work that was handed the obligation may not converge.

## 7. Gaps for 0.0.1 (only these)

| # | Gap | Smallest answer | Where |
|---|---|---|---|
| G1 | Agent-facing words for the six distinctions; `kaal-changing` says a finding is work to resolve | a short section on judgment and disposition, and one corrected sentence | `kaal-changing` Skill wording + `references/rowing.md`, one pointer line in `kaal-review` SKILL; unsealed; travels with its installed projection |
| G2 | What a confirmed Defect retains, and where | the seven items of the briefing as a short form in the Work's evidence (trial: `defects/NN/defect.md`, the red test, observed output); wording only, no script | same wording Change; a script only if a second trial shows the need |
| G3 | The Worker's position per finding, in a Change that is not in the loop | one file in `work/` answering each finding by number (`dispositions.md` in the trial) | same wording Change; #75's answer events are the in-loop counterpart (§6) |
| G4 | Red test kept out of green suites | the convention in §4 | wording |
| G5 | Discovery of deferred Defects | none beyond reading closed Changes until #42/#72 are realized | those Changes, not this one |
| G6 | The two mismatches in §6: authority for a blocking finding; the carrier a `defer` cites | a comment on #75, then its own Change if accepted | #75's thread |

Not gaps, deliberately: a Defect Node or Skill, a findings registry or index, a status field, a seal between the Ds, a change to `kaal-review`, `kaal-sealing`, `kaal-incident`, `kaal-request`, Core or `.github`.

## 8. Acceptance, mapped

| A fresh Agent must distinguish | Shown by |
|---|---|
| Finding from confirmed Defect | trial: F1/F3 are findings that end as fixed/rejected; only F2 has `defects/01` |
| Validity from authorization | F2 stands (round 02) and is still not done (`dispositions.md`) |
| Review from Work selection | round 02 converges; nothing in it selects Work |
| Current scope from future Work | `scope.md` vs F2's reason |
| Preservation from correction | `architecture.md` identity unchanged; red test still red |
| Autonomous from HOW | trial settles all three alone; the *must stop* case is §1a, argued and not run in a loop (#75 unmerged) |

Until G1 is realized an Agent can distinguish these only by reading this Change; that is the honest status of the acceptance criterion.

## 9. Open forks (recommendation first)

1. **Realize G1–G4 in this Change?** *Recommend a separate wording Change after you have read this one*, like 08/04 and 09/01. Alternative: widen this Change to the wording.
2. **Does #75 get the two changes in §6 (a blocking-authority condition; the Defect record as the cited carrier)?** *Recommend yes, raised on its own thread; its answer events already supply the position record I earlier asked for.* Alternative: leave them for the realization Change after #75 merges.
3. **Is a Defect directory convention (`defects/NN/`) acceptable inside `work/`?** *Recommend yes, as a trial convention*, since `rowing.md`/Changing say not to invent structure beyond need and this is the need. Alternative: carry it in a free-named file and let G2 name only the contents.
4. **Cite or seal a Defect's identity?** *Recommend cite only*; sealing needs a place and a control, which a future Defect-aware candidate/Learning may justify.
5. **May a limited conformity round converge while a valid finding is preserved?** *Recommend yes, by §1a: only when the Work was not handed the unmet obligation, and the round states its subject, standard and expectation and says it does not claim the Requirements.* Alternative: such a round always says `findings`.
6. **Incident or Request for a product Defect?** *Recommend no, and that #75's `defer` carrier cite the Defect record (§6, mismatch 2). Incident only when KAAL's own behaviour toward a client failed.*

## 10. What is deliberately not here

No Defect Skill or Node, no registry or index, no status or priority, no seal between the Ds, no change to a sealed Node, Core, `.github` or any package, no redefinition of the six Ds, no edit of #75 or reopening of any converged Change, no Reviewer assignment, no seal of this Work and no closure.
