# ACT library sensitivity: Pilot

Testing's one-off mutation pilot on release's ACT library (`testing/C79`), challenging the claims K1–K8 that `requirements.md` registered before the run. Testing decides no verdict and changes no release file: this record reports what release's own Cases did and did not reject.

## Pin

- Code challenged: `main` at 7873330b51df80fffef943f4e5f30b9ed3c7d9b7 (after release's promotion #2243, which brought `release/C122`). `release/C125` (Hold reads Testing's catalog evidence, `applicableCases` reads both quote forms) is **pending**: it will change `judgeHold` and `applicableCases`, so this record does not cover them as changed.
- Targets: `engineering/release-management/05-src/phase/lib/cases-green.mjs` (K1–K6) and `engineering/release-management/05-src/phase/judge-act.mjs` (K7–K8; `judgeHold`, `judgeAct`).
- Cases run, with release's own Case files and the plain `run()` each exports, one fresh Node process per Case: the 12 Case files of that tree that mention `cases-green`, `judge-act`, `casesAreGreen`, `judgeHold` or `judgeAct`: T1260, T1261, T1262, T1263, T1264, T1265, T1266, T1299, T1310, T1312, T1314, T1317. All 12 are GREEN on the unmutated tree.
- Setup: a scratch copy of the tree at the pin (Node 22.23 in the sandbox), one source file swapped per run, the copy discarded. The runner is not committed (N38).
- Interception check: each mutant file carried a one-line prelude that appends to a trace file when the module loads. Every mutant was loaded by the Cases (loads per mutant: M1=31, M2=6, M3=6, M4=9, M5=23, M6=23, M7=23, M8=18, M9=6, M10=31, M11=19, M12=30, M13=30, M14=18, M15=5, M16=18, M17=18, M18=5, M19=18, M20=31, M21=31, M22=18, M23=31). A mutant with no load would be `unresolved`.
- Method note: a run is `killed` when at least one Case fails by assertion with the mutant loaded; an exception that is the mutant's own and comes from the mutated line is attributed too (M16) and said so; an error unrelated to the mutated line would be `unresolved`. There was none.

## Claims

K1 to K8 are those of `requirements.md`. Every claim has at least one row below. No claim is untested.

## Mutants

23 PASS-widening mutants (each makes a wrong answer reach PASS, or softens FAIL to UNKNOWN, or lies in the counts). One change per mutant; each `from` occurs once in its file. `‖` in a cell stands for the JavaScript operator `||`, which a table cell cannot hold.

