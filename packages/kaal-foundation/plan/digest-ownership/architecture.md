# Architecture

- **foundation/A17** [foundation/F28, foundation/F29]: The boundary is a statement in two shipped documents
  (README and skill) plus a check that no export or command reads files to build an identity. Nothing in `lib/`
  changes. The owning capabilities' own Changes adopt `./sha256` through a declared exact-pin dependency, as
  Core, Change and Testing already do; Foundation does not run or judge those adoptions (foundation/N13 of C13).
