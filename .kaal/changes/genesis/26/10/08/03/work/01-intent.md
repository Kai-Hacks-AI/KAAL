Intent — Separate KAAL Engine from Repository Work

Establish a clear boundary between the installed KAAL engine and the repository whose Work it governs.

".kaal/" holds the KAAL installation. The repository owns its Work and operational records.

Changes governed by KAAL concern the repository, not necessarily its KAAL installation. The same principle applies to Requests, Incidents and other repository-owned artifacts.

Investigate moving KAAL's own Changes from ".kaal/changes/" to root-level "changes/", and establish a model that works consistently across Engineer, Embed and External KAAL.

Preserve existing identities, sealed history and lifecycle guarantees. Do not treat relocation as permission to rewrite admitted artifacts.

Do not combine this with PR #70's Collection implementation. Identify the smallest safe transition and any dependencies before implementation.

Desired outcome: KAAL governs repository Work without confusing that Work with its own installed engine.
