# A Control has its Intent: Intent

This is `controls/C6`, a PLAN Change. It ships no Node, code or test. `controls/C7` realizes it.

The Owner has aligned what a Control is (#585): a bounded, enduring concern with an Intent, Requirements, Architecture, Tests and Code. It is comparable to a Change, but differs in purpose. A Change delivers an Intent once and is done. A Control has an Intent for as long as the concern lasts. The capability that owns the source of an outgoing trace owns its meaning, so Controls owns `Control —has→ Intent`.

Controls defines `Control` and `Realized by`, but no Edge from a Control to its Intent. A Control can say how it is realized and not why it exists. Engineering's first Control instances (engineering/C3) need that Edge before they can be written.

- **controls/I3**: Controls states, as an Edge Definition, that a Control has an Intent: the enduring reason the concern exists, which its Requirements answer. Controls owns what the Edge means from the Control's side. The Intent keeps its own meaning, Graph keeps the mechanics, and nothing about the Intent's kind, its capture or its authorization moves to Controls.
