# Core/C52 PLAN: an initialized Engine holds Core's own Capability and Registration Type Definition

Logical Change core/C52, numbering rejudged at integration. It is the separate PLAN that the C50 RED Cases
(`plan/consumer-composition/red-cases.md`, Case core/T115, #970) promised for their one finding. Target: Core 0.0.1,
on the CTO's view; the CPO confirms the scope on this PLAN. No new package, capability, command or registered kind.

## Design this PLAN rests on

By design the package contains no registrations. An installed Core is an instance in a target repo, it uses the Engine
`./.kaal` (default), and it has the capability to register: a consumer's registrations are its own, kept under
`.kaal/registrations/`, which `init` leaves empty. Core never resolves a definition from inside the package; it reads the
Engine. C50 T112 to T114 show this working in a clean consumer.

## The gap

`kaal init` delivers Core's payload into `.kaal/core/` (the foundational Type Definitions `KAAL-Capability.md`,
`KAAL-Definition.md`, `KAAL-Skill.md` and the others, named by `installation.kaal.json`). It does not deliver the
Registration Type Definition (`capability/Registration.md`) nor Core's own Capability Node (`capability/Core.md`). Neither
file is in the package `files` or the Installation Contract. In a clean consumer, Core's built-in schema still judges and
assembles a Registration Node, but the Engine holds no Type Definition named `Core/Registration`, so `verify` reports each
Registration Node `unregistered: no Type Definition named Core/Registration; register one with the Core Capability`. Core's
own tests pass only because they copy both files from the source tree. T115 is that finding, RED.

## Change

1. The package `files` include `capability/`, so the two Nodes ship as they are authored. One source, no second copy under
   `payload/`.
2. The Installation Contract catalogues them with `source` `capability/Core.md` and `capability/Registration.md` and
   `target` `.kaal/core/Core.md` and `.kaal/core/Registration.md`, beside the existing Type Definitions.
3. Lifecycle is unchanged in kind: `upgrade` brings them to the contract, `remove` removes only what the record names and
   keeps what is not Core's, and a consumer's edited copy is treated as any other delivered asset under the existing
   preservation rules (T43 to T48).
4. `test/verify.json` is regenerated with `npm run manifest`; nothing else generated changes.

## What changes for a consumer

- After `init`, Registration Nodes are admitted as their Type: the `unregistered` finding disappears, schema validation is
  unchanged.
- `kaal list` shows Core's own Capability, as it already does when the Node is present. Existing cases that assume a
  freshly initialized Engine lists no capability are named in the RED review before DO, not amended silently.
- No registration is shipped. `.kaal/registrations/` stays empty after `init`.

## Cases

- Approved first: core/T115, already RED in #970. It becomes GREEN with this Change, assertion unchanged.
- To add as RED before DO, in `test/plan/`: (a) `upgrade` on an Engine initialized by an earlier Core restores the two
  files; (b) `remove` deletes them with Core's record and keeps a consumer's registrations; (c) a consumer-edited copy is
  preserved or refused as the contract says for any delivered asset. No existing test is amended.

## Out of scope

Registering any capability's own Registration (their contribution to ship); Foundation's declaration delivery; Hosting's
binding; any Graph behavior. Promotion and npm publication remain Owner decisions.

## Dependencies

#970 (T115 RED Case) lands first or together. The Installation Contract and manifest change in DO touch the same files as
the pin candidate #868, so DO is sequenced after it or rebased onto it.
