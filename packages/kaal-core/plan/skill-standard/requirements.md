# Skill Standard: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N25** [core/I27]: The standard is capability-agnostic. Core's check takes only the files it is given, names no capability, reads no registry, and needs the same input to give the same result, whichever path the Skill takes.
- **core/N26** [core/I28, core/I29]: Core judges and reports. It does not decide what a verdict allows. A gate, WIRE or a control owns the policy, and Controls only runs the check.

## Functional

- **core/F92** [core/I27]: Core's payload carries a `Skill Standard` Definition, typed by `KAAL Definition`, beside `CASE` and `LOVE`. It states the vocabulary and conventions, the layout, and that capabilities own their content. It changes neither the Kernel nor the id of any existing Node.
- **core/F93** [core/I29]: `judgeSize` counts the words of a `SKILL.md`, the whitespace-separated tokens of the file as given, line endings alike, and returns one level: `ok` up to 200 words, `soft` above 200, `medium` above 400, `hard` above 600. Exactly 600 is `medium`.
- **core/F94** [core/I29]: Every `soft`, `medium` and `hard` result carries a warning that names the Core rules that apply (`size` always, with `router`, `detail` and the others as they apply) and the three remedies: review the whole router, consolidate, move detail to references. Trimming words is never a remedy. Only `hard` blocks, and it states that delivery is blocked until corrected.
- **core/F95** [core/I27]: `judgeLayout` takes the paths of a Skill directory and finds: no top-level `SKILL.md` (the single entry point), and any top-level entry that is not `SKILL.md`, `references/`, `scripts/` or `assets/`. Anything below those is free.
- **core/F96** [core/I27, core/I28]: `kaal skill check <dir>` judges a Skill directory by `judgeLayout` and `judgeSize`, prints each warning and finding, and exits 1 if there is a `hard` size or a layout finding and 0 otherwise. It reads only `<dir>`.

## Amended

- **core/I14** and **core/N13** (see Intent): Core defines no Skill file format and never rewrites a `SKILL.md`. It states the KAAL standard and counts words.
- **core/F7** stands: a `SKILL.md` follows the Agent Skills standard and is deployed unchanged.
