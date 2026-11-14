# Intent (retro/C3)

The package's own `npm test` works when run in the package. retro/C2's DO #1644 said it did; it does not, because `pretest` uses a workspace flag and the package is deliberately not a root workspace. The claim was wrong, not the choice of keeping the package out of the workspaces.

Value: anyone qualifying the package, including the promotion review, can run its Cases with one command and get the result the record says, with no hidden step.
