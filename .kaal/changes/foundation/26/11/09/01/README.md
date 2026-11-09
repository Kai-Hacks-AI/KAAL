# Foundation 0.0.2: the Boundary Check (PLAN, re-cut into the final layout)

Capability owner: Foundation. Logical Change foundation/C13 (PLAN) re-cut for the final package layout; its DO is
foundation/C14. Numbers are provisional until the collector integrates them. It replaces #747, which planned the
same Change in the flat layout.

PLAN. The Owner decided on 2026-11-09 that Foundation 0.0.2 ships its Boundary Check, because Foundation is becoming
the reference package and must do better than Hosting 0.0.1, whose Boundary Check is declared "not applicable". The
earlier guidance that kept C14 off the 0.0.2 critical path is superseded by that decision.

The four PLAN documents move to `00-changes/boundary/` with paths restated for the layout. Changes beyond the move:
- foundation/F23 step 3 now runs the resolved copy's own `verify` through the path that copy's `package.json` names
  under `bin`, because a consumer may hold Foundation 0.0.1 (`bin/`) or 0.0.2 (`dist/skills/...`).
- New foundation/F25 and Cases T52 and T53: Foundation's own Boundary Check record, with both axes (package -> consumer
  through `check` and `boundary`, package <--> package through Hosting's `kaal-hosting-boundary` scan).
- The RED Case file moves to `04-test/engineering-check/plan/boundary.test.mjs` and reads the generated `dist/`.
  Eight of the nine Cases are RED (`unknown command check`/`boundary`, no Boundary Check record). T53 is a control and
  is GREEN today (Hosting's scan of `dist/`: complete, 8 sources, no findings).

No promotion, version bump on main, SYNC or npm publication is authorized by this record.
