# VIVA AQUA mnemonic: Testing (target)

One runnable RED Case, `T2.red.mjs`. It fails because `engineering/VIVA-AQUA.md` does not exist. It is kept out of the default CI run so CI stays green; the DO renames it `T2.test.mjs` and it goes green.

Run: `node -e "import('./T2.red.mjs').then(m => m.run())"`

| Case | Requirement | What it shows |
| --- | --- | --- |
| mnemonics/T2 | F3, F4 | The file exists with the KAAL Definition front matter of DISCO, the heading and first sentence, the statement that `kaal-testing` and `kaal-review` keep their names, the statement that neither approves and the Owner decides, and the statement that it owns nothing. |
