# Evidence

## Acceptance (`engineering/kaal-incident`, `engineering/kaal-request`, `npm test`; 21 tests each)

- **Delivery.** Core carries no such Skill; registering through Core's `registerSkill()` adds exactly one Node and its seal, found by its type alone; bytes and identity are the sealed ones (`KAAL Incident` `ae64416e…cd97e`, `KAAL Request` `1f7c0632…48a0`); the Node says what a carrier is, that it is addressed to KAAL, kept locally with the embedded KAAL, optional, and that transport, submission and collection are other problems, and names no mechanism, Git, GitHub, network, process or client; the Agent Skill is one skill, points at the Nodes and declares no sibling; the one script knows nothing of Git, GitHub, a network, a process or any client; both pass `check-skill` and `register-skill --check`.
- **The form.** Canonical bytes written out as literal text; any flag order; `@file` for several paragraphs; dated path `incidents/26/10/07/01.md` relative to the KAAL directory; numbering one after the highest, no gap reused, 99 refused, another day starts at 01; today in UTC by default; empty part, heading line, bad date, a directory with no `core/` or with `core/` a link (nothing made in it), a carrier directory or dated directory that is a symbolic link, dangling or not (nothing lands at the link's target), missing, repeated and unknown flags refused with nothing written; `check` accepts exactly the form and rejects fifteen near forms, including the other kind's title; no verb but `write` and `check`.
- **On a host** (a repository with a README, not KAAL): `install-kaal` alone leaves Core only and no `skills/`; a name selects nothing; `--select <Node ID>` installs the capability and projects its Agent Skill, not the other capability; `check-kaal-install` holds; a carrier made there is a plain file under `.kaal/incidents/` (`requests/`) and nowhere else, `check` accepts it, `check-kaal-install` does not report it, and installing again, with or without `--select`, changes nothing.
- Existing acceptance in `engineering/kaal-install` (37) and all others still pass; root `npm test` is green, and `check-kaal-seals`, `check-kaal-config` and `check-kaal-install` exit 0.

## A run on a scratch repository that is not KAAL

```
$ npm run list-kaal-capabilities -- --into <host>
Skill	kaal-incident	KAAL Incident	ae64416e366aaaab8ca71fbde9586ca099fb9d9393186eb3aab5b6e9bd2cd97e	not installed
Skill	kaal-request	KAAL Request	1f7c06321c96b72fb4f37cc8a5034f4da4d7d0a52fbf7256402c8d7ed49248a0	not installed
$ install-kaal --into <host> --select <KAAL Incident id>        exit 0
$ node <host>/skills/kaal-incident/scripts/incident.mjs write <host>/.kaal --happened … --expected …
incidents/26/10/07/01.md
$ check-kaal-install --into <host>                               exit 0
```

## What the Work found

The install check reported a carrier in `.kaal/` as "not delivered by any package". The installer therefore has to know that carriers are installed state, as it knows `changes/`; that is the one change outside the two capabilities (`engineering/kaal-install`, repository engineering, not shipped).

Nothing was pushed to any other repository and no external client was involved.

## Review provenance (corrected after the Worker's disclosure on the PR)

Rounds `review/01.md` to `review/04.md` were written by subagents the Worker started and briefed (round 01 and 02 by one subagent, resumed; 03 and 04 by freshly started ones, also posted as PR comment reviews). They are Worker-side probes, not the independently supplied Reviewer, and nothing below counts them as Reviewer evidence. They are kept as written and are not edited or removed. What they found is real work that was resolved, listed here for the record:

- Round 01: `write` followed symbolic links below the KAAL directory. Resolved: `core/` and every existing component of `<carrier dir>/YY/MM/DD` must be a real directory (`lstat`).
- Rounds 03 and 04: no findings.

## Codex review of `00a24fc` (not appointed by the Worker)

Two P2 findings, both real, resolved in both packages in `fd6fd07`:

1. A symbolic link as the KAAL directory itself was accepted.
2. Each `SKILL.md` told the agent to commit the carrier, importing repository policy into a capability whose scope ends at local carriage. The instruction is removed; what becomes of a carrier beyond the KAAL directory is stated to be the client's, and acceptance holds each manifest free of instructions to commit, push, publish or submit.

Also corrected then: `SKILL.md` said the KAAL directory is "by default `.kaal`" although the script requires it to be given; it now says it is always given, usually `.kaal`.

## Review round 05 (the Reviewer supplied by the Owner: a ChatGPT/Codex session directed by Kai, separate from the Worker session)

Two findings against the Work at `be5d15d0…`:

1. Both writers still wrote through a symbolic link in an *ancestor* of the KAAL directory (`alias/.kaal` with `alias` a link), because `lstat` covered only the final component and below. Resolved in both scripts: every component of the resolved absolute path of the KAAL directory, from the root, is checked, and a symbolic link anywhere refuses with nothing written. Acceptance covers the link as an ancestor, further up, absolute, absolute with a trailing slash, relative and relative with dot segments, asserts no carrier appears behind it, and that the same directory by its real path is accepted. A relative path spelled from inside a linked working directory cannot be detected, because the operating system reports the working directory by its real path; that case already is the real path.
2. This evidence presented round 03 as a converged Reviewer pass. Corrected above.

Acceptance was then 22 tests per capability in `engineering/kaal-incident` and `engineering/kaal-request`. The Change's process state, as `change-state` prints it, reads "converged" from round 04; per the Owner's account of the review, that answer comes from a withdrawn Worker-side round and is not evidence of independent convergence. No independent round has yet converged on the Work as it now stands.

## Review round 06 (the Owner-supplied Reviewer)

One finding against the Work at `70b7ea66…`: `resolve(given)` collapsed `segment/..` before the link check saw it, so `alias/../.kaal` (with `alias` a link to `outside/deeper`) named `outside/.kaal` to the operating system but was written as `./.kaal`, a different KAAL instance. Reproduced in both writers. Resolved: the supplied path is never normalised first. Both writers walk it component by component from the root (the working directory for a relative path), look at each component with `lstat` before the next is applied, and refuse the first symbolic link; a `..` after only real directories is the plain parent. Acceptance (23 tests per capability now) covers relative, `./`, absolute and trailing-slash spellings of `alias/../.kaal`, asserts no carrier in either instance, shows `outside/deeper/../.kaal` through real directories still names `outside/.kaal` and writes there, and that `..` alone is refused as not a KAAL directory.
