# Package Interface Contract: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **hosting/F35** [hosting/I9]: **The declared interface.** hosting/A15 declares every entry of Hosting's package interface: each `exports` subpath and its target, each `bin` command and its target, and each `files` entry. Each entry's status is exactly `delivered` or `planned hosting/C<number>`, naming the Change that delivers it. The declaration is read strictly: a row with an unknown kind, an empty entry, a duplicate, or any other status (missing, misspelled, or malformed) fails the Test Case, and is never read as planned. The candidate conforms when, judged against that declaration alone:
  - every `exports` subpath, `bin` command and `files` entry it has is declared;
  - every `delivered` entry is present;
  - a `planned` entry may be present, and once present it is held to the same rules as a delivered one;
  - each present export and command points at its declared target;
  - every target it names (each condition of an export, and each command) is in the packed tarball;
  - the tarball holds only `package.json`, `README.md`, `LICENSE` and what its `files` entries ship;
  - installed alone in a fresh consumer, each export loads by the package's name and subpath, and each command is linked.

  The Change that delivers a `planned` entry marks it `delivered` in hosting/A15, as part of that reviewed Change.

## Limits

- The contract is the package's shape, not its behaviour. What each entry does is the business of its own Requirements and Test Cases.
- The name, version, license, engines and dependencies stay with hosting/T21.
