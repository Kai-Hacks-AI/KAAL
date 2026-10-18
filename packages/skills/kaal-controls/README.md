# kaal-controls

KAAL Controls: the semantics of controls, and assurance claims calibrated to the evidence. It is not part of Core. Core provides the `KAAL Skill` type and admission, and this capability joins through them.

```
payload/Controls.md            the Skill Node, typed by Core's KAAL Skill
payload/Control.md             the Definition a documented control is typed by
payload/Realized-by.md         the Definition of the Edge from a control to where it is realized
payload/VARISC.md              the Definition of the roles actors hold on an activity
payload/HAPTIC.md              the Definition of the practice of improving controls
skills/kaal-controls/          the Agent Skill: SKILL.md
```

The Node carries what Controls means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Node. It assumes no host and names no particular system.

## What it teaches

A control's objective, type, mechanism, evidence and effectiveness are analytical distinctions, kept apart when reasoning and making claims; they are not a schema every control must fill in. Directive, preventive, detective and corrective are an initial vocabulary of types, not a closed taxonomy. Type is a matter of design and distinct from assurance: an assurance claim is no stronger than the evidence observed, so configured is not operating and operating once is not effective. A scanner detects, and a required gate prevents only the particular action it governs. A preventive claim names the action, the actor or interface, and the enforcement boundary, and never promises that the action is impossible. Independent controls stay independent when a gate combines them.

VARISC names the roles actors hold on an activity: Responsible, Accountable, Consulted, Informed, Verify (deterministic verification) and Sign-off (the Accountable actor's decision). Roles are distinct from structural ownership, which belongs to capabilities, Agents, Skills and Extensions, never to actors.

HAPTIC (Human Agent Program To Improve Controls) is the practice in which an Agent proposes a change to a control and a human decides on it; the owning capability builds the change, and a control counts as improved only when evidence supports the claim. Controls does not run the practice.

## Documenting a specific control

A capability documents one of its controls as a Node typed by `Control`, and points to where it is realized with Edges typed by `Realized by`, written in Graph's Edge form. A `Realized by` Edge is traceability only: it is never evidence that the mechanism operates or that the control is effective.

## Boundaries

Controls is semantic and behavioural only. It keeps no registry or catalogue of controls: documented controls stay with the capabilities that own them. It maps to no compliance framework, assesses no system and enforces nothing. Each capability owns its own control objectives; Controls supplies only the vocabulary and the discipline for claims about them.

## Register the Node

```sh
npx kaal register skill kaal-controls node_modules/kaal-controls/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
