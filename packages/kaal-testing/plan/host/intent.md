# Applicability by Host Fact: Intent

This is `testing/C39`, a PLAN Change. It ships no code. `testing/C40` turns its planned tests GREEN.

**What the Owner set.**
- On #668 (comment 6535329511), Hosting is the only capability where OS-specific behaviour is acceptable, in solutions and in tests. A platform-scoped not-applicable outside Hosting is an architectural violation, never an exemption (testing/F67).
- Approving `hosting/C16` on #674 (review 5719713646), including its Option C: "capabilities declare required host facts, Hosting establishes them and supplies fixtures, portability conformance and review guidance. Testing owns verification semantics; Review independently owns validation of exceptions."

**What exists.**
- testing/F47 (`testing/C29`) admits three ways a case can be not applicable, each established by the harness, never asserted by the case: a platform scope, an optional complement needed, and an optional complement excluded.
- Some cases genuinely need a capability of the host that is not a platform. guard/T114 needs a FIFO and a Unix-domain socket placed in a directory tree, and no fixture Node can run places one there on Windows. Under testing/F67, Guard cannot declare a platform scope. Under testing/F47, the case cannot skip itself.
- `hosting/C16` (#674) defines host facts (hosting/F37), named without any platform and established by Hosting's `facts()` by trying each one on the running host. It also defines the rules for declaring them (hosting/F39) and the audit that puts each declaration to Review (hosting/F40).

- **testing/I18**: A case that needs a host fact is not applicable exactly where the harness established that fact not holding, through Hosting, with a reason and evidence. It stays visible, it is never counted as passed, and where the fact holds it runs with its assertions intact. Testing owns only how such a declaration is verified and counted. Hosting owns the facts, and Review owns whether each exception is genuine.
