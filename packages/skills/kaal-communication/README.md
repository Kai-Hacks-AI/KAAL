# kaal-communication

KAAL Communication: how Agents and people exchange messages and hand over work, with one meaning whatever system carries the messages. It is not part of Core. Core provides the `KAAL Skill` and `KAAL Definition` types and admission, and this capability joins through them.

```
payload/Communication.md            the Skill Node, typed by Core's KAAL Skill
payload/Transport.md                the Definition every Transport Extension realizes
payload/Handover.md                 the Definition of a Handover and its records
skills/kaal-communication/          the Agent Skill: SKILL.md, references/, scripts/
```

The Nodes carry what Communication means to KAAL. The Agent Skill tells an Agent how to do the work and points to the Nodes. It assumes no host and no particular Transport.

## Boundaries

This package knows no Transport. It names no system, depends on no Transport Extension, and its tests and examples use fictional participants and `example.com` references only. A Transport Extension depends on it, never the other way around: its realization is a Node typed by `Transport`, which Core admits only into an Engine that already holds this package's `Transport`. Repository acceptance checks both directions.

`Transport` is deliberately small. Every Transport realization is typed by its exact id, so any change to it is a new `Transport` that every realization must be re-pinned to.

## Handover records

A Handover is recorded as a Node typed by `Handover`, kept wherever every session of a project can read it, outside the Engine. The record Form is in `skills/kaal-communication/references/handover-record.md`. A record no other record answers is open.

```sh
kaal-open-handovers <records-dir> --engine .kaal
```

It lists open and answered records, and reports any record Core does not admit against the Engine, any record missing a required section, and any answer to a record that does not exist. It exits 0 when every record is sound, 1 when any has a problem, and 2 on misuse. The API is `judge(engineFiles, recordFiles)`, which touches no host; the command reads both directories through kaal-hosting.

## Register the Nodes

```sh
npx kaal register skill kaal-communication node_modules/kaal-communication/payload
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
