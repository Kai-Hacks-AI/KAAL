---
technique: judged-trial
version: 1
---
# judged-trial, version 1

Run fresh agent sessions on a task, with and without your idea, and have a separate session judge the answers against a key written before the treatment.

## Good for

A small trial of whether guidance (a Skill, a prompt, a process) changes what agents write or choose, when you can write down what a good answer looks like.

## Cannot show

A rate, or a result for a setup you did not run. Three runs per arm show whether a clear difference is visible. A judge from the same model family may share the runner's blind spots. If the treatment bundles guidance, example and script, the trial cannot say which part mattered.

## How to run

1. Write the question and the key. Note when you froze the key, then fix the treatment and note when.
2. Run each arm in fresh sessions with the same prompt; the untreated arm gets no treatment. Keep the prompt, the answers and any trace of what each agent opened.
3. Say what fresh meant: memory, project instructions, tools.

## How to score

A session that did not run the answers reads them against the key under shuffled labels, with the arm map held back. Keep what it saw and what it said. Form can also be checked by the judgement script.

## What a challenge must hold fixed

The prompt, the key, the treatment text (by its hash) and the number of runs per arm. A challenge may change the agent, the model, the harness or the judge, and says which in `differs-in`. The key's author should not be the judge, and a challenger who runs the trial in another setup should judge in a setup other than the one that wrote the key.

## Versions

Raise the version when the steps change. A record is read against the version it names, and older versions stay readable here.
