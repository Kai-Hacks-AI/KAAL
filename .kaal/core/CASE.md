---
name: CASE
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# CASE

CASE is the architecture of kaal-core, not of KAAL generally. It distinguishes four dimensions, each with its own responsibility. CASE defines those responsibilities and boundaries, not how any of them is implemented.

## Core

Core establishes KAAL and its shared semantics. It is the foundation for the other dimensions.

## Agent

Agent provides the instruction wiring that connects KAAL to agents.

## Skills

Skills provides the registration through which KAAL Skills can join without becoming Core.

## Extensions

Extensions provides the registration through which KAAL Extensions can join without becoming Core.

The contract of each dimension is left to its own KAAL Definition, where one exists.
