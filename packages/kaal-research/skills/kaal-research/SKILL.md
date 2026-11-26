---
name: kaal-research
description: Record a trial of your own idea on agents, a rehearsal, so a reader who was not there can inspect what was run, rerun it in another setup, and tell what it shows from what it only suggests. Use when you test whether a Skill, prompt or process works, run or judge a trial with agents, challenge someone else's trial, or are asked for a trial report, experiment record or rehearsal. Also finds rehearsal records and checks their form.
license: MIT
---

# Rehearsing your own idea

A rehearsal is your own idea tried on agents. You write it down so that someone who was not there can see what was run, on what, and with what result, and can see how far each claim goes. The record says what happened. It does not say the idea is right; the owner decides that.

## Before the runs

1. State the question and what each outcome would change, and write the key (what a good answer looks like, and the traps in the task) before you write or fix the treatment. Note when you froze it.
2. Do not name the traps in the prompt the agents get. Measure what they can do, not whether they follow a hint.
3. Decide the arms. The untreated arm gets no treatment at all; an older version of the treatment is a treated arm. If you have no untreated arm, say so: the record is still honest, it just cannot claim an effect.
4. Decide how many runs per arm, and say what that number can show. Never invent a threshold.
5. Use fresh sessions, and say what fresh meant: memory, project instructions and tools. If you did not check, say so.

## During and after

1. Keep the prompt, the answers and how they were scored in files inside the record's own folder, never in a temporary place. Name each with its SHA-256.
2. For each run, record whether the treatment reached the agent: `opened` only if an excerpt you keep shows it, otherwise `delivered` or `unchecked`.
3. Have the answers scored by a session that did not run them, blind to the arm where you can, and keep what it saw.
4. Report a favourable, an unfavourable and an inconclusive result alike.

## The protocol

Write the record so that someone with another agent, model or harness can rerun it from the record alone. State the harness that ran the agents. Add a Protocol: the materials a rerun needs (the prompt always; the key, the treatment text or its hash and the notes when they exist), how each arm is run, how and by whom the answers are scored, what a rerun would show that supports your claims and what would go against them. If something a rerun needs was not kept (the sandbox, the texts of the Skills or files used, the settings, the traces), say so in the Protocol; naming the materials is not enough, and a reader cannot tell what is missing. Do not write it from memory afterwards without saying so.

## Challenging a record

To check someone's rehearsal in your own setup, follow its Protocol, change only what your setup forces, and write your own record with `challenges: <its id>`. Say in `differs-in` what differs (agent, model, harness, judge, materials, or none), and give an `outcome`: `replicates`, `differs` or `inconclusive`. If the Protocol cannot be followed, say what was missing; that is a result. Do not edit the record you challenge.

## Techniques

A technique is a named way of running and judging a trial, with a version. Name the one you used in the record as `<name>@<n>`. Read [judged-trial](references/techniques/judged-trial.md) for the one that exists so far; when you change the steps of a technique, raise its version, and keep the old one readable.

## The record

Read [rehearsal](references/rehearsal.md) for the fields and [the example](references/example-rehearsal.md) for a record of a real trial. Each claim gets a scope: `description` (what these runs did), `comparison` (the arms differed) or `effect` (the treatment caused it). Mark a claim `yes` only if its scope's conditions hold; otherwise `partly` or `no`, and say what is not shown. The verdict names the claims it rests on and the scope it is about, and is favourable only if those claims are `yes`. Claims beyond it may stay open.

## Script

`node scripts/find-rehearsals.mjs <file>...` lists rehearsals and refuses what does not fit (exit 2 when anything is refused). `node scripts/judge-rehearsal.mjs <record> [<files.json>]` checks form only, given a JSON list of `{ "path": ..., "sha256": ... }` for the files you hold: `well-formed`, `malformed` with the rules broken, or `unjudged`. It cannot tell whether a trial is sound, and a well-formed record may be wrong.
