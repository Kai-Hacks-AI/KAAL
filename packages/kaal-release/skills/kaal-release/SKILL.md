---
name: kaal-release
description: Design and drive an end-to-end release process for any target, such as a protected branch, a package registry or a deployment. Use when preparing, deciding, promoting, publishing, verifying or recovering a release, or when designing how a repository releases.
license: MIT
compatibility: Reading only. Needs a repository whose release decisions are recorded, or an Owner who can state them.
---

# Releasing

Use this to design or drive a release. It names the decisions a release needs and the order they come in. It does not make them for you: a repository owns its decisions, and this Skill never imports another repository's. What Release means is stated by the Skill Node `Release` where the repository has a KAAL Engine.

## Read the record first

Before any step, read the repository's own record of its release decisions: a KAAL Engine's Nodes, `AGENTS.md`, or the documents they point to. If a step has a recorded decision, follow it. If it has none, ask the Owner. Do not choose for the repository, and do not copy a decision from another repository because it looks similar.

If the repository is KAAL's own, its release decisions are in `engineering/release-management/`. Read them there.

## The loop

Each step is a decision a repository owns, with the options such decisions usually take. Take the steps in order.

### 1. Assess the context

Decide what is released, to whom, from where to where, what a failure costs, and who can decide.
Options: one release unit or several; a release that can be reversed or one that cannot; an audience of one team or of the public.

### 2. Choose the identity of the release

Decide the version or equivalent name that identifies exactly this release. Use Semantic Versioning 2.0.0 where versions apply.
Options: a version number; a date; a build identifier; a name per target.

### 3. Establish readiness

Decide what evidence shows that the candidate meets its acceptance, and that the name is unused. Require verification evidence, which is deterministic and comes from testing, and a validation of the result, which is a judgment and comes from review.
Options: which evidence, how recent, and for which exact artifact.
To ask which collectors have fulfilled their PDCA, `scripts/pull-promotion.mjs` takes facts about each collector's file state (its delta against main, its tree, its history, the executions of its Test Cases at the exact head) and the repository's declaration. It walks the declared collectors in their declared order and says for each whether its delta is not empty, PLAN and DO files are in its head tree (whether or not they differ from main), every expected Test Case is green at its head, and exactly one 4L retrospective concludes the collected work, ordered by the history and not by time. A declared collector may carry a `scope` (path patterns): its PLAN, DO, expected Cases and ACT are then read only inside the scope, so evidence inherited from `main` for another capability never qualifies it; the ACT patterns may be several, and `act.history` names the Change-history retrospectives, which are never counted: the one concluding collector-level ACT is a separate file. It lists the qualifiers in the declared order and names the first. It reads files only, treats missing evidence as not judged, and authorizes or recommends nothing.

### 4. Choose the controls and the authority

Decide how many independent controls the release needs, who approves, and how author and approver are kept apart. Name the role that provides each control and what you require from it and when. The provider and its rules belong to the repository.
Options: one approver or several; automatic approval or a person; the same control for every release or a stricter one for a release that cannot be reversed.

### 5. Preserve the identity of the artifact

Build once, move that same artifact to every target, and never rebuild between the verification and the release.
Options: where the artifact is kept between steps and how its identity is recorded.

### 6. Promote or publish

Decide through which identity the artifact moves, so that the movement can be audited, with provenance where the target supports it.
Options: a person, an automation identity, or a delegated identity; provenance supplied by the target or recorded by the repository.

### 7. Verify what arrived

Decide how you observe, as a consumer of the target would, that what arrived is what was released, and who validates the observation.
Options: install and run, compare identities, or read the target's own record.

### 8. Announce

Decide what tells consumers what changed: release notes, a changelog, a tag.
Options: one or several of these, and who writes them.

### 9. Recover

Decide what happens when a release turns out wrong: mark it as not to be used, release a fix, or withdraw it only where the target permits.
Options: the recovery per kind of failure, and the earliest step at which the failure could have been found.

## Delegated roles

Release drives the loop and decides whether progression is allowed given the verification and the validation it requires. It does not own the roles it asks of others:

- implementation of the change belongs to Change;
- protecting what must remain true belongs to Guard;
- verification, the deterministic evidence, belongs to Testing;
- validation, the judgment of the result, belongs to Review;
- execution of the steps belongs to the repository's own automation.

Name the role and say what the process requires from it and when. For example, ask for evidence that change isolation holds before promotion, and a validation of the result. State that the provider and its rules are the repository's.

## Designing the process

When designing a release process rather than driving one:

- give every control exactly one authoritative owner;
- compose the controls under one orchestration layer;
- keep distinct contexts of execution for distinct kinds of work;
- before retiring a control, show that its replacement covers what it covered.

## Worked examples

- [A package published to a public registry](references/npm.md) applies the loop to one registry, as an example.

## Seeing the work in progress

When several pieces of release work are open, run the read-only Script [scripts/show-wip.mjs](scripts/show-wip.mjs) on two files: the facts the repository's host reports about its open pieces, and a config that maps where a piece comes from and goes into onto stations. It prints one line per piece with its type and its expected next move, WORK, REVIEW or WAIT, and says UNKNOWN where the host did not report a fact. It also lists the pieces that wait for a reviewer in a reading order, each clean, not clean or unknown for review at that moment, with the exact head it read. It observes only: the decision to proceed stays with the roles above.

## What this Skill does not do

It does not verify anyone's release and it authorizes nothing. It states the decisions to take and the order to take them in.
