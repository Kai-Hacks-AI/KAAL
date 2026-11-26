# C16 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it. It claims no repository-wide conformance, no stable identity of ids, no Control and no promotion.

## Liked

Keeping the library pure: the caller supplies the text of the files it can see, so the observation boundary is a plain argument and INVALID against UNKNOWN is easy to test with a fixture. The CPO's two comments on the PLAN, on permanence and on missing evidence, narrowed the Requirements before any code, which kept the DO small.

## Learned

Moving the Cases beside their Requirements made an older Case fail: T17 said the package ships only its Skill. Running the whole package suite before pushing found it; the DO amended A1 and T17 and said so. The first Branching run of a new pull request fails before auto-merge is registered, and disabling then enabling auto-merge clears it.

## Lacked

A run of the check over the A-records that exist in the other packages. The Cases use fixtures only, so they say how the check behaves, not how many real records are INVALID or UNKNOWN. There is also no command and no way yet to read the files through Hosting.

## Longed For

A first read-only run over the repository, to see how many A-records address nothing or address a Requirement in an unobserved package. A decision on the lifecycle of ids (retirement, migration, correction) as its own Change. Placing a Defect where it is to be fixed, which is the next Change.

## Open

The check is detective and is not registered as a Control. Whether `addresses` should become a Graph Edge is undecided. The next-id suggestion promises nothing beyond what is observed.
