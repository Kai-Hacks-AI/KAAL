---
name: kaal-intent
description: Help the Owner say what is wanted and why, with its outcomes and boundaries, without drifting into requirements, architecture or implementation; check that a file is an Intent and take its exact identity so it can be established, reviewed and measured against. Use when something wanted has to be stated before work begins, when an Intent must be described, checked or given its identity, or when you are asked to review one.
license: MIT
compatibility: Needs Node.js 20 or later. It needs no other package.
---

# Intent

Use this to help describe an Intent, to check that a file is one, and to take its identity. What this capability means to KAAL is stated by the Nodes `Skill` and `Intent` in the installed KAAL: read them there, by following references from Core. This file only tells you how to do the work.

## What belongs to whom

Intent primarily serves the Owner: the one whose want it is. Anyone may help to describe it; that it is what the Owner wants is the Owner's to say, and no file records that. Intent owns no process: when an Intent is owed, who reviews it, where it is kept and how an outcome is judged against it are decided by whatever asks for it. It prescribes no template.

## Steps

1. **Start from the Owner's own words.** If they have thought aloud, begin there and keep their terms. When they ask for a draft, give one, marking the places where you assumed something; ask at most the one question whose answer would change the draft most, not a questionnaire.
2. **Say what is wanted and why.** The outcomes wanted, in terms of what is true or possible afterwards, and the reason each is wanted. Say the boundaries the outcome must respect: what must not happen, what is not wanted, what is deliberately left open. Use the headings and shape that fit this Intent; none is required. Keep it short enough for the Owner to hold all of it.
3. **Keep how out.** Requirements, Architecture and implementation belong to the work toward the Intent, not to it. When one comes up, tell the Owner you noticed it and set it aside; do not write it into the Intent. The exception is a method the Owner actually wants (for example "it must not use X"): that is a boundary, and it stays only when it is their want and not a convenient guess of yours.
4. **Check it.** The file begins with the line `# Intent` (a title may follow on that line). `node scripts/intent.mjs check <file>` exits 0 only for an Intent in that mechanical sense (valid text, `# Intent` head, something after it, `\n` line ends, a final newline). It cannot show that the Intent says what is wanted, stays within boundaries or is what the Owner wants; that is judgement.
5. **Establish it.** When the Owner says it is what they want, take its identity: `node scripts/intent.mjs identity <file>` prints the SHA-256 of its exact bytes. From then on those bytes never change. A different want is another Intent, another file, another identity; an Intent that cannot be delivered as stated is not edited to fit.
6. **Review is another capability.** Where the optional `kaal-review` Skill is installed, an Intent may be reviewed like any result, with `--of Intent` and the identity above. Intent does not decide whether, when or by whom.

## Rules

- Do not write what the Owner has not said or would not say; do not fill a boundary with what you expect to be welcome.
- Do not put Requirements, Architecture or implementation in an Intent, and do not write the Intent's reasons so that they argue for a design.
- Do not edit an established Intent. Do not claim an Intent is established because it is checked: the Owner's say-so is not an artifact.
- Intent adds no metadata, status, approval or version, and knows nothing of Git, GitHub, any process or any host.

## Scripts

- `scripts/intent.mjs check <file>`: exit 0 only for an Intent; otherwise 1 with the reason on standard error; 2 on usage. It writes nothing.
- `scripts/intent.mjs identity <file>`: prints the identity and exits 0 only for an Intent; otherwise 1; 2 on usage. It writes nothing.
