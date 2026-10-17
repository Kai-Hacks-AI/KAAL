# kaal-controls

KAAL Controls: the semantics of controls, and assurance claims calibrated to the evidence. It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Controls.md            the Skill Node, typed by Core's KAAL Skill
skills/kaal-controls/          the Agent Skill: SKILL.md
```

The Node carries what Controls means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Node. It assumes no host and names no particular system.

## What it teaches

A control's objective, type, mechanism, evidence and effectiveness are analytical distinctions, kept apart when reasoning and making claims; they are not a schema every control must fill in. Directive, preventive, detective and corrective are an initial vocabulary of types, not a closed taxonomy. Type is a matter of design and distinct from assurance: an assurance claim is no stronger than the evidence observed, so configured is not operating and operating once is not effective. A scanner detects, and a required gate prevents only the particular action it governs. A preventive claim names the action, the actor or interface, and the enforcement boundary, and never promises that the action is impossible.

## Boundaries

Controls is semantic and behavioural only. It keeps no registry or catalogue of controls, maps to no compliance framework, assesses no system and enforces nothing. Each capability owns its own control objectives; Controls supplies only the vocabulary and the discipline for claims about them.

## Register the Node

```sh
npx kaal register skill kaal-controls node_modules/kaal-controls/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
