# Requirements in the flat layout: Intent

> PLAN (`requirements/C17`). It ships no Node, Skill or package change and authorizes no promotion, version change or npm publication. It plans only the move of Requirements from the 3 Nov collector into the layout main has today.

Requirements lives on a collector cut on 3 Nov as `packages/skills/kaal-requirements`. Main lays capabilities out flat as `packages/kaal-<name>` and names Hosting by its scope, `@kaihacksai/kaal-hosting`. A sync of the old collector into main's rules was not workable, so Requirements is re-landed on a collector cut from main, `kaal/requirements/port`.

- **requirements/I17.** Requirements' existing, reviewed content (the three Nodes, the five plans, the contract and the tests) reaches main's layout unchanged in meaning. Nothing is rewritten while it moves.
- **requirements/I18.** The move leaves later Changes, such as the External Skill (`requirements/C18`), free to start from a collector that already follows main's rules.
