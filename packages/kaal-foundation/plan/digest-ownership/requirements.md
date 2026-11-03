# Requirements (foundation/I12)

- **foundation/F28** [foundation/I12]: **Foundation's documents state the boundary.** The README and the skill
  say that Foundation supplies the digest of given bytes only, and that the meaning of any identity built on it
  (what bytes, their order, domain separation, what a Seal binds) belongs to the consuming capability. They name
  no consumer.
- **foundation/F29** [foundation/I12, foundation/I3]: **No identity helper.** Foundation adds no function,
  command or export that reads a file or directory, orders entries, or builds a stream to hash. Its commands
  stay `sha256`, `verify` and, if C14 lands, `check` and `boundary`, each over bytes or lines the caller supplies.
- **foundation/N17** [foundation/I12, foundation/N2]: **No new reach.** The boundary adds no dependency and
  changes no digest (foundation/I2, foundation/N9). It touches no shipped byte until its DO, which is held behind
  Foundation 0.0.2.
