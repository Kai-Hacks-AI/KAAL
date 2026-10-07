# Evidence

## What changed

Only the Agent Skill of Changing KAAL, in `packages/kaal-changing/skills/kaal-changing/` and its projection in `skills/kaal-changing/`: `SKILL.md` (steps 2, 3, 5, 6, 7 reworded; a new section, Handoff and continuation) and `references/rowing.md` (one paragraph in the roles section). No Node, evaluator, seal, Core file or sealed Change was touched (R9, R10).

## Requirements, one by one

- R1, R2, R3: step 2 no longer ends in "the Worker stops: the next step is not the Worker's". It names the progression the Worker carries (Intent described, Requirements defined, Architecture designed, code developed, done, defects detected) and the two real stops. Handoff and continuation states that a transition is not a permission. Step 3 no longer has the Worker "stop again" after resolving findings.
- R4: the section and `rowing.md` say role boundaries are ordered knowledge boundaries, that one actor may hold several roles, and that actors are not switched to look independent.
- R5, R7: the section lists the Owner's acts (Intent, judgment, text of `retro-owner.md`) as never written, inferred or supplied by another actor, and says a handoff, a green check or silence is not that judgment. Step 6 says carrying the Owner's own text verbatim is moving it, not writing it.
- R6: steps 5 and 7 and the section name what is carried without another go: sealing and `retro-work.md` once a round converges; `retro-review.md`, closing and putting the Change forward after the Owner's act.
- R8: the section ends continuation at host admission, which stays outside KAAL.
- R11: see the walk-through below.

## The test, walked through the Skill

The test is: after the Owner's one act, can the collaborating actor take the Change from that handoff through the remaining legal process without the Owner as a message router? Read literally, step 6 leaves the Owner two acts (judge, supply the text of `retro-owner.md`). Step 7 then says nothing between there and closing is the Owner's and the Reviewer-role holder writes `retro-review.md`; step 8 closes; Handoff and continuation says that actor may put the closed Change forward. Between those acts the Skill contains no stop and no request for a go. Where the answer is still no, it is stated: the Owner's own acts, Review by another actor when independence is wanted, and host admission.

## Checks run

- `npm run check-kaal-install`: exit 0, the host projection equals the package.
- `npm run check-kaal-seals`: exit 0.
- Changing KAAL tests (`engineering/kaal-changing`, 32) and `packages/kaal-changing` tests (3): all pass.
- `state-kaal-change` for this Change: WORK OPEN; the Work identity moves with every edit, as expected.

## Not shown

This is wording, not enforcement. The record cannot show who wrote a file or whether a go was asked for, so no check can confirm that an actor behaves this way. The only evidence is the text, and a later Change run under it. The Skill was not exercised by a second actor in this Change. Whether a handoff artifact or protocol is still needed is left for Review and the Owner: nothing here shows one is required, and nothing shows it is not.
