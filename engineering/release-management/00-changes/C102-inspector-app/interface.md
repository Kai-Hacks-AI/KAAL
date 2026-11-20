# C102 interface

Drafts as they are added in the DO. The Cases read them; the element Cases read the element's own file once it exists. The paths `judge.mjs` and `sign.mjs` are those of controls (slices 2 and 3); if their names change there, the DO follows them.

## Draft of I55.md

`````
---
id: release/I55
title: the Inspector acts with least privilege and the judge never holds the key
---
# release/I55 the Inspector acts with least privilege and the judge never holds the key

Contract: the GitHub App "KAAL Inspector" holds only the permissions that posting one check per control needs, never opens, approves, merges or pushes anything, and the part of its workflow that judges a change holds no secret: only a separate signing job holds the key, and it runs nothing from the change it signs. Reason: a check that is required and pinned to the App is trusted because of who posts it, so what the App can do, and what can reach its key, must be as small as the judgement. Owner: release management; controls keeps the concept and the rules the Inspector enforces.
`````

## Draft of F79.md

`````
---
id: release/F79
title: inspector-least-privilege-and-separation
kind: functional
serves: [release/I55]
---
# release/F79 inspector-least-privilege-and-separation

The manifest of the Inspector App lists exactly `checks: write`, `contents: read`, `pull_requests: read` and `metadata: read`, no webhook and no subscribed event, and no permission to write contents or pull requests, to set statuses, to administer, to approve or to merge. The workflow of the Inspector has a judge job and a sign job. The judge job holds only `contents: read`, names no secret, checks out the base commit as the trusted judge and reads the change as Git data. The sign job needs the judge job, is the only job that names the key, checks out only the base commit, never code of the change, and uses the verdicts only as data. A verdict that is missing or unreadable is posted as a failure; UNKNOWN never passes. The requirement states what release owns, the identity and the separation, and not the rules the Inspector enforces.
`````

## Draft of A70.md

`````
---
id: release/A70
title: inspector-app-manifest-and-workflow
addresses: [release/F79]
---
# release/A70 inspector-app-manifest-and-workflow

The source `05-src/inspector/app.json` is the manifest the Owner creates the App from: its name, its four permissions, an empty list of events, no webhook and the name of the secret that holds the key. The source `05-src/wiring/workflows/inspector.yml` runs on `pull_request` and on `merge_group`: its judge job checks out the base commit, fetches the head as Git data and runs the controls registered at the station, and uploads the verdicts as an artifact; its sign job needs the judge job, downloads the verdicts and posts one check per control with the key, from a checkout of the base commit and never of the change. The judge, the sign step and the workflow template are those of controls (kaal-controls); this architecture only instantiates them for KAAL and states the separation. Installing the workflow under `.github/workflows` is a WIRE, creating the App and storing the key are the Owner's, and requiring the check in a ruleset is a later Change.
`````

## Draft of app.json

`````
{
  "name": "KAAL Inspector",
  "description": "Posts one check per registered control on the exact head of a pull request. It never opens, approves, merges or pushes.",
  "public": false,
  "hook_attributes": { "active": false },
  "default_events": [],
  "default_permissions": {
    "checks": "write",
    "contents": "read",
    "pull_requests": "read",
    "metadata": "read"
  },
  "key_secret": "INSPECTOR_PRIVATE_KEY"
}
`````

## Draft of inspector.yml

`````
name: inspector
# release/C102. Judges the controls registered at the station and signs one check per control. The judge job holds no secret; only the sign job names the key.
on:
  pull_request:
    branches: ['**']
  merge_group:
    types: [checks_requested]
permissions: {}
jobs:
  judge:
    name: judge Controls
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
      PR_NUMBER: ${{ github.event.pull_request.number }}
      MERGE_GROUP_HEAD_REF: ${{ github.event.merge_group.head_ref }}
    steps:
      - name: Check out the base, the trusted judge
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
          fetch-depth: 0
          persist-credentials: false
      - name: Fetch the proposed head as Git data
        run: |
          if [ -n "$MERGE_GROUP_HEAD_REF" ]; then
            git fetch --no-tags origin "+${MERGE_GROUP_HEAD_REF}:refs/remotes/pull/head"
          else
            git fetch --no-tags origin "+refs/pull/${PR_NUMBER}/head:refs/remotes/pull/head"
          fi
      - name: Judge the controls registered at the station
        run: node packages/kaal-controls/skills/kaal-controls/scripts/judge.mjs --base "$BASE_SHA" --head refs/remotes/pull/head --out verdicts.json
      - name: Keep the verdicts as data
        uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9 # v7.0.2
        with:
          name: verdicts
          path: verdicts.json
  sign:
    name: sign Controls
    needs: judge
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      BASE_SHA: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
    steps:
      - name: Check out the base, never the change
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ github.event.pull_request.base.sha || github.event.merge_group.base_sha }}
          persist-credentials: false
      - name: Take the verdicts
        uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
        with:
          name: verdicts
      - name: Post one check per control
        env:
          INSPECTOR_PRIVATE_KEY: ${{ secrets.INSPECTOR_PRIVATE_KEY }}
        run: node packages/kaal-controls/skills/kaal-controls/scripts/sign.mjs --verdicts verdicts.json
`````

