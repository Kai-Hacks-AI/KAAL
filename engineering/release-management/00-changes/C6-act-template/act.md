# C6 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

The two review rounds that narrowed the contract. My first draft borrowed the PLAN's limits; the CPO asked for only what had been agreed, and what remained was two chapters that a Case can check. Running the Cases once against a throwaway template showed that they can pass before any file was delivered.

## Learned

The tooling that opens a pull request appends a generated footer to the body, so a body that was correct when written was not correct when created. It happened on all three pull requests of this Change and was found by review each time. Generating the seven Cases from one shared header also copied declarations that most of them never used, and the review found that too.

## Lacked

A way to open a pull request without the footer, and a way to see a template as an agent gets it, because the API ignores templates. A list of the ids already taken: I scanned six branches to find free ones, and another thread claimed ids next to mine and had to ask.

## Longed For

A body check at the moment a pull request is created, so a contaminated body never exists. A check that a Case declares only what it uses. One place where the next free id of a capability can be read.
