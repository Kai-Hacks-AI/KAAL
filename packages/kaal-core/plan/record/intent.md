# Installation Record and Cross-Installer Interoperability: Intent

This is `core/C10`, a PLAN Change. `core/C3` promised that any installer that realizes a Capability's Installation Contract, whether the Capability's own standalone lifecycle or Core, leaves a repository that the other can upgrade and remove (`core/I3`). `core/C4` realized the contract format and Agent Realization, but left two things open, as the Owner recorded on #357: the shape of the ownership record that both installers read and write, and the proof that a Core realization can be upgraded and removed by the Capability's own lifecycle (`core/F19`). This Change plans both. It ships no code. `core/C13` turns the planned tests GREEN.

Writing files into a repository is Hosting's, not Core's (`core/N4`, `core/A7`). Hosting's guarded file reconciliation is planned separately as `hosting/C1`, and `core/C13` applies Core's plans through it.

This Change adds no Intent. It serves `core/I3` (installer-neutral contracts) and `core/I5` (installation never takes what is not its own), and it makes them checkable.
