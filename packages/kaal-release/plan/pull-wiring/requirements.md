# Pull Promotion wiring: Requirements (target)

Scoped `pull/` (ids are global). It wires `pull/C1`; the Script's own requirements are `pull/F1` to `pull/F13` and `pull/N1` to `pull/N3`.

- **pull/F14. The connected path.** In the consumer's Delivery (for KAAL, `engineering/release-management/05-src/pull-promotion/`), `run.mjs <repo> <declaration file> <collector>` reuses Analyze Flow's supplier for the facts (`coordination/F14`), adds only the three optional facts of `pull/F3`, runs the Analyze Flow Script, passes its data to `pull-promotion.mjs` and prints the verdict. It is read-only. It is complete only when it runs on a real collector (T14); the recorded Cases of `pull/C1` prove the judgment, not the host. The KAAL declaration (`declaration.json`: owners, closing piece, increments with their `after`, check owners, holds) is reviewed like any other PR.
