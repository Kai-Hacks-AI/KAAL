# Retro

## Learned

Separating Retro from Changing KAAL exposed a useful capability boundary: the process decides when and whose retrospective is owed, while Retro owns only what a retrospective is and how its canonical form is created and checked. This Change also demonstrated why the current Work-seal boundary matters: once Work and the Worker retrospective exist, an architectural observation from outside is retrospective evidence for later Work, not permission to revise the sealed Work.

## Liked

The capability is genuinely reusable rather than a Change helper. Its Node is semantic and host-neutral; its realization knows no Change seat, Git or GitHub; the repository can register and install it through the same capability pattern already used elsewhere; and existing retrospectives remain valid without migration. I also liked that the Worker restored the exact sealed candidate after the mistaken instruction rather than allowing an accidental process change to remain hidden in the branch.

## Lacked

The representation currently forbids a retrospective part from containing a line beginning with `#`. That restriction is not retrospective semantics; it exists to keep the current Markdown parser unambiguous. Legitimate retrospective content may need to quote or discuss headings. Because R3 explicitly requires this restriction and the Work is sealed, it is not a defect against this Change's Intent/Requirements, but it is a limitation of the capability as born.

The current process also lacks Review before Work sealing. That made this architectural finding arrive after the point where the Worker could act on it. ROWING is intended to correct that process shape; it should not be applied retroactively to this Change.

## Longed

For a subsequent Retro Change to make the four observations arbitrary non-empty text while preserving deterministic canonical creation and validation, without leaking serialization convenience into content rules. The discarded experiment on this branch is useful evidence, but the next Change should choose the representation deliberately rather than inherit it automatically.

I also long for ROWING to land so architectural findings are made while Work is still open: Worker and Reviewer can iterate before sealing, while the Owner continues to steer from outside.

**Observer conclusion:** the sealed Work realizes its stated Intent and Requirements and is coherent as the birth of the Retro capability. The heading-content limitation is future Work, not a blocker for this sealed Change.
