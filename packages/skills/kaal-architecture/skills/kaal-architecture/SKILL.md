---
name: kaal-architecture
description: Decide how a required capability is made available for use in KAAL, applying URBAN (Use, Rent, Buy, Adapt, New), and hand what must be built to Engineering. Use when a Change needs a capability, representation, protocol, format or mechanism it does not yet have.
license: MIT
---

# Applying URBAN

What Architecture is, and what URBAN means, are stated by the Nodes `Architecture` and `URBAN` in a KAAL Engine: read them there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## Description

Decide how a required capability is made available for use in KAAL, applying URBAN (Use, Rent, Buy, Adapt, New), and hand what must be built to Engineering. Use when a Change needs a capability, representation, protocol, format or mechanism it does not yet have.

## Make the decision

- Name the required capability and the decision it serves before naming any option.
- Look for Use first: what the Engine, the repository and its existing dependencies already make available. Reuse an existing representation before inventing another one.
- Classify each part of the answer as Use, Rent, Buy, Adapt or New. One decision usually combines several; URBAN labels the decision, not the artifact.
- Tell Rent from Buy by whose engine operates the capability, never by price. State the cost profile each one puts on KAAL.
- Say which parts are Adapt or New. A Use that hides authored code is a wrong decision, not a cheaper one.

## Claim absence only with research

A claim that no adequate Rent or Buy exists names the sources checked and how wide the search was. If the claim cannot be supported that way, leave it open and say so. What you already know is not research.

## Hand it over

Record the decision and its grounds in the Change it belongs to. The parts that are Adapt or New are Engineering's to realize; the decision does not realize them.

## Rules

- Do not keep a catalogue, ranking or registry of options. Each decision carries its own grounds.
- Do not apply URBAN as a fixed ladder that ends in New. It is compositional: one decision may combine any of its letters.
