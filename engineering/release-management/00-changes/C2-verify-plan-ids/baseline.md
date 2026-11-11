# C2 baseline

The baseline states the current state in domain terms.

- Ids are flat: `F1` and `A8` exist in every capability that uses the layout, and two capabilities can hold the same id.
- A link, a Case and a trailer can name an id without saying which capability it belongs to.
- A Case may carry a location next to its identity, and the two can disagree.
- A Case that tests targets sharing no ancestor has no valid place, because the capability is not an id.
- verify Plan accepts a plan whose ids carry no capability.
