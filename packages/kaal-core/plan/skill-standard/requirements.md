# Skill Standard: Requirements

Each Requirement names, in brackets, the Intents it serves, and says what verifies it.

## Nonfunctional

- **core/N25** [core/I27]: The standard is capability-agnostic. Core's check takes only the files it is given, names no capability, reads no registry, and gives the same result for the same input, whichever path the Skill takes. Verified by core/T106.
- **core/N26** [core/I28, core/I29, core/I30]: Core judges and reports. It does not decide what a verdict allows. A gate, WIRE or a control owns the policy and the baseline file, and Controls only runs the check. Verified by core/T106 (exit status and data) and core/T108.
- **core/N27** [core/I27]: No Core rule contradicts the Agent Skills standard. Core's rules are stricter, never different. Verified by core/T105 (a Skill of `SKILL.md` alone, the Agent Skills minimum, passes clean) and by the Owner's review of the DO against agentskills.io, a judgement.

## Functional

- **core/F92** [core/I27]: Core's payload carries a `Skill Standard` Definition, typed by `KAAL Definition`, beside `CASE` and `LOVE`. It states the vocabulary and conventions, that agentskills.io is the floor, the router and `lane` rules, that the frontmatter is reviewed separately, and that capabilities own their content. It changes neither the Kernel nor the id of any existing Node. Verified by core/T107.
- **core/F93** [core/I29]: `judgeSize` counts the words of a `SKILL.md` body: the whitespace-separated tokens after the frontmatter. The frontmatter is the block from a first line `---` to the next line `---`, found without reading its fields; a leading byte order mark is ignored, and a file with no such block, or an unterminated one, counts whole. Line endings do not change the count. It returns one level: `ok` up to 200 words, `soft` above 200, `medium` above 400, `hard` above 600. Exactly 600 is `medium`, and passes. Verified by core/T103.
- **core/F94** [core/I29]: Every `soft`, `medium` and `hard` result carries a warning as data: the Core rules that apply (`size`, `router`, `detail` and `lane` at every stage), the three remedies (review the whole router, consolidate, move detail to references), a `response` stage, and the actions the stage requires. The required actions of a higher stage include all of those of the lower one and more: `review-router` at `soft`, plus `restructure` at `medium`, plus `correct-before-delivery` at `hard`. Trimming words is never a remedy. Only `hard` blocks. Verified by core/T104.
- **core/F95** [core/I27]: `judgeLayout` takes the paths of a Skill directory and finds: no top-level `SKILL.md`, and any top-level entry that is not `SKILL.md`, `references/`, `scripts/` or `assets/`. `SKILL.md` alone is a complete Skill. Anything below the permitted folders is free. Verified by core/T105.
- **core/F96** [core/I27, core/I28]: `kaal skill check <dir> [--json] [--baseline <file>]` judges a Skill directory by `judgeLayout` and `judgeSize`, and reads only `<dir>` and the baseline. Its exit status is what a gate relies on: 0 when nothing blocks (`ok`, `soft`, `medium` and a known baseline entry included), 1 when something does, 2 when it cannot judge (no such directory, unreadable file or baseline), which a gate treats as unknown and never as clean. With `--json` it prints the verdict as data. The directory is the candidate as data, so a gate may run Core from its base or default branch. Verified by core/T106.
- **core/F97** [core/I30]: The `skill-size` ratchet. A baseline is a JSON object from a Skill's directory name to its recorded body words. Against it, a `hard` Skill is `known` when its words equal the entry and passes; `grew` when above it and blocks; `new` when it has no entry and blocks. An entry whose Skill is now below its recorded words is `stale` and blocks until the entry is lowered or removed, so the allowance only shrinks and a resolved finding leaves it. With no baseline, `hard` blocks. An unreadable baseline is exit 2. Verified by core/T108.
- **core/F98** [core/I27]: The frontmatter is not counted, and Core reads none of its fields. Its upstream conformance is Engineer Skill's `checkSkill` (a result), and its clarity and concision are a review's judgement. No Test Case judges them. Verified by core/T103 (not counted), and by judgement for clarity and concision.

## Amended

- **core/I14** and **core/N13** (see Intent): Core defines no Skill file format and never rewrites a `SKILL.md`. It states the KAAL standard, finds where the frontmatter ends and counts words.
- **core/F7** stands: a `SKILL.md` follows the Agent Skills standard and is deployed unchanged.
