# Gate B: which identifiers in the Change folders are Hosting's product contract

Before the ledger is re-derived, every identifier defined in a Change folder is either part of the product docs (`01-intent` to `03-architecture`) or deliberately left out, with the reason. At this head the docs define 120 identifiers; the Change folders define 16 more.

## Promoted into the docs

`hosting/I16`, `hosting/F72`, `hosting/F73`, `hosting/F74`, `hosting/N10`, `hosting/A32`, `hosting/A33`, `hosting/A34`: `list` and `scratch`, as shipped and tested. They are allocated to the publisher in the Package Check's `testing.md` (T129 to T136), so the manifest accounts for each. The only wording that changed is where the code lives.

## Left in the Change folders on purpose

| Identifiers | Where | Why they are not product contract |
| --- | --- | --- |
| `hosting/F16`, `hosting/A7` | `release` | The rename rule and how the rename landed. They govern the repository, not what a consumer installs, and their Cases (T22, T48) run in the publisher suite. A shipped document may not cite them (it may not cite an Engineering path). |
| `hosting/A8`, `hosting/A11` | `release` | Where Hosting's own packed-consumer test lives and how its verifier relates to Testing's. Delivery arrangements, covered by T24 to T31, not an obligation on the installed package. |
| `hosting/F26` | `release` | The statement that Hosting's verifier is an independent implementation of Testing's consumer-verification semantics. It is carried in the shipped docs by `hosting/F20` to `hosting/F25`; its separate form names Testing's own identifiers. |
| `hosting/I13`, `hosting/F56`, `hosting/A22` | `ownership` | Hosting's ownership claim (`ownership.kaal.json`). The claim file does not exist on the collector and its Case (T70) is not in the suite. It belongs to the ownership capability, which the Owner scheduled after Hosting 0.0.1, and it is not part of this release. |

Nothing is promoted or dropped silently. If the Owner or the CPO wants any row above in the product docs, it is a small Change on top of this one.
