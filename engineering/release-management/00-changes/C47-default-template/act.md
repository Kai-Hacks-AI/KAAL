# C47 act

A 4L retrospective of the Change, from the viewpoint of the agent that carried it.

## Liked

DEFAULT stays the fallback and gets the same HOW TO WORK table as the typed templates, so a PR that matches no template is still readable as a hand-over chain. T670 to T672 turned green with `05-src/wiring/templates/default.md`, and the existing chapters were left as they were.

## Learned

Because DEFAULT is not tied to a PR type, its five rows stay generic: Predecessor, Worker creates the branch and a draft PR, Worker does the work, Reviewer, Successor merges. Anything more specific belongs to a typed template, and adding it here would turn the fallback into a seventh type.

## Lacked

A rule for when a PR may use DEFAULT at all. The flow says a PROMOTION uses its own template, but no check yet says which PRs are allowed to fall back.

## Longed For

The WIRE of all six templates in one pass, with DEFAULT last so that nothing falls back to a stale text during the move.

## Follow-ups

- Promote C47 with the other template collectors, in the CPO's order.
- WIRE the DEFAULT template to `.github/pull_request_template.md`; it travels alone.
