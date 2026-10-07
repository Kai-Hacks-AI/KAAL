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

## Review round 01

One finding: `write` followed symbolic links, so a linked `incidents/` could take a carrier outside the KAAL directory. Resolved in both scripts (same code): `core/` and every existing component of `<carrier dir>/YY/MM/DD` must be a real directory, checked with `lstat`, or `write` refuses with nothing written; acceptance covers a linked carrier directory, a linked dated directory, a dangling link and a linked `core/`.

## Review round 03 and the Codex review

Round 03 (a freshly started Reviewer subagent, no earlier round context; same model and GitHub identity as the Worker) converged. A Codex review on the PR (commit `00a24fc`) then raised two P2 findings, both real and resolved in both packages:

1. A symbolic link as the KAAL directory itself was accepted: `write` now resolves the given path (a trailing slash no longer hides a link), refuses unless the KAAL directory is itself a real directory, then applies the existing `core/` and path-component checks. Acceptance covers the link with and without a trailing slash and that nothing lands behind it.
2. Each `SKILL.md` told the agent to commit the carrier when the KAAL directory is version-controlled, importing repository policy into a capability whose scope ends at local carriage. The instruction is removed; what becomes of a carrier beyond the KAAL directory is stated to be the client's. Acceptance holds each manifest free of instructions to commit, push, publish or submit.

Also corrected: `SKILL.md` said the KAAL directory is "by default `.kaal`" although the script requires it to be given; it now says it is always given, usually `.kaal`.

Acceptance is now 21 tests per capability in `engineering/kaal-incident` and `engineering/kaal-request`.
