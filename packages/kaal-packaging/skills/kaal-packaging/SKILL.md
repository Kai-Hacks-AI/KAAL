---
name: kaal-packaging
description: Measure what a package artifact delivers, and decide the generic KAAL Package contract against a package that was packed and installed into a consumer. Use before publishing or promoting a KAAL package, when a package's size or contents change, or when asked whether a package meets the KAAL Package contract.
license: MIT
compatibility: The commands need Node.js 24 or later and the kaal-packaging package's dependencies (kaal-hosting, @kaihacksai/kaal-foundation). They run npm through Hosting.
---

# Packaging a KAAL package

What Packaging means is stated by the `Packaging` Node in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file tells you how to do the work. Packaging decides the generic KAAL Package contract (packaging/F7–F14, packaging/N7–N9) and nothing else.

## Measure an artifact

Run `kaal-packaging measure <artifact> [--work <dir>]` on a packed artifact you can name the origin of (packaging/N5). It prints the measurement record of packaging/F1–F6: the package, the tool that described it, the packed and unpacked sizes, and every delivered file with its size. Measure when a change may alter what a package delivers, and compare two records to see what moved. A refused artifact is named with its reason; never measure around a refusal.

## Decide the contract

Pack the candidate, install the packed artifact into a fresh consumer project, then run `kaal-packaging conform <installed-dir> [--consumer <dir>] [--work <dir>]` on the installed copy, never on a checkout. It runs the package's installed `npm test` and prints one finding per Requirement, each with its cause, then one result line. The exit status is 0, 1 or 2, by that result.

Each finding carries one of Testing's results; what each result means is Testing's (testing/F13), so read it there and report it as it stands. When a finding is not verified, act on its cause:

- packaging/F7: pin exact versions, and install dependencies from a registry. A recorded registry resolution is what the install recorded, not verified provenance (testing/F14).
- packaging/F8: ship the six documents under `docs/`, and link `docs/operations.md` from the README.
- packaging/F9–F11: make the installed `npm test` run exactly the cases the shipped `test/verify.json` declares, against the installed files, and end on one result line.
- packaging/F12: declare the runtime; leave operating systems to Hosting (hosting/F39).
- packaging/F13: ship the Testing model, so each delivered case traces to what it tests. The command hands in no Testing model functions, so for a package that ships a model it reports this finding unknown. To decide it, call `conform` from `kaal-packaging/conformance` with `testing` set to Testing's `check` and `tested` (testing/F25).
- packaging/N7–N9: verification leaves the consumer as it was, needs only the package's declared dependencies, and decides from behaviour, never from a file merely existing.

## What belongs to another owner

- Which cases a package needs, whether they are adequate, and what its own verification reports: the package's owner.
- What a result means, and which targets are evidenced: Testing.
- Which hosts a package runs on, and every operating-system difference: Hosting.
- Running these commands in a release lane, and when a lane must pass: Engineering.

## Rules

- Run `conform` on a packed-and-installed candidate. A checkout is not what a consumer installs.
- Never edit `test/verify.json` by hand to make a finding pass. It is build output.
- Report a finding that is not verified with its cause, never as passed.
