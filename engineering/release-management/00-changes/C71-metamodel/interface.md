# C71 interface (drafts)

The drafts the DO will install. The model and the views are in `drafts/`. The items below arrive with the DO.

## Intent release/I38

A reviewer or an agent who opens a pull request can follow the reference in its template to a view, and from the view to one global model, and reason from the tracing chain (Intent, Requirement, Architecture, Control, Case, then code or ruleset) as one anchor, both when creating a Change and when understanding it afterwards, without reconstructing KAAL's architecture from scattered documentation.

Owner: engineering (the model at `engineering/metamodel/`); release management owns only the PR-template integration.

## Requirements

- **release/F55** (functional, serves release/I38). There is one authoritative global metamodel that states its purpose, an anchor for semantic reasoning along the trace chain, and carries the chain in order, named INFORMED and defined in `INFORMED.md`: one Markdown file with one Mermaid diagram. Each object and each relationship is defined exactly once, with a status (normative, observed or proposed) and its source. Existing identifiers and keys are preserved. The Owner-confirmed relationships are drawn as normative. Differences between the model and the repository are recorded as mismatches, each with a path that exists, and are not corrected. A pull request is not the authority for the lifecycle state of a Change.
- **release/F56** (functional, serves release/I38). Each PR template has a view that states the same purpose, says which part of the chain it carries, and has the sections Objects, Relationships, Information the template expects, What the reviewer should be able to verify, The INFORMED chapter (a box for each expected concern, ticked or n/a with a reason; process control kept apart from content control), and Outside this template, and an INFORMED chapter (a box for each expected concern, ticked or n/a with a reason; process control and content control kept apart). A view defines nothing, draws only edges of the global model and links to it. The global model indexes every view.
- **release/F57** (functional, serves release/I38). Each PR template names its view by the path `engineering/metamodel/views/<TYPE>.md`, and a reviewer can answer six questions (what the Change affects, which Intent it delivers, what supports the Intent, what each Case tests, which Defects it addresses, what evidence supports the decision) by following the relationships the model names.

## Architecture

- **release/A51** (addresses release/F55, release/F56). The model and the views are Markdown under `engineering/metamodel/`: `metamodel.md` and `views/<TYPE>.md`, where TYPE is the file name of the template (`default` for `pull_request_template.md`). No tool generates them; the Cases read the files. A view selects from the model by naming objects and relationships, and the Cases check that each name is defined.
- **release/A52** (addresses release/F57). A template carries the path of its view in its leading hint comment, which authors and agents read. The reference a reviewer sees in the body, through the visible cue, is open question 3 and is not part of this Change. Installing the references in `.github` is its own Change.
