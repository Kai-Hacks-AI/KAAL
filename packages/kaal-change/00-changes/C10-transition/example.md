# C10 example

One small, self-contained example whose current and target expectations conflict. It names no platform. The Skill's trial uses exactly this.

## Current state (A)

A notes tool exports its store. Three Cases are green today and are **historical evidence**:

- H1: export writes a header row `id,title,body`, then one comma-separated line per note.
- H2: export writes every note in the store; none is dropped.
- H3: export of an empty store exits with 0 and writes only the header.

## Intended outcome (B)

- B1: export writes one JSON object per line and no header.
- B2: export writes every note in the store; none is dropped.
- B3: export of an empty store exits with 0 and writes nothing.

## Change (A to B)

Replace the comma-separated export by JSON Lines. Introduce B1. Keep B2 and the exit code of B3.

## What each kind of truth is

| Expectation | Kind | Why |
| --- | --- | --- |
| H1 | historical, superseded | true of A, contradicted by B1 |
| H2 = B2 | enduring | true of A and of B; its Case stays and must stay green |
| H3, exit code | enduring | true of A and of B |
| H3, writes only the header | historical, superseded | contradicted by B3 |
| B1 | target | true only of B; needs a new Case |
| same notes in both exports; H1 recorded as superseded | transition | shows that A became B and what was kept; lives in the Change record |

## Confusions the Skill must prevent

- Reading a green historical Case as evidence of B (all three are green today and B1 is still false).
- Keeping a superseded Case (H1) as a protection of B.
- Retiring an enduring Case (H2) because the old export is being replaced.
- Taking green Cases of B as proof of the transition, without evidence that what was kept was kept.
