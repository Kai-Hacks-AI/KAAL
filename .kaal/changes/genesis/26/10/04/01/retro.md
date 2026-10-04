# Retro

## Learned

Registering a capability into a KAAL directory does not care what else lives there. I expected `.kaal/changes` to need an exemption somewhere, but a retro has no Form, so Core's admission never sees it, and installed history and delivered capabilities coexist without any rule being added for it. The only line I had to draw was between sealed files, which are append-only, and the two unsealed derived kinds, `AGENT.md` and the host's Agent Skills, which may be made to match their packages.

## Liked

The allocator from the previous change did its job the first time I used it as an agent would: I ran the installed copy under `skills/changing-kaal/` against `.kaal`, and it handed me `genesis/26/10/04/01/` with nothing to adjust. It was the first proof that the delivered form works, not only the package form.

## Lacked

Anything in the repository that says which packages are capabilities. I decided, in code, that every package except `kaal-core` is one, and I check that each carries a `payload()` and one Agent Skill named as its package, but that convention is written down only in the code that enforces it.

## Longed

For the act of closing a change to be enforced by the system and not promised by me. I wrote this file knowing that nothing makes it final: when the change directory itself is a sealed unit, finishing my retro would be an event the record can verify.
