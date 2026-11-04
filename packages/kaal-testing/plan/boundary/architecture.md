# PLAN Boundary Integrity: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A10** [testing/N6, testing/F18–testing/F23]: **`kaal-testing/boundary`.** It exports two things:
  - `problems(declaration)`, which says why a declaration does not read;
  - `interpret(declaration, verdict, attestation)`, which returns `{ class, findings, unknowns }`.

  It is pure, imports no host module, and adds no dependency. `testing/C12` writes the invariant, the two realizations and the three kinds of claim into the `Testing` Node after C-T1's text, and tells an Agent in the Skill how to declare a boundary.
- **testing/A11** [testing/F19, testing/F20]: **The two realizations.** The verdict is the seam between them. Neither realization is Testing's.

| | A. Separate PLAN Change | B. PLAN → trusted Seal |
| --- | --- | --- |
| Anchor | the PLAN commit on the protected collector | the Seal id named in the Owner's PLAN review, or a Seal in a collector record |
| Produced by | Engineering's diff of the declared paths, anchor to head | Sealing's `verifyAgainst`, invoked by Engineering |
| Bytes | Git's stored bytes | the bytes the Seal names; working-tree bytes are unknown |
| Mode | compared | unknown until Sealing seals mode |
| Review cost (Guard 0.0.2, 0.0.3) | three PRs before DO per cycle | one PR and one approval |

## Ownership

| Who | Owns |
| --- | --- |
| Each concern owner | its Boundary Declaration and the content it lists |
| Testing | `interpret`: what an attested verdict means as evidence. Never whether a verdict or its attestation is authentic |
| Sealing | computing and verifying Seals |
| Change | the PLAN baseline: which anchor a Change uses, kept in its record |
| Engineering | producing the verdict in DO and CHECK, attesting it as its trust authority, and anything that gates on it |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| C-T1 (#282): planned tests are immutable to DO and CHECK | Testing | none |
| `testing/C11` PLAN, this Change | Testing | none |
| `testing/C12` DO: `kaal-testing/boundary`, the Node and Skill text | Testing | `testing/C11`, C-T1, `testing/C19` |
| `testing/C19` PLAN amendment: attested verdicts, and verdicts that do not read stay unknown | Testing | `testing/C11` |
| Producing verdicts: realization A's diff, realization B's Sealing call | Engineering, Sealing | `testing/C12`, and Sealing's promotion for B |
| Recording the anchor in a Change record | Change | `testing/C12` |

Not touched: `testing/C4` (#385), `testing/C7` to `testing/C10`.
