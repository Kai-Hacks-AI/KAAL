# track Work for KAAL (consumer and configuration)

`node engineering/release-management/05-src/track-work-kaal/run.mjs [--view cpo|cto] [--stage s] [--station s] [--collector c] [--waiting-for w] [--repo owner/name]` prints where each piece of Work is, from the capability in `../track-work/` and KAAL's `config.json`.

`config.json` is the only place KAAL's choices live: `model` (the default branch, the `kaal/` prefix, the `verify Envelope` check, the stage and station of each position, the order of positions, the ordered waits, which condition is provisional, how a title names a Change and a path a record folder) and `views`, each a named set of selectors. KAAL's views are `cpo` (`waitingFor: approval`) and `cto` (`waitingFor: fix, pull-request`), with no station restriction. A selector on the command line replaces the same selector of the view; several values are separated by commas. `--role` is refused.

The envelope is the verdict of `verify Envelope`; until that control reports, it is read as unknown and shown as provisional. The npm deployment request is not read yet and is printed as an `incomplete:` line. A live run needs `gh` GraphQL, so run it where GitHub is reachable.

Cases: `config.test.mjs` (T72, T73 and KAAL's T38 to T42).
