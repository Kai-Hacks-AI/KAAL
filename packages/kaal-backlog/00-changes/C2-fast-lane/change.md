# C2 change

## PLAN

Decisions the approval of this PLAN does not settle by itself are marked **Question**; the others are the design.

1. **Fast means a direct route, not fewer rules.** A BACKLOG pull request goes to `main` without a collector, PLAN, DO and ACT. It keeps review, the merge queue and every enforcement that `main` has.
2. **The fast lane carries only items.** What it may carry is decided by `qualify(diff, { roots, existing })`, a pure judge of the complete effective diff (F4, F5). Anything that is not a permitted Backlog artifact refuses the whole change. Backlog's own rules never qualify (F6).
3. **The roots are data of the routing, not of the package.** Release declares `roots`; Backlog judges what an item file is. A declaration whose roots cover rule paths is refused (F6). First proof: one root, owned by Backlog alone.
4. **Clean no-ops and collisions.** A diff already contained in the base is `nothing-to-land`, not a failure (F7). Item numbers are unique over the resulting tree, checked at merge against the tip, as for Change Records (F8).
5. **The judge runs from the base.** It reads the proposed head as Git data, never a file of the pull request, with no token and no `pull_request_target` (N2; the rule of verify Triggers).
6. **Five controls** are declared as items (CTL1 to CTL5, status designed): artifact isolation, validity, authority, integration integrity, retrievability. Each names the Cases that provoke it.
7. **Sequence** (assessment, section 3): SYNC the collector; DO of C1; this Change's DO; template; wiring; splicing last and only if proven safe.

### Cases (red, `.red.mjs`)

- backlog/T495: only item files qualify; any other path, deletion, rename, symlink, submodule or mode change refuses the whole (F4).
- backlog/T496: both sides of a rename and tricky paths are judged; no or unreadable diff is UNKNOWN (F5).
- backlog/T497: roots that cover rule paths, or no roots, are refused (F6).
- backlog/T498: an empty effective diff is `nothing-to-land`; same result for any entry order; the module is pure (F7, N2).
- backlog/T499: a second item with an existing number is refused; editing the same item is not a collision (F8).

### Questions for the CPO and Owner

See `assessment.md`, section 9.

### Not in this Change

No `lib`, template, branch kind, ruleset, workflow, WIRE or splicing.
