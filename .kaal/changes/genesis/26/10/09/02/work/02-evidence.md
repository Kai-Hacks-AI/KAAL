# Evidence

What was read and run in this Change. Nothing was sealed, no Node was touched, and no helper was started to act as a Reviewer.

## Conventions checked

- No `architecture/` directory or other architecture document existed on `kaal/genesis` (7613ad9). The only architectural authorities are Nodes: `CASE`, `Core`, `Agent`, `Skill`, `Extension` in `.kaal/core/`. `BRAIN`, Processes and the Engineer / Embed / External modes appear in no Node.
- Each directory documents itself in its own README and the root README only points; the new root README section is one pointer line.
- `isolate-boundaries` constrains only `packages/kaal-core/`, `engineering/kaal-core/` and `.github/`; this Change touches none of them. No sealed Node and no seal was changed, and the diagram is not a Node (nothing in KAAL's rules makes a diagram one).
- `.kaal/AGENTS.md` is Core's entry (`packages/kaal-core/artifacts/AGENTS.md`) and is protected, so it is not changed. The root `AGENTS.md` keeps its wired fragment unchanged and gains one line outside it; `npm run check-kaal-agent` still exits 0.

## The reference diagram

The supplied reference diagram was not delivered to the Worker: the root message of the thread carried no image the Worker could open. `overview.svg` is therefore built from the briefing's own words (three columns, Agent / KAAL / Six Ds, the contents and framing it names) and a restrained neutral palette with one slate accent. Layout, grouping order, arrows, wording of the small captions and colours are the Worker's reading and may differ from the reference. The assignment of Destination, Discovery and Defence to individual Ds is not stated in the briefing and is not drawn.

## Run

`overview.svg` is well-formed XML (`xmllint --noout`) and was rendered headless in Chromium at 1220 x 840 to check that no text overflows its box.

## Owner's follow-on note

A later note from the Owner (relationship to D3, Design Architecture) is recorded in `architecture/overview.md` as written; D3's Way of Working is deliberately not defined here. It is a note on the Work, not a revision of the Intent in `work/01-intent.md`, which is unchanged.
