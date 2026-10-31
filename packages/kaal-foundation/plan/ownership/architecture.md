# Foundation's ownership claim: Architecture

Each element names, in brackets, the Requirements it answers.

- **foundation/A11** [foundation/F20, foundation/F21, foundation/N11]: **Layout.** Two files are added, and neither ships.

  | Path | Role | Ships |
  | --- | --- | --- |
  | `capability/Foundation.md` | Foundation's Capability Node | no |
  | `ownership.kaal.json` | the claim on `packages/kaal-foundation/` | no |

  Foundation's own SHA-256 computes the claim's `id`, so the claim needs no other package.

- **foundation/A12** [foundation/N12]: **Shared root files.** A claim attributes only within the folder that holds it (Testing's attribution reads its scope that way). So no package's claim can reach `package.json` or `package-lock.json` at the repository root. Only an ownership file at the root can, and its owner is not Foundation's to name. Core is in the same position: its claim is `packages/kaal-core/` alone (core/T40).

  Recommendation, for the Owner and Engineering: Engineering claims exactly those two files, by an ownership file at the root in the same JSON format. A Change that adds or bumps a dependency changes them on its own behalf, and the traceability check reads that root claim like any other. #609 §6 asks whether a claim beyond the claimer's own folder should become Markdown. A root claim naming two exact files negotiates nothing in the file itself, so it stays JSON.
