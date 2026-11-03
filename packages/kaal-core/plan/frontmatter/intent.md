# Deterministic Frontmatter: Intent

This is `core/C5`, a PLAN Change. It states why KAAL needs deterministic frontmatter, what it requires, where the responsibility lies, and the outer tests that decide it. It ships no code; `core/C6` turns the tests from RED to GREEN.

People and Agents collaborate on Markdown artifacts. The YAML frontmatter is the part a machine acts on, and the Markdown body is the part people and Agents read and interpret. KAAL keeps that boundary strict, so what a machine decides never rests on prose.

- **I1.** Whatever an artifact's frontmatter determines (an execution, a dependency or a verdict) can be read from the frontmatter alone, deterministically. No machine decision depends on the body.
- **I2.** An artifact whose frontmatter breaks its rules is identified before anything acts on it, and the reason is named.
