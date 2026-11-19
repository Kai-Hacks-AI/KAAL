# C23 change

## PLAN

1. Add the Intent I2, the Requirements F40 to F44, N18 and N19, the Architecture A2 and the gap G113 under `packages/kaal-engineering/`. Their Cases T1171 to T1179 sit beside the element they test as `T<n>.red.mjs`.
2. Observe the expected RED against `main` (`evidence.md`) and show that each Case can pass on a throwaway copy that holds `draft/`.
3. The PLAN adds no package file: no `package.json`, no Skill Node, no Skill. `draft/` holds the intended `package.json` and `SKILL.md` for review only.

## Ids

Proposed, to be confirmed by the allocator: Change engineering/C23, Intent engineering/I2, Requirements engineering/F40 to F44 and N18, N19, Architecture engineering/A2, Cases T1171 to T1179, gap G113. They are the next free on `main` at `8989a652`, and they skip the ids the parked registration PLAN (#1954) holds: C17, I1, F36 to F39, A1, T1022 to T1031.

## What the Skill explains

- **One source, four stages.** `packages/<cap>` is where the capability is developed. `engineering/<cap>` uses the unpublished N+1 and is optional. npmjs publishes N. `.kaal/<cap>` uses N.
- **Deliveries.** `.agents`, `.claude`, `.github`, `.githooks` and similar are installed copies of an approved stage, placed by WIRE (see kaal-release).
- **Waste.** A stage copy and a delivery are not waste. Waste is a copy that no stage or delivery role explains, or a delivery that has drifted from its approved source.
- **Two legs.** Package to engineering is the ratchet, waste down and clean up. Engineering or `.kaal` to the skill location is a manual WIRE with the same mechanics from either source. They move at different pace.
- **Frame.** Lean 5S: Sort, Set in order, Shine, Standardize, Sustain.

## What the Skill does not explain

WIRE (kaal-release), the Test Case (kaal-testing), DIRT (kaal-controls) and registration (kaal-core). It names such a term once, on a line that says `see kaal-<owner>`, and stops. T1176 holds this.

## DO

Not authorized by this PLAN. On the go of the Owner, into the collector of this Change: add `package.json` (private, `@kaihacksai/kaal-engineering`, `files` payload and skills), the Skill Node under `payload/` (typed by Core's `KAAL Skill`; its id is the sha256 of its exact bytes), and `skills/kaal-engineering/SKILL.md` as in `draft/`. The Cases become `.test.mjs` when they are green. Nothing is published and the root workspace list is not changed unless the Owner says so.

## ACT

A 4L retrospective in `act.md` before the promotion.

## Open questions for the Owner

1. **Ratchet owner.** The Skill names the ratchet for the first leg, and the repository holds no definition of it: the only ratchet on `main` is release/C90's detective control on `pull_request_target`. Which capability owns the ratchet concept, release or controls? Until you say, the Skill states the direction (waste down, clean up) and gives no owner.
2. **Test Case owner.** kaal-testing does not use the words "Test Case" in its capability or payload (it speaks of Cases). T1176 points the term to kaal-testing as you said. Say if the Skill should write "Case".
3. **Deliveries that are not on `main`.** `.agents` and `.claude` do not exist in the tracked tree. The Skill names them as deliveries as you asked, and T1172 checks the existence of `.github` and `.githooks` only.
4. **Name clash.** The root `package.json` is already named `kaal-engineering`. The new package is `@kaihacksai/kaal-engineering`, so the names differ, and the capability id `engineering` is the one the Engineering areas already use (C1 to C22, F1 to F35).

## Not in this Change

No control, no script, no code, no publication, no Skill outside kaal-engineering, no change to kaal-engineer-skill (its Skill and BASS are the guide and are not edited), and no WIRE or file in `.agents`, `.claude`, `.github` or `.githooks`.
