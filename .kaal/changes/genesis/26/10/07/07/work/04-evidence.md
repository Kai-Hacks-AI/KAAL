# Evidence

What was run and what it showed, on the Work as it now stands.

## Acceptance

`engineering/kaal-collecting` (19 tests) and the package's own (3) pass. They show, on the shipped bytes:

- Core carries no Collecting KAAL; registering through `registerSkill()` adds exactly one Node and its seal, found by type alone, with the sealed identity `d938e5310a9139c66ec503c9dcb7d37a3f0ca50b2c1b9effec020746a1e66230`.
- The Node says known, reachable and all clients are different, that no list of clients is kept, that a client is a name and not a location, that only KAAL-addressed carriers are in scope, and that a collection is evidence only; it names no host, transport, client or mechanism.
- The script and the Agent Skill name no host, no client and no URL, and the script imports nothing that reaches a network or starts a process.
- Reached with carriers, reached with nothing, and unreached are three different records, and a client not attempted leaves no trace anywhere. Carriers are byte-for-byte copies recorded with their SHA-256 and the path they were carried at.
- Symlinks, non-files, backslash, control-character and non-NFC names, `.git*` names, case collisions, an existing client record, a bad client name or collection and bad usage are refused, and a refused attempt writes nothing.
- `check` catches an altered, a missing, an unrecorded and a symlinked carrier, a carrier recorded twice, a stray file in the record and a record not in the form the script writes.
- Allocation of collections follows Changes: highest plus one, no gap reuse, refused at 99.

## A finding the Work had to resolve

A real collection under `.kaal/collections/` made `check-kaal-install` fail ("is not delivered by any package"), because the installer treated every file in the KAAL directory outside `changes/` and the Change and tree seals as something a package must deliver. A KAAL that has collected anything would have been reported as not holding its delivery. `collections/` is now installed state beside `changes/`, neither read nor written by installing nor judged by the check (`engineering/kaal-install`, with its own acceptance test and the existing counts of installed Skills raised by one). `.gitattributes` keeps `.kaal/collections/**` from text conversion, so a collected carrier keeps its bytes through Git. No Core, `.github`, Sealing or Changing change.

## Worker-side probe (not review)

A Worker-spawned agent probed the Work adversarially and its findings were resolved in `work/`. That is the Worker's own testing and is not ROWING review: the Reviewer must come through the independently established review side, and no round exists. The findings, resolved, were: a refused or racing attempt could remove another attempt's record, `begin` accepted impossible dates, `.git*` names were not refused, `check` followed symlinks and ignored stray files, the Skill did not say the `carriers/` default is an assumption nor what to record for an unseen exposure, and the Node said Collecting itself takes from the client. The Node was reworded and so re-sealed in this branch, before any admission.

## Whole suite

`npm test` passes, as do `check-kaal-install`, `check-kaal-seals`, `check-kaal-config`, `check-kaal-agent` and `check-kaal-changes`.

## What this does not show

No carrier of a real Incident or Request existed to collect: the carriers are created by a concurrent Change, and the `carriers/` default is an assumption to be replaced by their own location (Architecture, the one assumption). Nothing was collected from any real client, and nothing was run against Enercon.
