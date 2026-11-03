# Standing alone

This is the one declaration for anyone using Review in another repository. It is made here and nowhere else.

**Stands alone.** `SKILL.md` and the files in `references/` stand alone. Reading them as plain text needs nothing but a reader: no installation, no registration, no KAAL Engine. The Nodes under `payload/` and any mention of a KAAL Engine are an optional deeper reference, never a prerequisite.

**Dependencies.** None. Every file this Skill points to is in this folder, at the same version.

**Optional commands.** `scripts/check-record.mjs` validates a review record and `scripts/collect.mjs` summarizes many. Both are optional (a review can be done and recorded by hand), and both need Node 24 or later.

**Effects, kept apart**
- *Knowledge access*: reading this text needs no installation, registration or Engine.
- *Intended effects*: advice and a procedure followed in plain text. The two commands read the files they are given and print; they write nothing and call nothing else. The Skill and its commands do not write to the target repository.
- *Target authority*: the target repository's owner or context governs every effect. An authorized agent may still post a review result, such as the record, to the target; that act is under the target's authority, not this Skill's. Review grants no authority and never approves, merges or decides.

**Version.** The text is versioned by the commit it is read at. Name a commit when citing or testing it. The record schema is `kaal-review/1`; there is no other version scheme.
