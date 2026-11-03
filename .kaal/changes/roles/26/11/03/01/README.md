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

## 4. Decision for Kai

Roles waits behind Hosting, Foundation and Core, then #328 and #560, to promote.
The definitions are to be taken by their owners anyway. Two routes:

- **A. Promote `kaal-roles` first, migrate later.** The CTO and CPO Advisor
  definitions are on `main` early as the referenceable baseline both sessions
  point at, and are then moved and the package deleted. More churn on `main`;
  the baseline is available from the day Roles promotes.
- **B. Migrate before `kaal-roles` ever reaches `main`.** Engineering and
  Product take their definitions into their own collectors, and `kaal/roles` is
  deleted unpromoted. No transient package on `main`, but the baseline waits for
  two owner Changes and their own promotions.

Recommended: A, since the baseline is wanted now and `kaal-roles` is private and
unpublished, so the churn is contained to the repository. This is Kai's decision;
nothing proceeds on either route until it is given.

## Scope and authorization

This record only. Ordinary PLAN Change: independent review and required checks
precede integration. No synchronization, promotion or publication is authorized.
