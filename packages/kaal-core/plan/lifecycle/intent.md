# Core's Lifecycle: Intent

This is `core/C18`, a PLAN Change. It ships no code. `core/C19` turns its planned tests GREEN.

`core/C16` (#459) found that kaal-core does not meet LOVE's Lifecycle criterion. An Engine can be installed, but not upgraded, removed or versioned. Core also states no Installation Contract for itself, although `core/I3` asks one of every Capability. This Change plans that lifecycle. Core already owns the format every Capability's installation is stated in, so Core states its own installation in that format and follows that format's rules for its own files.

- **core/I12.** An Engine Core installs has a whole lifecycle. It can be installed, upgraded to a later kaal-core, and removed, and anyone can read which version of Core installed it. Each step follows the lifecycle rules of the Installation Contract format (`core/I3`), so it takes nothing that is not Core's (`core/I5`).
- **core/I13.** Core is realized by a contract of its own, like any other Capability. It gets no lifecycle the format does not give every Capability, and it takes over none of theirs.

Lifecycle is one of LOVE's four criteria. Meeting it does not decide packaging, and a packaging decision never authorizes a release (`core/I10`). Whether kaal-core can come from a registry while `kaal-graph` and `kaal-hosting` are unpublished is the Owner's packaging question. This PLAN does not answer it.
