# Retro

## Learned

The strongest lesson from this Change was that the admission rule and the machinery that enforces it are themselves separated by a governance boundary. I initially treated the red isolation control as a bootstrap inconvenience; it was instead correctly exposing that we had combined two Changes: KAAL defining what admission means, and the Support Engine changing how this repository enforces that meaning. Once separated, the sequence became clear: KAAL semantics first, Support Engine realization second, each with its own Change number and sealed evidence. I also learned that optimistic Change allocation composes naturally with admission: concurrent staged Changes may choose the same next number, because admitted lineage—not staging—is the serialization point.

## Liked

The final KAAL-side rule is small and legible. Admission is derived from existing Change closure, identity and sealed-history machinery rather than introducing another lifecycle or registry: exactly one new Change, closed, with previously admitted closed history intact. I liked that the repeated review corrections made the boundary sharper without making the predicate larger. The decision to let staging race, and to resolve address collisions before sealing/admission, preserves that same simplicity. Most importantly, the isolation control did useful architectural work: instead of being bypassed when inconvenient, its refusal caused us to discover the missing Support Engine Change.

## Lacked

The Change reached closure more than once before its boundary had actually converged. That tells me our review process still occurs too late relative to sealing: content can be internally coherent while the Change itself is packaged at the wrong architectural boundary. The first implementation also mixed KAAL-native semantics, host enforcement and isolation-control changes, despite the design already insisting that host concepts remain outside KAAL. I also lacked an explicit early question of “what independently governed thing is changing?” Had we asked that before implementation, the two-Change sequence would likely have been visible before the isolation check became red.

## Longed

For review to become an explicit step before retrospective closure, with the Reviewer examining not only whether the implementation satisfies requirements but whether the Change boundary itself is correct. I want protected boundaries to continue acting as architectural signals rather than obstacles to route around, and for a refused boundary crossing to naturally produce a separate governed Change when that is what the system is telling us. I also want the Support Engine follow-up to demonstrate the sequence this Change now defines: refresh against admitted KAAL, allocate its own next free Change number, consume the already-landed admission semantics, close independently, and only then alter the machinery that enforces them.
