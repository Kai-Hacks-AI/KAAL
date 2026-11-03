# kaal-roles: owner-led migration of the Advisor definitions (PLAN)

Capability: Roles. Collector: kaal/roles. Record number is provisional until
integration.

The first Roles PLAN (#867) made `kaal-roles` an incubation home for the CTO
Advisor and CPO Advisor, with Engineering and Product as the eventual semantic
owners and an owner-led migration later. This PLAN is that later step, written
down while Roles waits its turn to promote. Markdown only. No Node, Definition,
claim, package, workflow or policy is created or changed, and nothing here is
authorized or started.

## 1. What migrates

| Definition | Eventual owner | Today |
|---|---|---|
| CTO Advisor | Engineering | `packages/skills/kaal-roles/capability/CTO-Advisor.md` on kaal/roles |
| CPO Advisor | Product | `packages/skills/kaal-roles/capability/CPO-Advisor.md` on kaal/roles |

Migrating means the owner takes the definition into its own Capability, under
its own Node, by its own Change, and `kaal-roles` is then removed. It transfers
text, not authority: a Role's availability grants none.

## 2. Steps

Owner-led, so each step belongs to the capability named.

1. **Owner accepts the text.** Engineering (CTO Advisor) and Product (CPO
   Advisor) each review their definition and amend it in their own PLAN if they
   want it changed. Roles does not edit an owner's definition.
2. **Owner admits it.** The owner's Change adds the definition to its own
   Capability's shipped documents, with its own Node identity. It states its own
   status and drops the "provisional, eventual owner" wording.
3. **References move.** Anything that refers to the Role by path or by the
   `kaal-roles` Capability (the PLAN record, READMEs, a review lens) is pointed
   at the owner's copy. A reference to the Role by name keeps working.
4. **Roles removes its copy.** Only after the owner's Change has landed, a
   Roles Change deletes that definition. When both are gone, the last Roles
   Change removes the package, its workspace entry and its ownership claim.
5. **Order is free.** The two migrations are independent. Each can happen on its
   own owner's timetable, and `kaal-roles` can hold one definition while the
   other has moved.

## 3. What the owners need first

- The owning capability exists on `main` with a place for Role definitions in
  its shipped documents.
- Process's Role concept is on `main` (#560), so the definition can refer to it.
  This is a reference, not a dependency Roles declares.
- The general discovery of Roles through a Capability's documents is future work
  and is not a precondition. A definition is found where its owner ships it.

## 4. Identity and references through the migration

A Definition's Node identity is the id of its exact content. A reference that
must survive is therefore a name, and a name plus id when it must be exact.

- **First move is byte-identical.** The owner's first Change copies the
  definition unchanged, so the Node id does not change. Wording changes (such as
  dropping "provisional") come in the owner's own later Change, and the id then
  changes as it does for any edit.
- **The Change records the mapping.** The owner's Change states the old and new
  location and, where the id changed, the old id and the new id, so a reference
  by name and id can be followed.
- **Nothing resolves by path.** A reference to a Role from a PLAN, README or
  review lens uses its name (and id where exact), not the `kaal-roles` path.
  That is the only way a reference stays valid across the move.

## 5. Does the baseline need to reach `main` first?

The CPO asked for the product tradeoff to be explicit. The facts today:

- The baseline already exists and is referenceable. Both definitions are merged
  on `kaal/roles` and CPO-approved (#867, #876), and the CTO and CPO sessions
  point at them there.
- No consumer on `main` or npm depends on them. `kaal-roles` is private and
  unpublished, `kaal-review` and Process declare no dependency on it, and
  nothing in the repository fetches a Role from `main`.
- Promoting a deliberately temporary package adds product surface on `main`
  (a workspace, a Capability Node, two Definitions) that is then removed again.

A concrete consumer would change that: for example a Capability on `main` whose
shipped documents must name the CTO or CPO Advisor, or a review lens on `main`
that must resolve one before Engineering and Product can host their own copy.
None exists today.

## 6. Decision for Kai

This PLAN is separable from promotion authorization. It describes the transfer
and authorizes nothing, and promotion of `kaal-roles` remains its own decision
with its own PR.

- **A. Promote `kaal-roles` first, migrate later.** The baseline is on `main`
  early. Costs transient product surface and a later removal. Justified only if a
  consumer on `main` needs it before the owners can host their definitions.
- **B. Migrate before `kaal-roles` reaches `main`.** Engineering and Product take
  their definitions into their own collectors and `kaal/roles` is deleted
  unpromoted. No transient surface. The baseline stays referenceable on
  `kaal/roles` until the owners have it.

Recommended: B by default, with A only if a concrete consumer on `main` is
named. This reverses this PLAN's first draft, which recommended A, because the
baseline is already usable on `kaal/roles` and no consumer needs it on `main`.
Either route is Kai's choice, and nothing proceeds until it is made.

## Scope and authorization

This record only. Ordinary PLAN Change: independent review and required checks
precede integration. No synchronization, promotion or publication is authorized.
