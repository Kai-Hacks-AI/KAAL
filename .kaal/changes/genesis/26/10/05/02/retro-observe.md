# Retro

## Learned

The most important thing this Change exposed was not the configuration mechanism itself, but the boundary around a Change. The implementation was split into several sensible engineering steps, yet those steps were admitted to `kaal/genesis` while the Change was still open. Watching that happen made the distinction concrete: decomposition before lineage is useful; partial admission into lineage is not. That observation directly produced the admission work now being designed separately. I also learned that delivery naming really is separable from sealed semantic identity: the repository could move from `changing-kaal` and `engineering-kaal-skill` to prefixed delivery names while the Nodes themselves remained the same sealed facts.

## Liked

The red-to-green sequence was unusually informative. Core first gained a small configurable rule, the repository then exposed that rule while knowingly non-conformant, and only afterwards performed the explicit migration that made the checker green. That made the policy observable before remediation and avoided hiding migration inside the checker. I also liked that the naming question was deliberately kept smaller than the architecture we could already imagine: `kaal-whatever` remains structurally valid rather than inventing a semantic-name-to-slug grammar prematurely.

## Lacked

The Change lacked a clean staging/admission boundary, and that created most of the process friction I observed. A, A2, B, C and D were useful implementation steps, but making them separate lineage admissions produced dependency ordering, repeated reviews and intermediate states on `kaal/genesis` that had not yet passed retrospective closure. The process also did not guide the worker clearly enough at the retrospective boundary: the first closure attempt filled both retrospective seats from the worker side. Finally, the GitHub Actions runner incident demonstrated how easily infrastructure delay can be mistaken for a defect in the Change when the execution surface gives poor evidence about why a job has not started.

## Longed

For one coherent Change to accumulate as much engineering work as it needs outside the admitted lineage, with small commits and reviewable steps remaining cheap, and then cross the lineage boundary once: Work sealed, worker perspective recorded, an independent observer given a real handoff, Change sealed, checks green. I also long for evidence to be collected as the Work unfolds rather than reconstructed at closure, so the final sealed Work points directly to what was observed and the observer can verify claims without having to rediscover their provenance.
