# Coverage Script: Architecture

Each element names, in brackets, the Requirements it answers.

- **testing/A15** [testing/F34]: `lib/coverage.mjs` only.
  - `cover` gains the `script` option. It runs `npm run <script> -w <workspace>` under c8 when a script is named, and `npm test --if-present -w <workspace>` otherwise.
  - Hosting still realizes the command. No export, dependency or other module changes, and testing/A8's export inventory is unchanged.
  - The README's `cover` entry names the option.

## Ownership

| Who | Owns |
| --- | --- |
| Testing | running the named script under coverage, and what its evidence shows |
| Engineering | which script a lane names for a workspace (`engineering/C6`, #625) |
| Each workspace | which scripts it declares, such as Core's `test:publisher` (`core/C29`) |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `testing/C23` PLAN, this Change | Testing | none |
| DO of `testing/C23` | Testing | `testing/C23` |
| `engineering/C6` DO: the evidence lane passes `script` | Engineering | the DO of `testing/C23` reaching `main` |

`testing/C23` sits beside Testing's 0.0.1 sequence on #601. It touches only `cover`, which 0.0.1's proposed consumer surface does not publish. It goes into `kaal/testing` after #617 (`testing/C12`), one Change at a time.