| Mutant | Claim | Mutation | Witness | Observation | Judgment |
| --- | --- | --- | --- | --- | --- |
| M1 | K1 | `cases-green.mjs`: `if (!applicable?.length) return` → `if (false) return` | T1264 (T1264:40), T1312 (T1312:32) | killed by T1264 and T1312 | pinned by two Cases |
| M2 | K2 | `cases-green.mjs`: `if (c.parked) findings.push` → `if (false) findings.push` | T1264 (T1264:27), T1266 (T1266:49), T1299 (T1299:42), T1312 (T1312:25) | killed by T1264, T1266, T1299 and T1312 | pinned |
| M3 | K2 | `cases-green.mjs`: `reason: 'still planned red (a .red.mjs file)', fail: true` → `reason: 'still planned red (a .red.mjs file)', fail: false` | T1264 (T1264:27), T1266 (T1266:49), T1299 (T1299:42), T1312 (T1312:25) | killed by T1264, T1266, T1299 and T1312 | pinned: parked softened to UNKNOWN is seen |
| M4 | K3 | `cases-green.mjs`: `reason: 'observed RED', fail: true` → `reason: 'observed RED', fail: false` | T1264 (T1264:27), T1266 (T1266:61), T1299 (T1299:45), T1312 (T1312:25), T1317 (T1317:23) | killed by T1264, T1266, T1299, T1312 and T1317 | pinned |
| M5 | K4 | `cases-green.mjs`: `else if (observed?.[c.id] !== 'GREEN')` → `else if (observed?.[c.id] === 'UNKNOWN')` | T1264 (T1264:37), T1266 (T1266:63), T1312 (T1312:30), T1317 (T1317:24) | killed by T1264, T1266, T1312 and T1317 | pinned |
| M6 | K4 | `cases-green.mjs`: `else if (observed?.[c.id] !== 'GREEN')` → `else if (observed?.[c.id] === 'RED')` | T1264 (T1264:37), T1266 (T1266:63), T1312 (T1312:30), T1317 (T1317:24) | killed by T1264, T1266, T1312 and T1317 | pinned |
| M7 | K5 | `cases-green.mjs`: `if (findings.length) return { verdict: 'UNKNOWN'` → `if (false) return { verdict: 'UNKNOWN'` | T1264 (T1264:37), T1266 (T1266:63), T1312 (T1312:30), T1317 (T1317:24) | killed by T1264, T1266, T1312 and T1317 | pinned |
| M8 | K5 | `cases-green.mjs`: `green: applicable.length - findings.length` → `green: applicable.length` | T1264 (T1264:30), T1266 (T1266:50), T1312 (T1312:27) | killed by T1264, T1266 and T1312 | pinned: the counts are asserted, not only the verdict |
| M9 | K5 | `cases-green.mjs`: `if (failed.length) return { verdict: 'FAIL'` → `if (false) return { verdict: 'FAIL'` | T1264 (T1264:27), T1266 (T1266:49), T1299 (T1299:42), T1312 (T1312:25), T1317 (T1317:23) | killed by T1264, T1266, T1299, T1312 and T1317 | pinned |
| M10 | K6 | `cases-green.mjs`: `parked: Boolean(k.parked ‖ all.get(k.id)?.parked)` → `parked: Boolean(k.parked)` | T1312 (T1312:39) | killed by T1312 only | pinned, but by a single witness: one Case stands between a hidden parked duplicate and a PASS |
| M11 | K6 | `cases-green.mjs`: `for (const c of changes) for` → `for (const c of changes.slice(0, 1)) for` | T1299 (T1299:43), T1312 (T1312:37) | killed by T1299 and T1312 | pinned |
| M12 | K7 | `judge-act.mjs`: `if (acted !== true && acted !== false) return` → `if (false) return` | none: every run Case stayed GREEN | survived: every run Case stayed GREEN with the mutant loaded | required invariant: judgeAct with `acted` undefined, null or a non-boolean answers UNKNOWN (release C103 interface.md, `judgeAct`). No Case calls it with an unknown `acted`, so the check can go unnoticed. judgeAct has no caller in the tree at this SHA, so the exposure is latent until a caller appears. Justified Case J1. |
| M13 | K7 | `judge-act.mjs`: `if (acted === false) return pass(` → `if (acted === true) return pass(` | T1264 (T1264:24) | killed by T1264 only | pinned, single witness (the `acted` true/false branch has one Case) |
| M14 | K8 | `judge-act.mjs`: `if (unqualified.length) return cannot` → `if (false) return cannot` | T1299 (T1299:51), T1317 (T1317:27) | killed by T1299 and T1317 | pinned |
| M15 | K8 | `judge-act.mjs`: `if (!retros.some((r) => r.reflects.some((id) => carried.has(id)))) return pass` → `if (retros.some((r) => r.reflects.some((id) => carried.has(id)))) return pass` | T1266 (T1266:49), T1299 (T1299:40), T1317 (T1317:19) | killed by T1266, T1299 and T1317 | pinned |
| M16 | K8 | `judge-act.mjs`: `r.reflects.every((s) => typeof s === 'string'))) return cannot('the retros are not known')` → `true)) return cannot('the retros are not known')` | T1299 (T1299:47) | killed by T1299 (by an exception, not an assertion: the library throws `id.includes is not a function` on the mutated line, where the original answers UNKNOWN; baseline GREEN, so the throw is the mutant's own and attributed) | pinned only through the crash: T1299 asserts nothing about the answer when `reflects` holds a non-string, so a different failure mode would pass. Part of J2. |
| M17 | K8 | `judge-act.mjs`: `c.id !== '' && Array.isArray(c.applicable)` → `c.id !== ''` | T1299 (T1299:46) | killed by T1299 only | pinned, single witness |
| M18 | K8 | `judge-act.mjs`: `return applicableCasesAreGreen({ changes, observed }); }` → `return pass('x', { applies: true, findings: [] }); }` | T1266 (T1266:49), T1299 (T1299:42), T1317 (T1317:23) | killed by T1266, T1299 and T1317 | pinned |
| M19 | K5 | `cases-green.mjs`: `unknown: findings.length - failed.length` → `unknown: findings.length` | T1264 (T1264:30), T1266 (T1266:50), T1312 (T1312:27) | killed by T1264, T1266 and T1312 | pinned |
| M20 | K3 | `cases-green.mjs`: `else if (observed?.[c.id] === 'RED')` → `else if (observed?.[c.id] === 'RED' && !c.parked)` | none: every run Case stayed GREEN | survived: every run Case stayed GREEN with the mutant loaded | equivalent change: the parked branch is tested first, so a parked Case never reaches the RED test and `&& !c.parked` is redundant. No Case can or should kill it. |
| M21 | K1 | `cases-green.mjs`: `return { verdict: 'UNKNOWN', applies: true, progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-'` → `return { verdict: 'UNKNOWN', applies: false, progress: { red: 0, green: 0, unknown: 0 }, findings: [{ id: '-'` | none: every run Case stayed GREEN | survived: every run Case stayed GREEN with the mutant loaded | architectural concern: casesAreGreen and judgeAct build their answers as object literals, not through lib/result.mjs, so the refusal F88 states ("a verdict other than PASS with `applies` false is refused") cannot fire for them, and no Case notices an UNKNOWN that says `applies: false`. It is not a false PASS (judgedAndFine needs a PASS), but a consumer that reads `applies: false` as "nothing to judge" would skip an UNKNOWN. C113 change.md says cases-green.mjs builds its answers with the module; at this SHA it does not import it. Justified Case J3. |
| M22 | K8 | `judge-act.mjs`: `typeof c.id === 'string' && c.id !== ''` → `typeof c.id === 'string'` | T1299 (T1299:46) | killed by T1299 only | pinned, single witness |
| M23 | K6 | `cases-green.mjs`: `a.id.localeCompare(b.id, 'en', { numeric: true })` → `a.id.localeCompare(b.id, 'en')` | none: every run Case stayed GREEN | survived: every run Case stayed GREEN with the mutant loaded | proposed clarification: dropping `numeric: true` only reorders ids such as `x/T10` and `x/T9` in the message and the findings. No document says the order is a contract. Either state it and add a Case, or leave it unpinned; Testing needs no change. |

## Result

19 of 23 mutants were killed, 4 survived (M12, M20, M21, M23); none was invalid; none stayed unresolved.

- **The three claims that matter most are well pinned.** No mutant of K1–K6 reached PASS undetected: empty, parked, RED, unobserved, counts, carried-Change merge and the parked duplicate are each caught.
- **Thin spots, not defects.** Five kills have one witness only (M10, M13, M17, M22 and M16 through a crash). They hold today and would break silently if that one Case were edited.
- **Survivors.** M12 is a missing assertion on a documented contract (K7). M21 is a contract-vs-construction gap (F88, result.mjs). M20 is equivalent. M23 is an uncontracted ordering. None lets a wrong answer reach PASS today. A survivor here is neither a defect nor harmless by itself: M12 and M21 are findings for release to weigh against C125, M20 and M23 need nothing.

## Handover to release

Release decides whether these go into `release/C125` or a Defect; Testing opens neither and changes nothing in `engineering/`.

1. **M12 (K7), required invariant.** The documented branch `judgeAct` UNKNOWN for an unknown `acted` has no Case. Justified Case J1.
2. **M21 (K1, F88), architectural concern.** The answers of `casesAreGreen` and `judgeAct` bypass `lib/result.mjs`. Either build them through `answer`/`pass`, which would refuse the bad shape, or pin the shape with J3. C113's `change.md` says the former was intended.
3. **M16, thin kill.** Pin the answer, not only the absence of a crash, when `reflects` holds a non-string (J2).
4. **M20, M23.** Nothing to do. If release wants the id order in findings to be a contract, say so in a Requirement first.

## Justified Cases

Text only, for release to land in its own Change (Testing writes no Case into release's tree). Each was run as a throwaway check: it passes on the unmutated tree and fails on the mutant named (J1 on M12, J2 on M16, J3 on M21).

- **J1** (kills M12). Given `judgeAct({ applicable: [{ id: 'x/T1' }], observed: { 'x/T1': 'GREEN' }, acted })` for `acted` in `undefined`, `null`, `'true'` and `1`, the verdict is `UNKNOWN`, `applies` is `true`, and the message says it is not known whether a retro reflects the Change.
- **J2** (kills M16 by assertion). Given `judgeHold({ changes: [{ id: 'x/C1', applicable: [] }], retros: [{ reflects: [1] }], observed: {} })`, the answer is `UNKNOWN` with `applies: true` and does not throw; the same for `reflects: [null]`.
- **J3** (kills M21). For each of: no applicable Case, an unobserved Case, an `acted` that is unknown, and an unreadable carried Change, the answer is `UNKNOWN` with `applies: true`; and `applies: false` appears only on a `PASS`.

## BASS note

Skill, Script or neither: the method is the one `skills/kaal-testing` already teaches (Targeted Mutation Verification), and the loader and runner took about forty lines. A standing script is **not earned** by one pilot; if a second pilot repeats the swap-load-trace shape, extract it then. Nothing is committed.

## Files added

- `packages/kaal-testing/plan/act-library-sensitivity/pilot.md`
- `packages/kaal-testing/plan/act-library-sensitivity/evidence.md` (a section added)
- `packages/kaal-testing/package.json` (the aggregate Case appended to `scripts.test`)
