# Hosts: facts, applicability and review

Hosting is KAAL's one operating-system boundary (`OS_BOUNDARY` in `kaal-hosting/conformance`). No other capability names an operating system, in its code, its tests or its applicability. When a case genuinely needs something only some hosts have, it names a host fact that Hosting defines, and Hosting establishes on each run whether that fact holds. This guide states each fact per host, the applicability rules, and what a reviewer checks.

## Facts per host

`facts()`, from `kaal-hosting/fixtures`, establishes each fact by trying it in a temporary directory, never by reading the platform's name. Hosting's own tests check, in every Hosting lane, that what `facts()` establishes there agrees with that host's row below.

<!-- kaal-hosting:hosts -->
| Fact | Platform | Holds | Evidence |
| --- | --- | --- | --- |
| `kaal-hosting/special-entries` | linux | yes | https://github.com/Kai-Hacks-AI/KAAL/blob/kaal/hosting/packages/extensions/kaal-hosting/test/plan/portability.test.mjs |
| `kaal-hosting/special-entries` | darwin | yes | https://github.com/Kai-Hacks-AI/KAAL/blob/kaal/hosting/packages/extensions/kaal-hosting/test/plan/portability.test.mjs |
| `kaal-hosting/special-entries` | win32 | no | https://github.com/Kai-Hacks-AI/KAAL/pull/650#issuecomment-6517684723 |
<!-- /kaal-hosting:hosts -->

- **`kaal-hosting/special-entries`**: a FIFO and a listening Unix-domain socket can be placed in a directory tree. Use `specialEntries(dir)`: where the fact holds, it returns `{ holds: true, fifo, socket, close }`, and where it does not, it makes nothing and returns `{ holds: false, fact, reason, evidence }`. Where the fact holds but the fixture cannot be made in `dir`, it throws a `SetupFailure` (`outcome: "unknown"`): that is a setup failure, the case fails, and it is never a reason for the case to be not applicable. On Windows, Node can make neither inside a tree. A cycle of symbolic links is a portable `kind()` `"other"` entry and needs no fact.

## Applicability rules

For every package but the boundary:

- A case may be not applicable by host fact, `{ host: ["kaal-hosting/special-entries"], reason, evidence }`, with a nonempty reason and an `https` evidence link. It is not applicable on a run only where `facts()` established a fact it names not holding there. It stays registered on every host, with the same title and body, and is never reported as passed.
- A case is never scoped by `platforms`, and a manifest never limits the package by `os` or `cpu`. Either is an architectural violation, never an exemption.
- `requires` and `absent` (optional complements) are Testing's and the composition rule's. The audit leaves them alone.

## The portability audit

`portability({ name, root, builtins, applicability })` from `kaal-hosting/boundary`, `portabilitySuite(options)`, or `kaal-hosting-boundary --name <name> --root <dir> --applicability <file>`, extends the boundary suite with two deterministic cases and these findings, each naming its case:

| Rule | Found when | Case it fails |
| --- | --- | --- |
| `platform-applicability` | a declaration has `platforms`, or the manifest has `os` or `cpu`, outside the boundary | `applicability is not scoped by platform` |
| `unknown-host-fact` | a `host` entry is not one of the facts above | `host exceptions are well-formed` |
| `unreasoned` | a host exception has no reason | `host exceptions are well-formed` |
| `unevidenced` | a host exception has no `https` evidence | `host exceptions are well-formed` |
| `stale` | no test source registers a case of that title, or every fact it names holds on every host | `host exceptions are well-formed` |

For the boundary itself, `applicability is not scoped by platform` is `not applicable`. `challenged` names each case with such a finding and each test a `registration` or `dilution` finding decides, so Testing does not count them as evidence.

## Review: `host-applicability`

Every host exception, well formed or not, is a review request `kaal-hosting/host-applicability@<case>`. A `review` link in the declaration is evidence only, and the request stays open in the result until Review's record settles it. For each request, check:

- On the hosts where the fact holds (the rows marked yes), the case runs with its full assertions, through Hosting's fixture, and passes there.
- On the hosts where it does not, the case asserts nothing weaker by another route, and the reason matches this guide's evidence for that host.
- The case needs the fact for the behaviour it tests, not for convenience: where a portable fixture exists, such as a link cycle for an `"other"` entry, the exception is not needed.

When an agent's authority is not enough to settle a request, it escalates to a human through PREACH.
