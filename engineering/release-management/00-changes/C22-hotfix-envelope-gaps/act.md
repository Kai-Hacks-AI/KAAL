# C22 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The gaps came from a real probe of the judge, not from reading its source: two sample envelopes showed an empty Defect and a DO from a `hotfix/` head giving no finding, so the PLAN named exactly what was missing. The scope held: the deterministic checks went in, and what needs a reviewer stayed listed as not judged on every HOTFIX result.

## Learned

A prefix pattern is not a rule for a whole line. The first Change-line check accepted anything after the first word, and the CPO found it on review. The full line needs its own definition, and the Cases need negative lines as well as legitimate multiword names. A Case written with the PLAN can be extended in the DO, and the DO names that. Superseded Branching failures after the auto-merge cycle are not findings: only the latest run counts, and checking it before acting avoids chasing them.

## Lacked

A required defect reference for the Defect chapter, which amends release/F16 and waits for the CPO. The `Driven-by` agreement for a HOTFIX, and the Hotfix delivery path with its base, which keep every HOTFIX result at UNKNOWN. A Case that looks at the diff, so that defect-only scope is shown by evidence and not left to the reviewer alone.

## Longed For

The CPO decision on the defect reference and the Hotfix delivery path as separate Changes. The envelope check promoted to main and then wired, so these rules guard a real HOTFIX.
