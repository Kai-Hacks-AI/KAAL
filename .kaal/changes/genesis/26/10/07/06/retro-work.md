# Retro

## Learned

That the missing transition was one step, not a design. By hand on a scratch copy of Enercon the whole path already worked, so the Change was about making that step a command that Core still decides, and about what must refuse. The larger lesson was in composition: the only place a Skill says what it needs beside it is a free-text field, so refusing an incomplete installation meant reading YAML. I had expected one small helper and learned that 'read the declaration' is an open-ended promise, because each round found another spelling of the same string (folded, quoted, escaped, below the key line, an indented mapping, an escaped key). What ended it was no longer decoding more forms but bounding what is accepted and refusing the rest before any write.

## Liked

That the Owner's decisions came on the first review and were small enough to follow literally: explicit IDs, a repeatable select, separate commands, this repository's packages. I liked that every review finding came with a reproduction I could turn directly into an acceptance test, so each fix was proved at the moment it was made. I liked that the proof stayed outside the host: a scratch clone of Enercon with its remote removed, so nothing could be pushed by accident, and a throwaway package root for the cases the real packages cannot show.

## Lacked

A machine-readable need. I said so in the Requirements and again in two later comments, and I still spent three rounds hardening a reader of prose that exists only because that declaration does not. I also lacked a YAML parser I was willing to depend on; I chose a small decoder with refusal and offered the parser twice without an answer, so the surface grew each round. I could not run the review's own environment, and the one real external host is a repository with a single README, so how a host with its own skills directory or AGENTS.md conventions behaves is shown only by my own stand-in.

## Longed

For a Skill to declare what it needs in a place the installer can see by its Node ID, so that refusal is a lookup and not a reading of text, which would retire most of what the last four rounds built. I longed for sealing and closing to be deliverable the way state now is, so a host that has installed KAAL can also finish a Change. And for a published delivery, so installing into a repository does not need a checkout of this one beside it.
