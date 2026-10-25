# Guarded File Reconciliation: Intent

This is `hosting/C1`, a PLAN Change. It states why Hosting needs a guarded file reconciliation, what it requires, where the responsibility lies, and the outer tests that decide it. It ships no code; `hosting/C2` turns the tests from RED to GREEN. Core consumes it in `core/C13` (`core/A7`, `core/A14`): Core plans which files to write, keep and prune, and Hosting applies the writes and removals.

Hosting's `update` only publishes a new directory, and `initialize` only fills an empty one. Neither can replace or remove an individual file in a directory that already holds other people's work, such as a repository.

- **hosting/I1.** KAAL can bring individual files in a directory to a planned state, writing, replacing and removing them, and never overwrites or removes a file that, when the reconciliation checks it, is not what the plan expected. A change made after that check by a writer that does not use Hosting is outside this guarantee.
- **hosting/I2.** A reconciliation applies all of its changes, or, when Hosting observes a failure while applying, none of them, and it reports the outcome of every one. This is rollback on observed failure. It is neither atomic across a crash nor isolated from readers or from writers that do not use Hosting (see the Limits in the Requirements).
- **hosting/I3.** Whoever plans a reconciliation states only paths, bytes and intent. How the host realizes it, executable modes included, is Hosting's concern, so nothing above Hosting knows the OS.
