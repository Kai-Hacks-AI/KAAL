# Investigation: TALL

Read from `kaal/genesis` at dfe6d56 (PR #72 merged) and from the open drafts #69, #74 and #75 as they stand on 2026-10-09. Nothing is built, sealed or established here. TALL is treated as proposed vocabulary, as the Intent says.

## 1. Does TALL organize what exists?

Mapping the capabilities that exist today, and the ones that are only architecture, onto the four dimensions:

| Dimension | Built today | Architecture only (not built) |
|---|---|---|
| Thinking | Core navigation: `.kaal/AGENTS.md`, references by `{name, id}`, `installedSkills()` / `installedExtensions()`, `change-state`, `list-kaal-capabilities` | `find`, `near`, `show` (08/04, merged as architecture; no `packages/kaal-learning/`, no `brain/`) |
| Acting | `kaal-changing`, `kaal-sealing`, `kaal-review`, `kaal-retro`, `kaal-intent`, `kaal-engineering`; Extension `kaal-github` and its controls | Processes (a Process is a specialized Skill, #73 merged as design; `kaal-process-agree` is a draft in #75); deterministic grants, denials, escalation |
| Learning | `kaal-retro` and the three retrospectives of Changing KAAL (they produce evidence and understanding, but nothing keeps or finds it) | `Learning`, `BRAIN`, `Learning KAAL`, `check`, `establish` (08/04), CEIL |
| Living | `kaal-incident`, `kaal-request`, `kaal-collecting`; `install-kaal --select <Node ID>`; Extension `kaal-github` | Engineer / Embed / External as named modes (Engine, Record, Subject: 08/03 merged as architecture), capability acquisition from a source (#69 draft), trust boundaries beyond hashing |

Three things this shows.

**The mapping works, and it is lopsided.** Acting and Living have built capabilities. Thinking and Learning are nearly all architecture: one package, `kaal-learning`, not yet born, would carry both.

**A capability does not belong to one dimension.** `kaal-retro` is Acting inside a Change and the input to Learning. `kaal-collecting` is Living and produces the evidence Learning rests on. `kaal-github` is Acting (it enforces the process) and Living (it meets a host). So TALL cannot classify packages, directories or Skills, and it must not be asked to. It describes what an Agent does through KAAL, a property of an interaction, not of a part. That is consistent with the Intent ("not four sequential stages or necessarily four Skills") and is why it adds no ontology: nothing needs to carry a T, A, L or L tag.

**Three axes, kept apart.** The overview (#74) has columns for what KAAL is made of (Core, BRAIN, Skills, Extensions, Processes, modes) and the Six Ds for the kind of Work. TALL is a third, orthogonal axis: what KAAL enables an Agent to do. Acting is how any D gets done under governance; it does not replace a D. The Six Ds and TALL do not conflict, and neither one's terms fit the other's axis. Mixing them into one diagram would be the mistake.

## 2. Do Thinking and Learning warrant separate Skills?

Not for 0.0.1. Reasons, from the architecture already agreed in #72:

1. **One store, two directions.** `find`, `near`, `show` read the same BRAIN that `check` and `establish` write; admission on the read side is defined by the `Learning` type that the write side establishes. Splitting means two Skills sharing a type and a locator.
2. **Born-before.** A Node refers only to Nodes born before it. A `kaal-thinking` Skill Node born first cannot cite `Learning`; born after, Thinking depends on Learning, the inverse of the acronym order. Either way the split buys a second Skill Node and an installer composition (`compatibility`) for nothing 0.0.1 needs. #72's step 1 already puts the read side first, so it is useful before any Learning exists (it reaches Skill Nodes and Changes).
3. **The honest cost is the name.** The read side serves Skills and Changes as well as Learnings, so an Agent looking for "find what KAAL already holds" meets a package called learning. #72 already says what brings an Agent to `find`: the Skill's `description`. The remedy is in that description, not in a second Skill.
4. **When to split.** When the read side gets a consumer that is not a BRAIN, for example search over other Records, or an Agent that should have `find` without Learning admission. #72 Fork 7 already marks the seam (the helper extractable as `kaal-graph`). Until then `kaal-thinking` is a reserved name for the dimension, not a package.

## 3. Acting versus Living

Not an execution boundary. The same script, `kaal-github` control or Skill can be used in either. What differs is the **trust boundary**:

- **Acting** is Work inside KAAL's own governance: a Change in a Record the Owner grants, admitted by seals, reviewed, closed. Authority comes from the Owner's grant.
- **Living** is where something outside that governance is met: a client's carrier, another Agent, a host, a source of capabilities. What KAAL contributes there is identity (SHA-256), refusal and a record of what was reached or not; it contributes no authority over the other party. `kaal-collecting` hashes carriers and records `unreached`; the installer selects by exact Node ID, never by name.

Test that decides a case without a new boundary: does the thing's authority come from KAAL's own grants and seals (Acting), or does its content arrive from a party KAAL cannot govern, so that KAAL can only identify it and decide whether to take it (Living)? A single operation can be both, in sequence. Nothing needs a mechanism for this; it is how a reader chooses a heading.

## 4. Relation to BRAIN, Processes and the three modes

- **BRAIN** is the store Thinking reads and Learning writes. Nothing else touches it. The one interface between the two dimensions is the line that a Learning states for when to recall it (`Applies when` / proposed `Situation`): Learning writes it, `find` prints it on every card.
- **Processes** are Acting's composition. Where KAAL says "consult what is held before Requirements or Architecture", that belongs in a Process, which composes `find` like any Skill. #72 deliberately put no hook in Changing KAAL, and #73 gives the Process that home. Thinking and Learning are therefore usable by Processes without any dimension owning them.
- **Modes** (Engineer, Embed, External) are orthogonal to TALL. A mode says where Engine, Record and Subject are (08/03). All four dimensions operate in all three modes with the same meaning; a BRAIN is named by whoever uses it. Modes matter to Living because crossing a boundary is where a Record or a Subject sits elsewhere, but Acting, Thinking and Learning are not "inside" a mode.

## 5. Established versus target

Established: Core, Skill and Extension registration, the Agent entry, Sealing, Changing KAAL (with ROWING, WORK, RATIFICATION), Retro, Review, Intent, Collecting, Incident, Request, the GitHub Extension, the installer, Engine / Record / Subject as architecture.

Target: BRAIN and `kaal-learning` (architecture only), `find` / `near` / `show` (prototype scratch only), Processes (design in #73, first candidate in #75), deterministic grants and escalation, capability acquisition (#69), modes as named operating modes, the Six Ds beyond Intent.

## 6. Does TALL help a fresh Agent?

See `04-evidence.md`. In short, not measurably. A fresh Agent with only the existing entry point already found the built capabilities and identified what is not built. The TALL arm did not discover more of what exists. Its Living dimension was read as the three modes alone (correctly reported as not implemented), so the incident, request and collecting Skills, which it used for the client task, were not recognized as Living. The one thing the TALL paragraph added, a pointer to the target parts, comes from stating status, which a plain status table also provides.
