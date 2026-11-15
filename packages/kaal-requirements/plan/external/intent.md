# Requirements stands alone (External use): Intent

> PLAN (`requirements/C15`). It ships no code, Node, Skill or test, and authorizes no synchronization, promotion, version change or npm publication. It answers the CTO's External-use finding (portfolio view of 3 Nov 2026, §6, gaps X3 to X5) for Requirements, as Intent did in `intent/C9` (#986). It needs nothing from Hosting, Core or main.

External use means an agent that has only text, in a repository with no KAAL Engine, no installation and no registration. The portfolio view rates Requirements' External value High, because stating verifiable requirements is a method. That rating is a reading of the text, not a test.

- **requirements/I15.** An agent with only Requirements' text can state a Requirement correctly: one condition that must hold, with the context responsible for it, precise enough to be verified. It needs no Engine, no command and no other file to do so, and the text says what it will and will not write.
- **requirements/I16.** One authoritative text serves Engineering, Embedded and External use. Requirements adds no parallel External copy of its meaning. The Nodes stay the deeper reference, never a prerequisite.

## What the text says today

Read from `origin/kaal/requirements` after #942 and #997 (nothing was run):

| Question | Finding |
| --- | --- |
| Is there a Skill an External agent can be pointed at? | No. The package ships three Nodes (`Requirements`, `Requirement`, `Serves`) and no Skill, and `contract.json` provides none. An outside agent has nothing to be told "read this for that task" |
| Do the Nodes need the Engine? | No instruction does. They read as plain markdown. The one Embedded phrase is the admission clause of the Capability Node ("requires Core's KAAL Capability"), which is true and harmless to a reader who has no Engine |
| Do they say how to state a Requirement? | Only what one is. `Requirement` says what must hold, one condition, held by a business context, verifiable. It gives no plain form, no worked example and no test for "verifiable", so a cold agent must guess at the shape |
| Do they need vocabulary the reader lacks? | Yes, in two places. The identification rule (`<capability>/F<n>`) and `Serves` speak of Nodes and Edges, which are Graph terms. A plain statement of a Requirement has no Node and no Edge |
| What authority do they imply? | `Stating a Requirement authorizes nothing`. They say nothing about where, or whether, an agent writes the Requirement into a repository |
| Does the README need a command? | Its only command (`npx kaal register`) is an Embedded act and is labelled as installation, not as a precondition of stating a Requirement |
