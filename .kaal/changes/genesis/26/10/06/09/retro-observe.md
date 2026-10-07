# Retro

## Learned

The Extension path is now concrete end to end. Core's admitted Extension Node supplies the semantic type; the kaal-github package carries a sealed GitHub Node that refers to that exact Extension by name and ID; the installer registers that contribution unchanged into the installed KAAL. Package delivery, semantic typing and installed state therefore remain separate concerns while forming one traceable graph.

Moving the old controls also confirmed the intended dependency direction. Git and repository concerns can live in the Extension, while Change, admission and seal meaning stay behind KAAL's own process boundary. The host gathers the baseline and candidate and asks; KAAL answers.

## Liked

The abandoned #53 work was reusable without preserving its wrong architecture. The useful TypeScript/Git mechanics now sit under packages/kaal-github rather than a parallel extensions tree, and the package is a normal independently selectable Extension delivery.

The GitHub Node is typed by Core's exact Extension identity, payload() carries only the KAAL contribution, and installation projects it under extensions/kaal-github without inventing an Agent Skill. That exercises the Extension machinery from 06/06 through 06/08 for real for the first time.

I also like the strict one-way process boundary: kaal-github imports no KAAL implementation and carries no knowledge of Change or seal layout. Repository isolation is the one host rule it owns; KAAL-backed controls delegate their verdicts to KAAL commands.

## Lacked

The live GitHub workflows still invoke the Bash controls, so equivalence with the new Extension has only test evidence until C3 performs the actual cutover. The repository therefore temporarily carries the new implementation while the old host path remains authoritative.

The Extension also does not yet model GitHub-side merge orchestration such as the relationship between Owner approval, required CI checks and merge eligibility. That belongs on the host side, but it is intentionally outside this Change rather than being smuggled into C2'.

## Longed

For C3 to make GitHub invoke this Extension, add the lineage projection-currency signal, remove the old Bash controls and leave the host boundary with one implementation path.

For later GitHub-host policy to make approval and required-check state explicit where useful without teaching KAAL about GitHub CI or merge mechanics.

And for ROWING to replace the current seal-before-review sequence, which has repeatedly forced architectural decisions to happen after Work is already immutable.

**Observer conclusion:** the sealed Work realizes the GitHub integration as a genuine KAAL Extension package. GitHub refers through its Node to Core's exact Extension definition, host concerns remain outside KAAL, and KAAL semantics are delegated across the intended process boundary. No blocking finding for #58.
