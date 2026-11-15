# kaal-change 0.0.1 Release: Intent

This is `change/C4`, a PLAN Change. It ships no code. Later DO Changes turn the planned tests GREEN.

The Owner asked on #530 (comment 6502453602) for a release path to `kaal-change` 0.0.1, owned by Change. The quality bar is `@kaihacksai/kaal-guard`:
- the installed package documents its intent, requirements, architecture, limitations, operation, installation and removal;
- it carries tests a consumer can run inside the installed package;
- its evidence says honestly what is consumer evidence and what is publisher-only, with no GREEN on zero tests;
- it is accepted on the packed artifact in a clean consumer.

The Owner's later alignments shape what 0.0.1 is:
- every capability is standalone, with optional complements stated in its own contract (#530, 6490482020);
- Graph is structural only, and Change owns Succeeds, Delivers and delivery (`change/C1`, #530);
- presence, registration, admission and use are distinct (#530, 6505123872).

`kaal-change` has never been published. Main has no `kaal-change`, and none of the KAAL packages it uses in its own repository tests is on npm.

- **change/I11.** A consumer that installs only `kaal-change` can use it. Change Records, the Change Lifecycle, Change Classification and the Change Definitions work alone. The delivery assessment of `change/C1` works when its optional complement, Graph, is installed. Without Graph it says it cannot assess, and never gives a verdict.
- **change/I12.** The installed package explains itself. Its documentation covers intent, requirements, architecture, limitations, operation, installation and removal, and cites only contracts defined in the package itself.
- **change/I13.** The installed package verifies itself. The consumer runs the package's own tests against the installed copy and gets exactly one result: verified, failed or unknown. Verified needs every declared case to have run and passed. Every piece of evidence says whether it is the consumer's or only the publisher's.
- **change/I14.** Acceptance is on what is shipped: the packed artifact, installed into a clean consumer with no workspace, no source checkout and no KAAL package the artifact does not bring.
- **change/I15.** Removal removes the machinery, not the knowledge. Uninstalling the package leaves the consumer's Change Records and Change Nodes intact and usable. Nothing about the package is registered with any KAAL Engine unless the consumer registered it, and retracting that is the consumer's.
