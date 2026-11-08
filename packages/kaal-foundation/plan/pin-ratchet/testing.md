# Testing

Provisional Case numbers; none is added or enrolled by this PLAN.

- **T54** [foundation/F30, F31]: a consumer on an older pin is `pin-behind`, held, exit 4; a consumer on the
  current version is not flagged.
- **T55** [foundation/F32]: a consumer below a declared floor fails naming the floor; no floor declared means no
  failure.
- **T56** [foundation/N18]: the acceptance host holds one copy per needed version, and the workspace version has
  exactly one copy; two copies of the same version fail.
- **T57** [foundation/F33]: promotion or publish of a flagged consumer raises one Owner ask; nothing before it.
- Changed Cases (owners above): `engineering/acceptance/embed.test.mjs:167` and C17's negative case, narrowed,
  not removed.
- Negative: a nested copy of the workspace version itself still fails.
