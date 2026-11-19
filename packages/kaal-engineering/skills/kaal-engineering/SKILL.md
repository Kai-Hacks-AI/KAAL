---
name: kaal-engineering
description: Explain KAAL's own engineering setup, meaning how one source passes through packages/, engineering/, npmjs and .kaal/, which folders are installed copies (.agents, .claude, .github, .githooks), and what counts as waste. Use when a folder looks like a copy of another and you need its role, or when you decide what is waste.
license: MIT
---

# KAAL engineering setup

This is KAAL's own setup, written in KAAL's own terms. It is private and not expected to live outside KAAL. It explains the setup and nothing a capability owns: it names a concept once and points to the owner.

## One source, four stages

A capability has one source, and it passes through four stages:

- `packages/<cap>` is where the capability is developed.
- `engineering/<cap>` uses the unpublished version N+1. It is optional: a capability that uses only `.kaal` needs no folder here.
- npmjs publishes version N.
- `.kaal/<cap>` uses the published N.

## Deliveries

`.agents`, `.claude`, `.github` and `.githooks` are deliveries: installed copies of an approved stage, placed by WIRE (see kaal-release).

## What is waste

A stage copy and a delivery are not waste. Each has a role, and the role is why it looks like a duplicate. Waste is a copy that no stage or delivery role explains, or a delivery that has drifted from its approved source.

## Two legs, two paces

- Package to engineering is the ratchet, which this capability owns: waste goes down and clean goes up.
- Engineering or `.kaal` to the skill location is a manual WIRE (see kaal-release), with the same mechanics from either source. Taking from engineering takes a pre-npmjs version; taking from `.kaal` takes the published one.

The two legs move at different pace.

## Lean 5S

- **Sort**: keep only the copies a stage or a delivery role explains.
- **Set in order**: each stage and each delivery has one place, named above.
- **Shine**: remove drift, so a delivery equals its approved source.
- **Standardize**: the same mechanics from either source.
- **Sustain**: the ratchet keeps waste from rising and clean from falling.
