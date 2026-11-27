# Identity and numbering: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N33** [core/I46, core/I47]: An id that cannot be read under its kind's numbering is a finding, never skipped, and the finder refuses to answer past it. Absent is not empty: a scope or kind Core does not know is reported as unknown, never as "the first number is free".

## Functional

- **core/F125** [core/I46]: A kind definition in a Registration may state `numbered`, a prefix of capital letters. Only the kind's owner states it, as with every part of a kind (core/F51). A kind without it has the opaque identity it has today.
- **core/F126** [core/I46]: In every scope, an instance of a numbered kind has an id made of the prefix and a positive decimal number without a leading zero. Any other spelling is an `unnumbered-id` finding naming the scope, the id and the kind. An identity is the pair of scope and id (core/F48): one id in two scopes is two identities, and one id twice in a scope is still the collision finding of core/F49.
- **core/F127** [core/I47]: `assembly.nextFree(scope, kind)` returns `{ id }`, the prefix and one more than the highest number the scope holds under that prefix, or the prefix and 1 when it holds none. A gap is never reused. It returns `{ id: null, reason }` when the scope is not claimed, the kind is not defined or not numbered, or the scope holds an unnumbered id of that kind.
- **core/F128** [core/I47]: The answer depends only on the registrations given. Core reads no file and sees no open branch. The caller that reads the files, Hosting for main and for every open branch, passes the union, and a number held nowhere in that union is free.
