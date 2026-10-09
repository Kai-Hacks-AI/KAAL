# Alternative: one Node for the complete HOW ARE WE DOING? concept

Raised by the Owner on #77 as an architectural reconsideration while the Change is open, not as an instruction to overwrite the existing Nodes. Compared against the current realization (separate sealed `HOW` and `ARE`, plus `references/how-are-we-doing.md` as provenance). Nothing on the branch was changed for this comparison; the variant below was built and installed only in a scratch worktree (never pushed) so that a fresh Agent could be tried on it.

## The variant, as built and tried

One KAAL Definition, `HOW ARE WE DOING?`, referring to Review by ID. It states the four-part mnemonic and says the parts are one concept and not four capabilities; carries HOW and ARE with the same wording as the current Nodes (including the two Reviewer findings' corrections); states WE and DOING as meaning only, owned by whatever capabilities own durable knowledge, and records the origin (KAAL-genesis #65, `cfc110c6…`). It admits in Core (`name` accepts the spaces and the question mark; the file is `HOW-ARE-WE-DOING.md`), seals, installs with `--select <Review ID>` and passes `check-kaal-install`. The Node text, for the record:

```
---
name: HOW ARE WE DOING?
type:
  name: KAAL Definition
  id: 17bf407006223729ebcfa04476cb1ef9f0012a9f352d6a14ad37c43fde73f53a
---

# HOW ARE WE DOING?

HOW ARE WE DOING? is a mnemonic for one feedback concept around Review 7c3d4d8e6f56f9d3a6bf6e49d1ed912ec1808ac44e61541196160ddf9ab46d5f: work is observed by a human, challenged by independent agents, informed by experience, and its durable observations inform what later work sets out to do.

```
HOW     Human Observes Work
ARE     Agents Review Each-other
WE      With Experience
DOING   Durable Observations Inform Next Goals
```

The four parts are one concept and not four capabilities. HOW and ARE are ways of reviewing and Review owns them. WE and DOING are what happens to what reviews find, and Review does not own them: experience is not conversation history and not a new kind of record, a review round is transient evidence, and an observation becomes durable by moving to the capability that owns its meaning. Nothing here is a store of observations, and no part of it is a capability of its own.

## HOW

HOW is Review with a human taking part in it while it happens. The human observes the result as it stands and the examination of it, is shown each finding as it was found and not only a summary, and is able to respond to them and direct the review. Taking part is interaction with the review while it happens: a human who only reads the record of a finished review has read it, and has not observed the work. That participation is what defines HOW. It does not matter who the human is, which account or channel they use, or whether the examining is done by the human, by an agent or by both. An agent may assist the human by running checks, carrying evidence, relaying questions and keeping the record, but an agent that assists is not the human observing, and a review in which no human observed the result as it stands is not HOW however it is described.
A human taking part adds no authority. A review that is HOW still examines a result and reports findings or convergence, and nothing more: it is not approval, and it does not establish, accept or carry out the result, which stay with whatever owns them. Whoever examines holds the seat under the authority and in the independence Review asks of any reviewer, so a human's presence does not excuse an examiner that is not independent of whoever made the result. A round in HOW says, in plain words, that a human took part and what they observed of the result the round names. Like every such statement, it is something to inspect and is not proof.
HOW does not say when a human must observe a review: whatever asks for the review decides that. It says only what is being asked for when HOW is asked for. HOW is part of Review's meaning, optional with it: it is not Core, a valid embedding does not need it, and embedding KAAL does not install it.

## ARE

ARE is Review in which an agent examines the result of another actor and reports without needing a human to take part in the ordinary course. Each-other says that any agent may review the result of another and have its own reviewed by a different one; what makes a review ARE is that the examiner is an agent and is not the actor that made the result, and that its judgment was not supplied, selected or steered by the one whose result it is. A helper that the maker starts on its own side to examine its own result is part of the maker, and that is not ARE.
Independence here is of judgment and not of product. A different model, provider, tool, account or context does not by itself make an examiner independent, an examiner of the same kind may be, and more examiners are not better review. Nothing here measures independence. The round states in plain words under whose authority the examiner holds the seat and in what independence of the maker; like every such statement it is something to inspect and is not proof, and an examiner that cannot truthfully make it is not an examiner under ARE and does not report convergence.
ARE needs no human in a round. A human may read the record at any time, and reading it afterwards does not make a round HOW. A human who takes part while the review happens, is shown its findings and is able to respond to them, makes the rounds they take part in HOW as well. ARE grants no authority: no agent acquires authority to review, or to approve, establish or carry out anything, merely because it is able to, and convergence among agents is not approval. ARE does not say who the examiner is or when ARE suffices; whatever asks for the review decides that. ARE is part of Review's meaning, optional with it: it is not Core, a valid embedding does not need it, and embedding KAAL does not install it.

## WE and DOING

WE, With Experience, is what separates this concept from a loop of producer, reviewer, repair and next task. DOING, Durable Observations Inform Next Goals, is its feedback effect: not every observation deserves to survive, and one earns durability when its meaning matters beyond the work at hand. Both are stated here as meaning only. Establishing them belongs to the capabilities that own durable knowledge, and until those exist they are not established. The concept was first recorded as an Idea in the historical KAAL-genesis repository (pull request 65, commit cfc110c6a8497821e99ef425b2ce1023ff72fccd), as a possibility with provisional wording.
```

## Comparison

| Question | One complete Node | Separate `HOW` and `ARE` + provenance reference (current) |
|---|---|---|
| Does a fresh Agent given only `HOW Review of PR75 please` find and apply the meaning? | Yes, when it works from the checkout (one run, below). | Yes (one run, below, same text). Equal. |
| Can a Process cite HOW and not ARE, unambiguously? | Not by identity. The reference grammar is `{name, id}` and cannot address a part, so a Process cites the whole concept's ID and says "part HOW" in its own prose. The Agent in the run said so itself. | Yes: `{HOW, id}` and `{ARE, id}`. |
| Does it preserve the complete concept and its provenance? | Yes, inside the sealed Node. | Yes, in the reference file (editable), not inside any sealed identity. |
| Is the concept kept distinct from its realizations (WE and DOING not Review-owned)? | Only by sentence. The Node is Review-owned and sealed, and it puts the whole loop, including the half Review does not own, under one authoritative identity. | Yes: the authoritative identities are the two Review meanings; the loop is provenance. |
| What happens when `kaal-learning` is realized? | WE and DOING cannot be edited. The Node can only be superseded, and the installer has no supersession rule; every Process citing it by ID keeps pointing at the old text. Any wording change to WE or DOING changes the identity that HOW and ARE are cited by, though HOW and ARE did not change. | Nothing changes for HOW and ARE. A third, umbrella Node can be born later, referring to `HOW`, `ARE` and whichever Learning Nodes then exist (born-before allows it). |
| Can it be split later? | Not without supersession. | Is already split, and can be joined later by an additive Node. |
| Premature authority? | It gives a sealed identity to the whole loop now, which Learning has not established. | It does not. |

## Recommendation

Keep the current realization. The deciding need for separate Nodes is concrete: a Process must refer to HOW or to ARE by `{name, id}` and not redefine either, and a part of a Node has no identity of its own. The deciding asymmetry is that the split is additive later and the union is not: an umbrella Node for the complete concept can be born after `HOW`, `ARE` and the Learning Nodes exist, citing them; a single Node cannot be taken apart again without the supersession the installer does not have. If you want the complete concept to be a Node now, the smallest form is an umbrella that refers to the two sealed Nodes and says nothing of WE and DOING beyond "carried by the capabilities that own durable knowledge", and it is a third Node, not a replacement. I recommend deferring that until Learning exists. Your call; independent Review judges the Work before anything is sealed or closed.
