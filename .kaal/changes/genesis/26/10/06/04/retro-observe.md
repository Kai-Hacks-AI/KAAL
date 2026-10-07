# Retro

## Learned

Preservation becomes much clearer when stated over KAAL rather than over the repository that happens to carry it. The existing admission predicate already contained the closed-Change preservation rule, so extracting that rule exposed duplication rather than inventing new semantics. The Node-seal question also showed the value of choosing the semantic boundary first: protecting the installed KAAL naturally covers capability Nodes without teaching KAAL or its future host extension where kaal-core source files happen to live.

## Liked

The implementation stays host-neutral and small. `preserveChanges` is now shared with admission, so closed-history comparison has one implementation. `preserveSeals` accepts only baseline and candidate KAAL directories and protects installed Node seals plus Kernel identity without Git, GitHub, package paths or `kernel.sha256`. The acceptance cases make the intended widening from the old Core-only shell control explicit and also pin the deliberate exclusion of tree and Change-seal hardening.

I also liked that the repository's own installed KAAL is used as evidence: preservation is not demonstrated only on toy fixtures.

## Lacked

The old shell controls remain live, so for the moment the repository still has two operational paths expressing preservation: the new KAAL operations and the Bash controls they are intended to replace. That is intentional staging, but until C2/C3 land the architectural boundary exists in code before it exists in enforcement.

The preservation operation also deliberately stops short of pushed tree/Change-seal immutability. That remains a known gap rather than something this Change should quietly broaden.

## Longed

For C2 and C3 to make these operations the only preservation semantics used by the GitHub host and then remove the Bash implementations entirely, leaving the direction clean: host extension supplies baseline/candidate KAAL; KAAL returns the preservation verdict.

After that migration, for pushed-seal immutability to be designed as its own hardening Change with explicit semantics rather than being smuggled into preservation during the port.

**Observer conclusion:** the sealed Work realizes its Intent and Requirements. It moves preservation to the correct KAAL boundary without contaminating KAAL with repository, Git or GitHub knowledge. No blocking finding for #52.
