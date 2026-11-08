# Architecture (foundation/I13)

- **foundation/A18**: Foundation supplies the signal's data and no policy: the workspace version and an optional
  declared floor, both read from Foundation's package and Node. The comparison runs where the consumer is
  judged: Foundation's `boundary` command for one consumer, Guard for the repository.
- Owners:

| Owner | Owns |
| --- | --- |
| Foundation | `pin-behind` in `boundary`; the floor declaration in its Node. |
| Guard | The repository-wide report and its "held" outcome. |
| Core, Change, Testing | Their pins stay as they are; they narrow their own single-copy assertions. |
| Engineering | The lock (one regenerate) and the acceptance host, which installs the registry copy a consumer's exact pin needs. |
| Owner | Replacing I11 by I13, and the escalation at promotion or publish. |

- Reasoning: a bump no longer forces a joint Change; the pressure moves from a gate to a signal, and a gate
  returns only for a declared floor.
