# kaal/release/pull-declare: concluding ACT of the collector (4L)

This is the **concluding collector-level retrospective** of `kaal/release/pull-declare` (`pull/F46` to `pull/F49`): the qualification retrospective for the whole collected work. It replaces the file that concluded `kaal/release/pull-next`, which has been promoted to `main`. The retrospective of the individual Change stays where it is, as Change history: `plan/pull-declare`. It is written after the last PLAN, DO and Case change of the collector, by the agent that carried `pull/C12`.

## What the collector holds

- **The declaration of the candidate collectors** (`pull/C12`): `kaal/engineering/collector-capability`, `kaal/guard/registration`, `kaal/retro/skill`, `kaal/release/githooks-split` and `kaal/release/wire-operation` in `declaration.json`, each with a scope that fits its real layout and excludes the others. Declaring a collector does not make it qualify.
- **Evidence patterns** for the Engineering Cases of the collector-capability, with the retro and Guard node tests declared `other`. No `.github`-only installation branch is declared.
- **A partial value, size and unit triple is named in `problems`**, and `chooseNext` is exported. No value, size or unit is recorded.
- **Cases** `pull/T47` to `pull/T50` (green), their fixtures at the heads and with the open DO and ACT applied, the refreshed recorded live run, and the README chapter "Candidate collectors in the declaration".

## Liked

- The CPO's review before the DO caught that the candidates were moving. The Cases now fix no Case id of another Change and read two fixtures, so they hold when a layout changes.
- Declaring is not qualifying: the recorded live run lists all 17 collectors and none qualifies, each saying what it lacks.

## Learned

- A scope that fits one collector today can reach another tomorrow, so the scopes are checked against each other, not only against their own files.
- The recorded evidence must be refreshed with the declaration, or the completeness Case fails.
- A default parameter in a fixture can hide an absent field.

## Lacked

- A statement from the host that this collector qualifies. This file does not claim it: the qualification is a separate run at the exact head after the SYNC, and its raw output is what counts, not this text.
- Executions of the Engineering Cases under a scoped id, so the candidates show "no execution".
- Recorded values, sizes and units, so `next` is judged whenever several qualify.

## Longed For

- A runner that logs every Engineering Case under a scoped id.
- The Owner's values, sizes and units recorded and reviewed.
- Promotion decided by the Owner on the advisory report, not by the report.
