# The pull requests of this Change

What landed, in the order it was merged into `kaal/genesis`, and what each one decided.

| PR | what it carried |
|---|---|
| #28 | Part A1: the derived process (work, seal work, retro, seal Change) and the named-tree identity, `engineering/change-seal` |
| #29 | Part A2: Changing KAAL teaches that process, as Skill content only |
| #31 | `kaal-core` only: Core's private bootstrap sealing, limited to Core's own artifacts |
| #30 | Part B1: the `Sealing` Node and the `kaal-sealing` package and Agent Skill; one identity grammar for files and directories; the sealing audit (`audit.md`) |

This pull request carries the Work seal only. The retro and the closing of the Change follow in their own pull request.

## Decisions made on the way

- Sealing does not decide what an artifact's identity is: each domain chooses the form (file or directory, unnamed or named) and its domain name.
- Core's private sealing covers Core's own artifacts. The birth of Sealing's own Node was an explicit bootstrap exception outside both Core's `sealNode` and Sealing.
- Delivery identifiers of a capability are `kaal-<capability>`; the Node keeps its natural name. Renaming the existing capabilities is a separate, optional pull request.
- `KAAL Change v1`, genesis Change `01`, every Node and every seal are unchanged.
