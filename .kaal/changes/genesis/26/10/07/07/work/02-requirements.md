# Requirements

Scope: two capabilities, each a Skill by KAAL's existing meaning (one package, a Node typed by Core's `Skill` Node, an Agent Skill, acceptance in `engineering/`), following the shape of `kaal-retro`. Nothing here needs a new Core meaning.

1. **Two Skills, named by the instance prefix.** `kaal-incident` (Node `KAAL Incident`) and `kaal-request` (Node `KAAL Request`), one package each, independently selectable. Each Node says what the capability means to KAAL and nothing of mechanism, and says plainly that it is optional.
2. **Optional, never automatic.** Neither is Core, neither is needed for a valid embedding, neither is installed by embedding KAAL. They join an installed KAAL only by being selected by the exact ID of their Node (`install-kaal --select <Node ID>`), as for any capability. Selecting one does not install the other, and neither declares the other or any sibling it needs.
3. **Addressed to KAAL by use.** A carrier is addressed to KAAL by having been made with the capability. The capability neither replaces nor governs the client's own incident, defect, backlog, idea or request mechanisms, and says the client is responsible for telling its own from what it addresses to KAAL. Nothing about a client's own mechanisms is modelled.
4. **Creation.** An agent can create a carrier through one command that takes the KAAL directory and the carrier's two statements, and produces a file in a canonical form it alone defines. The form is the smallest that distinguishes the two kinds and says what each is for: an Incident states what Happened and what was Expected of KAAL; a Request states what is Wanted and what is Missing.
5. **Local carriage.** The carrier is a plain file inside the client's KAAL directory (`incidents/YY/MM/DD/CC.md`, `requests/YY/MM/DD/CC.md`), so it stays with the embedded KAAL and is available for later collection by KAAL. It is written once and never replaced; numbers within a day are one after the highest, no gap reused, 99 at most. A command that finds a way to write somewhere else, including through a symbolic link, or to a directory that is not a KAAL directory, refuses and writes nothing.
6. **Later harvestable.** A reader that knows only the form and the place can find every carrier and tell a carrier from anything else (`check`). Nothing else holds a copy, a queue or an index.
7. **No transport and no service model.** No transport, synchronization, GitHub Issues, automatic submission, central backlog, harvesting protocol, status, priority, identity of the sender, severity, assignee or lifecycle. The scripts know nothing of Git, GitHub, a network, or any client.
8. **No client encoded.** Nothing names Enercon or any particular client.
9. **The installer keeps its promise.** A carrier made in an installed KAAL is genuine installed state like `.kaal/changes`: installing again does not disturb it and `check-kaal-install` does not report it as drift.
10. **Core, Changing, Sealing, CASE and `.github` unchanged.** If any turns out to be necessary the Change stops and says so on the PR.
11. **Proof.** Acceptance for each capability on what ships (delivery through Core, realization, the form through the command an agent runs, conventions) and on a repository that is not KAAL (not installed unless selected, installed when selected, a carrier made there survives and is found).

## Not decided

- Whether carriers should be sealed, and by what identity. Nothing here seals them; collection may want an identity, and that is for the separate problem.
- Whether the installer should know the carrier directories by name (as done here, the smallest step) or reserve one directory for all capability-owned installed state.
- Whether a carrier should state which Core it was made against. A collector can learn that from the KAAL directory the carrier was found in.
