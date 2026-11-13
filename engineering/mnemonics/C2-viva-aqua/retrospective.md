# VIVA AQUA mnemonic: 4L retrospective (agent's viewpoint)

## Liked

The SWIPE Change was a complete model: PLAN, one runnable RED Case, DO, ACT, all small. The CPO's review on the PLAN corrected the concept before any definition existed, which was cheaper than correcting it in the DO. A one-file Change stayed one file.

## Learned

The first wording equated validation with judgement where no oracle exists, which made validation the fallback for what testing cannot do. The CPO's distinction is better: Testing serves verification, Review serves validation, and quality assurance needs both. A mnemonic that spans two packages is owned by `engineering`, not by either package. A collector cannot be named `kaal/<owner>/<slug>` while the branch `kaal/<owner>` exists, so the flat name `kaal/engineering-viva-aqua` was used. The first Branching run on a new pull request fails before auto-merge registers; later runs pass.

## Lacked

A rule for who owns a definition that spans two packages, found only through review. A way to run the Case before pushing: this session had no clone, so I ran T2 against the pushed files in a scratch folder. Evidence on whether a mnemonic changes agent quality; this Change adds none and claims none.

## Longed for

A documented owner rule for definitions that span packages. A collector naming rule that does not collide with an existing branch of the same prefix. A way to run a Case from a session that only has the GitHub API.
