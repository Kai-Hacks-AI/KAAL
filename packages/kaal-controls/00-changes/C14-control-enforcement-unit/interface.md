# C14 interface

## Declaration

`stations: [Integrating:preventive]`, an optional line of a control. One entry per station, `<Station>:<mode>`. A Station is Developing, Collecting, Integrating, Hotfixing, Wiring, Promoting or Publishing. A mode is `detective` or `preventive`. It is a list of `Station:mode` and not of maps, because the finder reads one `key: value` line at a time. The finder lists `stations: [{ station, mode }]` for every control, and a bad line is one problem of `stations` with a recovery that names the stations and modes.

## Script

`registry.mjs --repo <dir> --base <ref> --station <S>` prints the controls registered at S in the files of `<ref>`: `id`, `title`, `mode`, `status`, `path`. It reads Git, never the working tree. Exit 1 when the ref cannot be read.

## Reference

`references/enforcing-controls.md`: what a station and a mode are, why the registry is read from the base, and when a control should be preventive at a station.
