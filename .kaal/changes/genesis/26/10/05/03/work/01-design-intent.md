# Two-agent retrospective independence: intent

Make the two retrospectives of a Change genuinely two perspectives, and be exact about how much of that KAAL can establish and how much the way a Change is carried out must ensure. This Change designs the sharpening and then makes it: the wording of Changing KAAL's Skill and retro reference and the evaluator's next-step message, and nothing more. It is one coherent Change, closed once, with the implementation living where it belongs (packages and engineering) and this Work holding the design and the evidence.

## Observation

A completed Change has `retro-work.md` and `retro-observe.md`. The audit shows what that proves: two files present beside a sealed Work. It does not show that the second was written by someone other than the one who did the work, and nothing in KAAL could, since a retro carries no authorship and a self-review can be saved under either name.

## Intent

The two files exist to carry two distinct views of one Change:

```
the worker                  performed the Change             writes retro-work.md     inside view
the observer      did not perform it, examines the result    writes retro-observe.md  outside view
```

```
I did the work   ≠   I independently observed the work
```

What matters is independence of perspective, not the number of documents. The observer is not the approver: observation produces evidence, and whether a Change is admitted is another decision.

## The process this intends

The Change reaches the observer in one exact state: Work sealed, and exactly `retro-work.md` written by the worker. That is the handoff. The worker stops there. It does not write `retro-observe.md`, and it does not arrange for it to be written.

```
work → seal Work → worker writes retro-work → HANDOFF
     → independent observer reads sealed Work + retro-work, writes retro-observe
     → observer text incorporated, unchanged in substance → seal Change → admission
```

KAAL establishes the state and the requirement. At the handoff the worker stops. The next actor to occupy the observer seat must be independent: it must not have participated in the Work or in the worker's execution. It is given the observer's role, input and output. How an actor comes to occupy that seat is outside KAAL. Only after the observer's contribution is incorporated may the Change be sealed. The process must actively guide this sequence; requiring two files in order does not.

A counterexample sets the bar: a worker that, before any handoff, spawns its own fresh sub-agent to fill `retro-observe.md`, and closes the Change itself. The sub-agent has a clean context, but it came out of the worker's own execution, and the Change never stopped at the handoff. The observation was produced inside the worker's execution, so it is not the outside view. A fresh context is necessary and not sufficient.

## Stance

- Use what KAAL already has: the Work seal, the Change seal, the two retros, the process evaluator, the Agent and its instructions, and the Skill that carries them. Add identity or role machinery only if a requirement cannot be met without it.
- Separate what KAAL can prove from artifacts from what the carrying-out of a Change must ensure, and say so openly rather than let a check imply more than it proves.
- Independence is not provider identity. It is a property of the observer's position, not of its vendor.
- Do not weaken sealing, duplicate the evaluator, or bring in the concepts of whatever hosts the work.
- Keep it small.

## Out of scope

- Which work to do next or how it is selected.
- Whether and when a Change is admitted into the lineage, and any rule of admission.
- Changes already closed, which stay valid as sealed.
