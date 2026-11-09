# Architecture tree: Intent

foundation/C21 is this PLAN. It ships no code. Its DO turns the planned cases GREEN. It authorizes no synchronization, promotion, version change or npm publication: those stay with the Owner.

On 2026-11-09 the Owner set the standard for where tests live and what ships (Kai, Foundation thread). Getting the standard right takes priority over any date.

- Every test case sits next to what motivated it: Intent, Requirements, Architecture or Defects. That includes the boundary test.
- The `04-test/` folders only collect Cases into suites, by reference. They never hold or reimplement a Case.
- Functional placement is decided in Architecture, where something is either Solution scope (what we deliver) or Delivery scope (how we deliver it). Architecture is organised as a tree so that the choice is "either/or". With that done right, it is clear which Cases a suite pulls.
- Suite membership is a backwards analysis (Kai): each Case points, in the `tests` edge of its own YAML front matter, at the Intent, Requirement, Defect or Architecture element it verifies, and a suite is built by asking "who points at this?". No suite holds a hand-kept list.
- Cross-cutting shows only higher up. The chain is Intent <- Requirements <- Architecture, and Architecture elements are leaves that are strictly Solution or Delivery. A Defect hangs off an Architecture element as well (Intent <- Requirements <- Architecture <- Defects), so it takes that element's branch. A cross-cutting thing is therefore an Intent or a Requirement that leaves in both branches answer. Those are looked at on their own, not placed by guess.

- **foundation/I15.** **Architecture decides whether a thing is Solution or Delivery, and everything else follows from it.** Solution is what ships in the package. Delivery is how it is built, packed, published and accepted, and never ships. A Case belongs to the branch of the Architecture it verifies; a suite pulls Cases by branch; the build ships the Solution branch only.

- **foundation/I16.** **Foundation complies with kaal-packaging.** The Packaging Requirements apply to every package, so how Foundation is built, packed, published and accepted is Packaging's rule, not a Foundation invention. Foundation's own Delivery Cases (installed `npm test` verifies, tamper detection, pack keeps the bytes) trace to this Intent, and the generic Requirements behind them (cited as F17 and N10 but defined nowhere) belong to kaal-packaging. Until Packaging lands on main, Engineering holds them as a workaround. We are soft-trying the capabilities (intent, requirements, architecture, coding, running, testing), so a thing may turn out to need a different home later, and that is fine (Owner, 2026-11-09).

**What this PLAN does not decide.** It does not move a Case, rewrite an Architecture element or change what ships in 0.0.2: that is the DO. It does not change Foundation's layering wording (Hosting is the bottom); that is its own Change and lands as a one-line edit under the Solution branch.
