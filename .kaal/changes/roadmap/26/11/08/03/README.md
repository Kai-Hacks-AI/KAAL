# Model the Graph rename as a Project (provisional number 26/11/08/03)

Capability: Roadmap (`kaal-roadmap`, not yet implemented). Collector: `kaal/roadmap`. Exercise B of the [Roadmap PLAN](../01/README.md) (#1258): the Project capability does not exist yet, so a Project is modelled as plain Markdown under `strategy/kaal/`, as Exercise A did for the Roadmap ([02](../02/README.md)).

## What this Change adds

Only files under `strategy/kaal/` and this record: one Project (`projects/graph-rename-path-bridge.md`), one Decision (`decisions/2026-11-08-graph-rename-path-bridge.md`, Owner's choice A from the project chat), and two index lines in the strategy README.

## What it does not do

It does not run, order or change the Graph work; the Graph, Core and Engineering threads own their Changes. It does not edit the Roadmap (item 1.4 stays "rename path and version to be declared"). No script, package, workflow, gate or contract change. No derived state: PR numbers appear only as identity of a Change, never as status; each step states the check that proves it. Nothing authorizes promotion, a version, or publication of Graph.

## What the exercise showed

- A Project fits as Declared content: intent, ordered steps, per-step check, prerequisites versus mere order, relations to the Roadmap item it serves. The Decision carries the judgment.
- A step can be several Changes by different owners (Core and Review); the Project names them but needs no owner of its own beyond KAAL.
- The same number can mean different Changes over time: #1242 is Core's PLAN for the flip, not the flip itself. Identity by title and location survives; a bare PR number does not. The Project therefore names the Change id (`core/C54`) first.
- Status ("is step 1 done?") is not stored and is answered on demand from the checks. That is the intended boundary, and it made the Project read the same on the day it was written and later.
- Open for the Project capability, not decided here: whether a Project carries its own sequence or points at a Roadmap; whether a step is a Node or a list item.

## Verified by

Required checks on the PR. All relative links in `strategy/kaal/` resolve (checked locally).

## Validated by

CPO review of product meaning (Exercise B). Exercise A criteria 2 to 5 remain open and are not exercised here.
