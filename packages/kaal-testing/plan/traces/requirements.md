# Case Traces: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **testing/F84** [testing/I22]: **The Case declares its targets.** A Case is a call to `it(` or `test(` at the start of a line in a case file. Its title, the first argument, names its targets in its first bracket, comma-separated, such as `[testing/F51, testing/F25]`.
  - The Case's identity is its title's leading identity when it has one (`owner/T<n>` or a bare `T<n>`). Otherwise it is the whole title, as in `test/embed/`.
  - A bare target, such as `F5`, or a bare identity, such as `T2`, is qualified by its owner:
    - the owner the Case's own identity names, as `core/T1 [I1, F5]` gives `core/I1` and `core/F5`;
    - otherwise the `owner` the caller gives, from the ownership claim of the location the file is in.

    A target already qualified is kept as written, whoever owns it: its meaning stays its owner's.
  - A title with no bracket traces nothing. It is listed as `untraced`, never guessed.

  `derive(files, { owner? })` gives `{ model, untraced, findings }`. `model` is Testing's model (testing/F24–testing/F25), `{ cases: [{ id, tests }] }` ordered by identity, so `check` and `tested` read it unchanged.
- **testing/F85** [testing/I22]: **Only case files in a case location.** A file is read only when its path, relative to the capability's root, starts with one of the case locations, `test/embed/`, `test/engineer/`, `test/plan/`, or the legacy `test/acceptance/` (testing/F76, testing/F77), and ends in `.test.mjs`. Any other file, an implementation test such as `test/verifiers.test.mjs` among them, traces nothing.
- **testing/F86** [testing/I22]: **What cannot be read is a finding, never a trace.** Each of these is a finding naming its file, and the Case traces nothing:
  - a title that is not a static string literal, such as a variable or a template with a substitution;
  - an empty bracket;
  - a target that is not an owner's identifier, as when a bare one has no owner to qualify it;
  - a bare identity with no owner;
  - a target named twice;
  - a Case identity declared in two places, naming both files. Neither declaration is traced.

  A file that is not `{ path, text }`, or files that are not a list, is a finding. A call inside a string, a regular expression or a comment is not a Case.
- **testing/F87** [testing/I22]: **Traversable both ways.** `edges(model)` gives `{ edges, findings }`, with one `{ from, type: "tests", to }` per Case and target, ordered by Case, then target. A retired Case traces nothing. A model with a finding (testing/F25) gives its findings and no edge. `incoming(model, target)` gives the Cases that test `target`, as `tested` does, and `[]` for a target no Case tests. These are the `out` and `in` directions Engineering's traversal follows across this hop.

## Nonfunctional

- **testing/N18** [testing/I22]: Deriving is pure and deterministic. It reads only the text it is given, never executes it, reads nothing from a host and changes no input. The same files give the same model, untraced list and findings, in the same order, whatever order they come in. `kaal-testing/traces` imports only `kaal-testing/model`.
