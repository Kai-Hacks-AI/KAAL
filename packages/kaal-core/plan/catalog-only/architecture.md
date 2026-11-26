# Catalog only: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A63** [core/F120]: `capabilities`, its `Capabilities` interface and its export in `index.ts` are removed from `register.ts`. The README line and `docs/architecture.md` list `catalog` alone, and Core's own tests call `catalog(dir).skills` and `catalog(dir).exchanges` where they called `capabilities(dir)`.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Remove `capabilities`** (recommended) | One function and its type. | Callers move to `catalog`: Core's tests and README line, and Engineering's embed Acceptance Case. Free while 0.0.1 is unpublished; after it, removal breaks callers. |
| B. Keep it deprecated | Nothing. | A second spelling stays in a published API for good. |

## Effects outside Core

| Change | Owner | Why |
| --- | --- | --- |
| `engineering/acceptance/embed.test.mjs` calls `capabilities` on the packed package and moves to `catalog` | Engineering | It fails against Core's DO until then. |
