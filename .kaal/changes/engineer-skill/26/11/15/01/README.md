# Plan installed verification for kaal-engineer-skill

Capability: Engineer Skill. Proposed engineer-skill/C3, a PLAN.
Base: main 888ce0f.

Plan the first release-completion increment: an installed `npm test` that verifies the
shipped files against a manifest (verified, failed, unknown), the source suite moved to
`test:publisher`. Reuses Foundation's verifier shape. No code, no rename, no dependency,
version, sync, promotion or npm publication. Cases T370-T373 run RED.
