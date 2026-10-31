# Portability Across Capabilities: Architecture

Each element names, in brackets, the Requirements it answers.

- **hosting/A16** [hosting/F36]: `OS_BOUNDARY` and `osBoundary` join `couplings` and `inspect` in `kaal-hosting/conformance`, which never loads `node:test`. The list is code, not configuration: a package becomes the boundary only through a Hosting PLAN Change.
- **hosting/A17** [hosting/F37, hosting/F38]: `facts` and `specialEntries` live in `src/fixtures.ts`, built to `dist/fixtures.js` and exported as `kaal-hosting/fixtures`. It is test support that other capabilities' tests load, never their production code, and it never loads `node:test`. It is the one module in KAAL that makes a FIFO (through Hosting's `execute`) or a Unix-domain socket (through `node:net`). `facts()` establishes each fact once per process, in a temporary directory it removes. The entry is added to the interface contract of `hosting/A15` (#664) as planned, delivered by `hosting/C17`; whichever of `hosting/C15` and `hosting/C16` lands second adds the row.
- **hosting/A18** [hosting/F39, hosting/F40]: `portability` and `portabilitySuite` live beside `boundary` and `boundarySuite` in `src/boundary.ts` (hosting/A13), and the command gains `--applicability`. `portability` composes `boundary`; it does not change its result or its three cases, so hosting/T39 holds as planned. The classification of a conditional that picks a registration function is `couplings`' (hosting/A12).
- **hosting/A19** [hosting/F41]: `HOSTS.md` ships in `skills/kaal-hosting-boundary/`, which `files` already ships (hosting/A13). Its host table is machine-read by Hosting's own tests in every lane, so the guide is evidence each host checked, not prose.

## Options considered for host-dependent cases

guard/T114 needs a FIFO and a socket in a tree, and on Windows no fixture Node can make places one there (Hosting's answer on #650). The question is who declares and who decides that it is not applicable there.

| Option | What happens | Cost |
| --- | --- | --- |
| A. The capability declares `platforms`, Review accepts it | Guard's revision 2 on #577. | Rejected by the Owner on #577, and by testing/F67: a platform scope outside the boundary is a violation. |
| B. The case calls Hosting's fixture and skips itself | The case decides its own applicability. | Rejected by testing/F47: applicability is established by the harness, never asserted in the case. |
| **C. The case declares a host fact; Hosting establishes it** (proposed) | `{ host: ["kaal-hosting/special-entries"], reason, evidence }` in the capability's declarations; Hosting's `facts()` establishes it on each run; Hosting's audit checks the declaration and puts it to Review. | testing/F47 must admit `host` as a fourth way, established through `facts()`. |

## Change graph

| Change | Owner | Depends on |
| --- | --- | --- |
| `hosting/C16` PLAN: I10, F36–F41, N6, A16–A19; hosting/T42–T46 | Hosting | the Owner's direction on #577 and #668; `hosting/C13` |
| `hosting/C17` DO: `OS_BOUNDARY`, `kaal-hosting/fixtures`, `portability`, the command flag, `HOSTS.md`, the `couplings` conditional, and hosting/T42–T46 in Hosting's lanes | Hosting | `hosting/C16`; `hosting/C14` (the suite it extends) |
| testing/F47 admits `host`, established through Hosting's `facts()`; testing/F67's `osBoundary` from hosting/F36 | Testing | `hosting/C16` |
| guard/C118 revision 3 (#671): guard/T114 uses `specialEntries` and declares `host`; `platforms.mjs` and guard/T132 leave Guard; #654 re-pointed to hosting/F39 | Guard | `hosting/C17` |
| Engineering runs `portability` per capability with its declarations, and establishes `osBoundary` from hosting/F36 (#641, #649) | Engineering | `hosting/C17` |
| Review's record of judgments on host-applicability requests, with PREACH escalation | Review | `hosting/C17` |

It is independent of `hosting/C10`–`hosting/C12` (#629) and of the rename (`hosting/C11`, #657), and changes none of their files.
