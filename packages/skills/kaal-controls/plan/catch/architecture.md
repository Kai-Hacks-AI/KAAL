# CATCH ME IF YOU CAN: Architecture

Each element names, in brackets, the Requirements it answers.

- **controls/A3** [controls/F4–controls/F8 with controls/F6a, controls/N3]: `controls/C5` adds `payload/CATCH-ME-IF-YOU-CAN.md`, a `KAAL Definition` named `CATCH ME IF YOU CAN`, beside `HAPTIC.md`. It holds the verbatim expansion and the principle in the terms of controls/F5–controls/F8. It cites `Controls` for detective controls and independence. It names other capabilities only as optional complements (controls/F8). The `Controls` Node is not edited, so its id does not change.
- **controls/A4** [controls/F9]: `skills/kaal-controls/SKILL.md` gains the section "Hunt for misbehaving elements" after "Keep independent controls apart". The README's file list and its "What it teaches" section each gain one line.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Its own Definition** (recommended) | A Node of its own, like `HAPTIC`, with the expansion kept verbatim and testable. | One more Definition in the payload. |
| B. A paragraph in `Controls` | The principle becomes part of the Capability Node's text. | It changes the Capability's id again, and a mnemonic is harder to cite and test inside a longer text. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `controls/C4` PLAN, this Change | Controls | none |
| `controls/C5` DO: controls/A3, controls/A4 | Controls | `controls/C4`, `controls/C2` (#597), because both edit the payload test |

`controls/C5` may land before the promotion pair and then travels with it. If it is not ready when Controls gets the promotion slot, it waits for the next promotion. The pair does not wait for it.

## Contracts reused

- **Core**: `KAAL Definition` and admission.
- **Controls**: detective controls, the independence of controls, and the limits of assurance (`Controls`, as `controls/C2` left them).

Testing, Review and the other capabilities are not dependencies. The Definition may name their existing contracts as optional complements, but it relies on none of them and restates none of them, so a change there needs no change here. Nothing new is added to any capability.
