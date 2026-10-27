# Service Management Model: Architecture

Each element names, in brackets, the Requirements it answers.

- **service/A1** [service/F1–service/F4, service/N1]: **The DO Change adds four Definitions to `capability/` and amends one.**
  - **New:** `Agreement.md`, `composes.md`, `covers.md` and `underpins.md`, each typed by Core's KAAL Definition.
  - **Amended:** `Service-Definition.md` states the `owner` property.

  They ship in Service's existing contribution and package. The README lists them and drops "not defined here".
- **service/A2** [service/F1, service/F3]: **Properties are ordinary frontmatter.** The properties `owner`, `kind` and `parties` are ordinary frontmatter keys. Graph's `identify` keeps them uninterpreted, and Core admits by type alone. Nothing in Core or Graph reads them.
  - **Stop.** If Core's Form refuses a frontmatter key beyond `name`, `type` and `edges`, the DO Change stops and returns. The alternative is an `owned by` Edge to a role Node, which this PLAN does not choose.

## Ownership

| Who | Owns |
| --- | --- |
| Service | `owner`, `composes`, `Agreement`, `covers`, `underpins`, and later the model diagram and its views |
| Graph and Core | unchanged |
| Visual identity (palette, fonts, logo) | not Service. Its home is the Owner's decision 5 below, and S3d binds to it later. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| S1 (#284): `Service`, `provides`, `consumes` | Service | none |
| `service/C1` PLAN, this Change (S3a) | Service | S1 |
| `service/C2` DO: the four Definitions and the `owner` text | Service | `service/C1` |
| S3b: one editable overview SVG whose boxes and edges name these Definitions | Service | `service/C2` |
| S3c: three perspective views from that one source, by a view attribute | Service | S3b |
| S3d: binding style classes to visual identity tokens | Service and visual identity's owner | S3c, decision 5 |
| S2: report-only checks, such as one provider or a declared owner | Service | S1, separately authorized |
