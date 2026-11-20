# C19 interface

## Declaration

A control declares `id`, `title`, `description`, `type`, `status` and its Intent in one of two forms, exactly one of them:

- `has: [<id>, ...]`, the Intents as standing objects, linked. The finder does not resolve them.
- `intent: <one sentence>`, what the control is for in its own words, stated. A consumer without Intent records writes this.

A control with neither, or with an empty `intent`, is listed with the problem `intent is missing`. The finder gives each control `intentForm`: `linked` or `stated`. A report shows which, so a stated Intent is never read as a linked one.

`stations` stays `[<station>:<mode>, ...]`. A station is any name made of letters, digits and hyphens, each once; the mode is `detective` or `preventive`. The finder checks the shape and keeps no list of stations.

`findControls(files, links)`: `links` is an optional list of `{ case: <id>, tests: [<control id>] }`. When it is handed in, the Cases of a control are those links and no file's first line is read. When it is not handed in, the first line `// Case <id> tests: <control id>` is read as before.

## State line

The line of a control starts with what it is: `demo/CTL1 · approve Sync · preventive · claimed running · computed designed · ...`. The rest is C16's line as it is. controls/C18 extends the same line in its DO, so the two DOs touch `stateLine` and the second to land adapts.

## What the Skill seeks and offers

`references/exchanges.md` holds the Skill's seeks. Each states a need in ordinary words, names no other capability and has a fallback that works alone:

| Need | Fallback when nothing offers it |
| --- | --- |
| what a control is for, and where the Intents are kept | the control states its Intent in its own words (`intent:`) |
| the points where work passes and what judges it there | any station name the control states |
| the checks that point at a control, and what each showed | Cases read from their first line, and observations a person records, each marked as such |

What the Skill offers is its own description, in `SKILL.md`: telling the four types apart, saying what each control is for, and keeping a claim to what was observed.

## Discovery

`references/discovering-controls.md` puts four questions to the consumer, whoever or whatever holds the answer, and assumes no place, tool or file:

- What states the rule that is required? (directive)
- What stops a breach from taking effect, for whom, inside which boundary? (preventive)
- What reveals that a breach happened, and who sees it? (detective)
- What puts the wanted state back afterwards, and who does it? (corrective)

For each answer the agent writes a draft declaration: the control named by what it controls, its type, what it is for (the Intent, in the form the consumer has), what it has not seen operate, and where it lives as the consumer says. It asks what each is for, and a control with no answer is a finding, an unfounded control. It asks the pairings: a rule nothing detects, a detection nobody acts on, a prevention with no way back. What is not found is recorded as unknown, with what was asked and of whom, never as absent. The draft is for the owner to accept. It carries no status above `designed` and no claim of operation.
