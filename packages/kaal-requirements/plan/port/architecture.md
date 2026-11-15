# Requirements in the flat layout: Architecture

- **requirements/A22. Move, not rewrite** [requirements/F30, requirements/F31]. The DO copies the old package tree to `packages/kaal-requirements` and changes only what main's layout forces: the root workspace entry, the lockfile, the ownership path and Hosting's scoped name.
- **requirements/A23. Collector** [requirements/F30]. Work lands on `kaal/requirements/port`, cut from main, then goes to main as one promotion.
- **requirements/A24. Order** [requirements/I18]. This PLAN, then its tests RED, then the DO. The External Skill DO (`requirements/C18`) and the RED tests of `requirements/C16` (#1005) follow on a collector cut from the result.
