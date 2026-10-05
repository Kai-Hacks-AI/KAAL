# Two retrospectives: what is guaranteed today

Audited by reading the process evaluator, Changing KAAL's Skill and its retro reference, the Change and Work sealing, and the Agent machinery, and by running the commands on a throwaway KAAL directory. Nothing here is a proposal; it is what the machinery does.

## What the process evaluator requires

The one evaluator derives a stage from files and seals alone. For the two retrospectives it checks, and only checks:

- the Work is sealed before either retro may be present (a retro beside an unsealed Work is a problem; `seal work` refuses if any retro exists);
- `retro-observe.md` without `retro-work.md` is a problem;
- closing requires both files to be present, as regular files.

It does not read either file. A file's content, form, size, authorship and relation to the other are not examined: an empty `retro-observe.md` satisfies it.

## What is and is not ordered

Ordering is enforced at the commands, in time: a command refuses to run out of step, and the state reports the next step. A closed Change is a snapshot, and a snapshot of two present files shows no sequence. Probe: with a sealed Work, one actor wrote a one-line `retro-work.md` and an empty `retro-observe.md` in one go and closed the Change; the evaluator said `CHANGE CLOSED`, no problems. So after the fact KAAL proves that both files exist beside a sealed Work, not that one was written before the other.

## What is frozen, and when

- `work/` is frozen by its own seal; any later change to it is reported as a problem, and closure refuses.
- Neither retro has a seal of its own, by design. Both are frozen only by the Change seal at closure. Between writing and closure either file can be edited without any check noticing, including by the other writer.
- The Change seal covers `work/` and both retros, so closed evidence is immutable and the Change's own sealing is not in question.

## What Changing KAAL's instructions say

- `retro-work.md`: written "by the worker who performed the change", from inside the Work, after the Work is sealed.
- `retro-observe.md`: written by "an observer from outside the Work", after `retro-work.md` exists, who "reads the sealed work/ and retro-work.md".
- The retro reference states: "Who the observer is (another agent, a human, or otherwise) is not decided here." Each retro is "its writer's own". The form of a retro forbids "identity of the writer, role labels".

So the instructions name two seats and require their ordering, require them to be different seats, and decline to say who fills the observer seat. They say nothing about what the observer may modify, nor what it should not be told.

## Is a role identifiable?

No, and by explicit rule. Neither file carries authorship; the form forbids it. Nothing records who performed the Work. The Agent Node defines how an agent uses KAAL, with BASS as an escalation ladder of prescription; it has no notion of a role, an identity or two distinct agents, and no other machinery in the repository does either. The seals identify bytes, never actors.

## Can one agent satisfy every deterministic check while playing both seats?

Yes. One agent can do the work, write both retros and close the Change, and no deterministic check can tell. That includes the same agent in one context. The two filenames evidence two documents, not two perspectives.

## Summary

| property | today |
|---|---|
| Work frozen before the retros exist | enforced at the commands; sealed |
| `retro-work.md` and `retro-observe.md` both present at closure | enforced |
| `retro-work.md` was written before `retro-observe.md` | guided at the commands; not provable from a closed Change |
| each retro is frozen at the point its writer finishes | not provided; both frozen at closure |
| `retro-observe.md` has the right form, or any content | not checked |
| the observer did not perform the Change | not provable, not stated beyond "from outside the Work" |
| the observer did not alter the Change | Work: detected. `retro-work.md`: not detected |
