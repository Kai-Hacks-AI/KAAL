# Pull Promotion wiring: Testing (target)

One runnable Case, `T14.red.mjs`, unwired, so CI stays green. It fails because the command does not exist (RED). It needs a runner with Node and one supported credential (pull/F15) and a host state that is otherwise quiet; it is not part of the default CI run. Run it from a checkout of the head under test: `KAAL_LIVE=<owner/repo> KAAL_COLLECTOR=<collector> node -e "import('./T14.red.mjs').then(m => m.run())"`. The runner is not specified: a person's machine, a CI job or an agent session.

| Case | Requirement | What it shows |
| --- | --- | --- |
| pull/T14 | F14 to F18 | The connected path on the real repository prints the verdict of one real collector with owners and missing evidence; every invocation (failing, successful and the record run) is audited and the audits show only reads to the repository's host; the snapshot of host state is identical before the first invocation and after the last, the final one taken after all of them; an insufficient or missing credential and an unreadable host fail naming what could not be read; the run emits an acceptance record tied to the exact implementation head, the host state observed and the audits inspected. It states what it does not prove. |
