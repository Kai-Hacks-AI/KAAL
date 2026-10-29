---
name: kaal-retro
description: Run a short retrospective on completed work in KAAL (WORK), with 4L as the default prompts, and keep what it yields where a later Plan can find it. Use when a Change or capability increment is complete and its Act may keep what it taught, or when a Plan looks for what earlier work taught. Never on work still under review.
license: MIT
---

# Retro in KAAL

What a retrospective is in KAAL is stated by the Node `WORK`, and the cycle it serves by the Node `PDCA`, in a KAAL Engine: read them there, starting from the Engine's `AGENTS.md`. This file only tells you how to run one, and how a later Plan finds what it yielded.

## When

- Only on completed work: a Change that has been accepted, or a capability increment that has been promoted. Work still under review belongs to review.
- Only when it is worth it. Nothing requires a retro. Size it to the work: a line or nothing for a small Change, one short retro for an increment.
- Do not open a Change or pull request just to hold a retro.

## Who

Gather the views of the Worker, the Owner and the Reviewer. If one of them is absent, say so. Never write someone's view for them.

## Prompts

4L is the default:

- **Liked**: what worked and is worth keeping.
- **Learned**: what is understood now that was not before.
- **Lacked**: what was missing. A defect in a planned test is not a retro entry: it goes through Testing to Act and a new Plan.
- **Longed**: what was wished for. It stays an observation unless someone raises a Change.

Other prompts may fit the work better. Use them and say which you used.

## Each entry

- **Classification**: observation, candidate lesson, or adopted lesson. A lesson is adopted only once the capability it concerns has accepted it through a Change; a retro itself never adopts anything.
- **Provenance**: who said it, when, and a link or path to the Change, pull requests, test and defect identifiers, runs and reviews it draws on.
- **Standing**: an observation stands as an observation and a candidate lesson as a candidate, never as a rule.

## Where it goes

Write the retro in a source the consuming repository declares for it:

- by default, the pull request that realized the completed work: the Change's own pull request, or for a capability increment the promotion pull request, where the planned outer tests' evidence and the promotion evidence meet;
- or a record the repository itself owns and declares for retros, such as one under its own record root, with the same classification and provenance. Learning neither requires nor keeps such a record.

Add no central store, index or registry, and open no Change or pull request just to hold a retro.

An entry is retrievable only from the source that holds it, and only while that source is available. A pull request conversation lives on its Git host and is not KAAL content in the repository: a consumer without that host retrieves only adopted lessons and any record it declared. Never claim that a retro is more durable or retrievable than its source.

## In a later Plan

- Retrieve from the sources the repository declares as available: its own adopted texts and declared records, and the pull requests of the capability's earlier completed work where the Git host is available.
- Cite every entry you use by its link or path, with its classification and provenance, and say what in the plan exists because of it.
- Where a source you would need is not available, say so, and never presume what it held.
- Adopting a lesson changes the text of the capability it concerns through the Plan's own Change, under that Change's normal authorization. Keep the earlier text beside the new one; never silently rewrite it.

## Rules

- Create no rule, backlog item or Change from a retro, and decide nothing in one.
- Never approve, merge or block anything because of a retro.
