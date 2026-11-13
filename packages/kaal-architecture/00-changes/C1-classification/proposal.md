# C1 proposal

For CPO alignment. The Skill is abstract: it knows no organization, domain or technology, and it does not touch how Changes are managed or released.

## 1. The contract of the Skill

Architecture describes the target state of a plateau, final or intermediate. Within it, one question per statement.

| Question | Test | Answer |
| --- | --- | --- |
| Concern | Would it still hold if the means that realize, operate or provide the solution were replaced? | yes: **Solution**, what the solution is and must do. No, because it names those means or how they are used: **Delivery** |

Rules, in at most 120 lines:

1. Split a statement that holds both concerns, by part, never by its dominant part.
2. Name a term that can mean either concern and put it to its author. Do not guess.
3. Keep a constraint with the concern it actually constrains, even when it influences the other: a Delivery constraint that limits what the solution can offer stays Delivery. If the limitation is independently accepted as a Solution requirement, state it explicitly as its own statement. Where context or authority is insufficient, ask.
4. Raise each before design proceeds.

Output per statement: its parts, the finding (none, mixed or ambiguous) and the next move. Travelling between plateaus, and assembling and delivering completed Changes, are other capabilities'. The Skill depends on none of them.

## 2. Placement

The Skill and the package are `kaal-architecture`, developed on the collector `kaal/architecture/classify`. The earlier URBAN package of that name is parked on `kaal/old/architecture` and is not depended on. Ids restart in `architecture/`: C1, I1, F1 to F3, N1, A1, A2, G1, G2, T1 to T8.

## 3. Representative classifications

| Statement | Domain | Parts | Finding |
| --- | --- | --- | --- |
| "A patient who arrives at the emergency ward is seen by a triage nurse within ten minutes." | health care | Solution | none |
| "Triage is staffed by two nurses on a rota that is posted in the ward each Friday." | health care | Delivery | none |
| "The bridge carries two lanes of traffic in each direction, and it is built from steel box girders brought in by barge." | transport | Solution and Delivery | mixed: split |
| "The kitchen serves only the dishes that travel well in the delivery van." | food service | Delivery constraint on what is offered | ambiguous: ask whether the limit is an accepted Solution requirement |
| "The service must be reliable." | public service | none yet | ambiguous: ask |
| "The search runs on three servers behind one address." | software | Delivery | none |

## 4. Verification and the Cases

Comparing recorded answers with a key shows only that they match. The evidence that the Skill produces them is a trial that the author did not run:

- `skill.prompt.txt` holds the Skill as shipped and the ten statements, nothing of the key. Its sha256 is recorded. `skill.raw.txt` is the agent's output, unedited, and the recorded answers must equal it.
- `skill.json` names the observer, who must not be the author, the agent, the model and the date.
- `baseline.*` is the same trial without the Skill, recorded and reported so that what the Skill adds is visible. A baseline that already matches the key is a finding about the Skill.
- A difference from the key is reported, never corrected silently.

Cases: T1 (I1, F1) and T3 (F3) compare the Skill-only answers with the key. T2 (F2) checks that the Skill names the plateau and speaks of no transition, release or change governance. T4 (N1) checks size, that the Skill names no organization, domain or technology, and that no gate exists. T5 (A1) checks the shell and that the key covers both concerns, the two negative findings, software and at least four other domains. T6 (A2) checks the Skill, and T7 and T8 close the two Gaps. Negative statements: S3, S8 and S9 (mixed), S4 and S5 (ask).

## 5. Smallest PLAN

One PLAN and one Change, architecture/C1, onto one component.
