# Control run records

One JSON file per run of a control's Cases, `<control id with / as ->/<run>.json`, an array of records `{ case, x, run, outcome[, base] }` in the shape of controls/F28. The Change that made the run adds the file and its ACT names it. `engineering/controls/05-src/report-to-records.mjs` writes them from a `kaal-testing` report. The controls package reads this folder (`check-controls.mjs --records`, `evidence.mjs --records`); it holds no rule of its own.
