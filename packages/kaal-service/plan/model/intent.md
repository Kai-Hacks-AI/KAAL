# Service Management Model: Intent

This is `service/C1`, a PLAN Change for S3a. It ships no Definition and no code. `service/C2` turns its planned tests GREEN. It builds on S1 (#284), which defines `Service`, `provides` and `consumes`.

The Owner authorized S3 research on 2026-10-22 and asked on 2026-10-27 that the work move into PRs. The research reconciled four things:
- Service identity;
- the Service Owner role, as distinct from provider accountability;
- composed internal and external Services;
- SLA, OLA and UC agreement boundaries.

**The model is generic.** It learns from a real Service Management model, but no organization, tool realization, narrative or reference from that source enters KAAL. The Owner's earlier rulings stand:
- OLAs are internal supporting agreements, and UCs are contracts with external suppliers;
- no simplistic internal or external flag decides which is which.

- **service/I1.** A Service's owner is an organizational role, accountable for the Service's lifecycle and value. It is never conflated with the Capability that `provides` the Service, and neither is inferred from the other.
  - S3a promises a **declared role label** only. KAAL records which role the Service names; it does not identify, resolve or check that role.
  - A resolvable organizational role needs its own representation and acceptance, in a later, separately authorized Change. Nothing in S3a implies it.
- **service/I2.** A Service may rest on supporting Services. Whether a supporting Service is internal or external is context, not a type.
- **service/I3.** An Agreement is explicit:
  - its kind (SLA, OLA or UC) is declared from its parties and its nature, never derived;
  - it names what it covers, and an OLA or UC names the SLA it underpins.

The drawing (S3b), its perspective views (S3c) and the binding to visual identity (S3d) are later Changes.
