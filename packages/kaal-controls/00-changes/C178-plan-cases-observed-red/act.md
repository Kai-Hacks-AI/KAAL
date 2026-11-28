# C178 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It closes C178 in the collector. What `main` teaches can only be recorded after the promotion, and is not claimed here.

## Liked

The lane reuses testing's runner and comparison and adds only a judge of about twenty lines, so the PLAN's observed-RED rule has one implementation and testing stays the producer of the observation. The CPO's hold (an entry must name a real open PLAN and one of its Cases) became two small pure pieces, `changesOf` and the three findings, each with a negative Case. Six mutations were each caught.

## Learned

The first design tied an entry only to a Change id and an ACT marker; an unrelated failing Case could have been registered against any open Change. Binding the entry to the Case through the chain Case, Requirement, Intent, Change closed that. The bootstrap looked like it needed a bypass: a PLAN cannot be green in the lane before the lane that reads a register exists. Putting the approved PLAN and its DO in one pull request, with the red-to-green evidence taken against the base, needed none. The old T1729 forbade every dev dependency; a Case that guards a stopgap has to be amended when the stopgap grows, and the amendment was narrow (exactly one named dev dependency).

## Lacked

The lane is only in the controls package. The engineering Cases runner still fails a red Case, so any PLAN there meets the same wall; testing offered `run --expect --strict` for a second consumer, which would replace this judge. The register has no check that its entries are removed when the DO lands other than the lane's own `green` finding, which fires only after the Case passes.

## Longed For

One shared judge for every package lane, owned by testing, so a PLAN's red Cases are handled the same way everywhere (planned only when a second consumer asks).

## Closed

The Gap of this Change, a PLAN pull request failing the required lane for its intended RED Cases, is closed by T1734, T1735 and T1736, green in the collector, with the package test now the lane. The register is empty. No ruleset, required check, WIRE or publish is made or implied.

## Sentence

A Red That Is Named Is Not A Red That Is Hidden.
