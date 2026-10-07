# Requirements

Scope: an agent working a Change in a KAAL where `kaal-changing` is installed, whether or not that KAAL sits in this repository. Change `genesis/26/10/07/04` made the answer correct and role-aware here; this Change is about where the answer lives.

1. **Self-contained.** With only the installed KAAL and its installed Skills, an agent following `kaal-changing` can ask where a Change is, whose act is next and what it is, and be answered. Nothing in the repository's `engineering/` or root `package.json` is needed.
2. **The same answer.** Installed or in this repository, the same artifacts and seals give the same stage, next act, role, problems and exit code, and the same identity of `work/`. There is one definition of the process order; two copies that can drift do not count.
3. **One identity.** Whatever answers does not introduce a second definition of Change or Work identity. It uses the one `kaal-sealing` establishes and verifies.
4. **Derived, never written.** The answer comes from artifacts and seals alone. Nothing is written to say a phase was reached, and the compass never writes, seals, repairs or closes.
5. **No host.** It knows nothing of Git, GitHub, branches, PRs, CI or accounts.
6. **Core does not grow.** No machinery enters `kaal-core`, and no new Node is needed to deliver it.
7. **Delivered as `kaal-changing`.** It arrives wherever `kaal-changing` is installed, through the existing installer, and the Skill points at it instead of at repository commands.
8. **Owner's act stays the Owner's.** As in 07/04: where the Owner's judgment is next, it says so and never supplies the text.

## Not decided

How the compass reaches `kaal-changing` without breaking these:

- The evaluator needs Change identity (tree hashing), which `kaal-sealing` owns, while `kaal-changing` is a separate package; does a delivered script depend on `kaal-sealing` being installed, carry its own byte-identical copy of the identity code, or reach it some third way?
- Whether the repository's `state-kaal-change` becomes a thin caller of the delivered one, so requirement 2 holds by construction.
- Whether the evaluator moves out of `engineering/change-seal` at all, or the Skill ships a script that wraps it.

These are raised on the PR for the Owner, not settled in the Requirements.
