# SWIPE mnemonic: Testing (target)

One runnable RED Case, `T1.red.mjs`. It fails because `engineering/SWIPE.md` does not exist. It is kept out of the default CI run so CI stays green; the DO renames it `T1.test.mjs` and it goes green.

Run: `node -e "import('./T1.red.mjs').then(m => m.run())"`

| Case | Requirement | What it shows |
| --- | --- | --- |
| mnemonics/T1 | F1, F2 | The file exists with the KAAL Definition front matter of DISCO, the heading and first sentence, the statement that Show WIP keeps its name, and the statement that it owns no instruction, capability or control. |
