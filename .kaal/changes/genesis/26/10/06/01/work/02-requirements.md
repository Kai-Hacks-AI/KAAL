# Enforcing admission: requirements

## E1. The predicate decides

The control runs the repository's own `check-kaal-admission` and relays its verdict as pass or fail, with the reasons the predicate gives. It does not hash anything, evaluate a Change's stage, or restate a rule the predicate owns.

## E2. The two states

The baseline is the `.kaal` of the lineage branch the proposal targets (an empty one if the branch has none). The candidate is the `.kaal` of the proposal as checked out. Nothing else is read.

## E3. Only the lineage is judged

The control applies only to a proposal into a lineage branch. Work staged on any other branch is not an admission and is not asked; that is where the steps of a Change live until it is finished.

## E4. A control that is itself challenged

The control has a test that runs it on a throwaway repository and is run first in the same job: one new closed Change passes, also against an empty baseline; none, two, a new Change at each open stage, and altered or removed closed history fail.

## E5. Boundaries keep travelling alone

A protected boundary changes alone. The one thing that may accompany it is a Change record: the Change directory and the seals of the Change and of its Work. Every other path beside a boundary is still refused, including a Node seal and any other part of the KAAL directory. The isolation test challenges each of these.

## E6. No parallel enforcement

The control asks the predicate and the existing history control (closed Changes stay closed) independently; it does not merge them or create a second place where closure is defined.

## E7. Honest limits

The control, named `contain-change`, makes containment of exactly one new closed Change mechanical, and keeps admitted closed history intact; it does not own admission semantics. It is required only when the owner adds it to the ruleset, by hand, after this lands; until then it reports and does not block. It does not prove a Change describes its diff faithfully, and an automated update that carries no Change is outside it, left for separate treatment.
