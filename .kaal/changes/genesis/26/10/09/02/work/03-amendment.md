# Amendment received: KAAL Development Overview

Kept apart from `01-intent.md`, which is unchanged. This is the Owner's amendment as received, verbatim; whether it is the same Intent or another is the Owner's to say.

## Intent

Complement KAAL's canonical conceptual architecture overview with a development overview showing what is currently in flight.

The two views answer different questions:

* Architecture Overview: What is KAAL intended to become?
* Development Overview: What work is moving KAAL toward that architecture?

## Requirements

1. Consistent presentation: Reuse the architectural overview's visual vocabulary, including colors for BRAIN, capabilities, Records and Processes.
2. Live repository evidence: Derive development information from GitHub PRs and the relevant development lineage. Do not maintain a manually duplicated PR status inventory.
3. Visible PR numbers: Always display the actual PR number (e.g., `#72`) as ordinary text, independently of link rendering.
4. Navigation: Provide a separate clickable action to open the corresponding PR. Do not rely on GitHub link labels, which may render as `github.com`.
5. Distinct states: Show PR lifecycle state separately from architectural or capability maturity. A merged design PR does not establish implementation.
6. Lineage awareness: Distinguish changes merged into `main`, changes present in `kaal/genesis`, and open PR branches.
7. Architectural traceability: Where practical, associate development activity with the architectural concerns represented in the conceptual overview.

## Presentation

Use compact, readable entries with:

* Architectural concern and corresponding color/icon
* Short description of the work
* Visible PR number
* PR status
* Capability maturity, when established
* Separate navigation action

## Implementation boundary

Do not introduce a dashboard service, new registry or continuously maintained status file solely for this overview.

First investigate whether existing GitHub functionality and repository documentation can provide the required visibility.

A static repository document may explain how to inspect development activity, but must not present stale PR states as current.

## Acceptance criteria

A fresh Agent or human entering KAAL can discover both views and distinguish:

* What KAAL's architecture intends
* What has been established
* What is currently being developed
* Which PR provides the relevant evidence
* What remains to be realized

The development overview must not become a competing source of truth for GitHub state.

## Future relationship to D3

Both views may later become results maintained through the dedicated Design Architecture Skill.

Do not preemptively establish that Skill or its Way of Working in this Change.
