// PLAN-owned examples. Target policy provenance is assessed separately at the Boundary.
export const embed = {
  "schema": "kaal-branching/1",
  "repository": {
    "host": "https://github.com",
    "id": "1415996637",
    "name": "Kai-Hacks-AI/KAAL"
  },
  "roles": [
    {
      "id": "release",
      "category": "promoted",
      "selector": {
        "exact": "main"
      },
      "lifecycle": "retain"
    },
    {
      "id": "integration",
      "category": "collector",
      "selector": {
        "prefix": "kaal/"
      },
      "establishFrom": "release",
      "lifecycle": "delete-after-complete-promotion"
    },
    {
      "id": "change",
      "category": "working",
      "selector": {
        "remainder": true
      },
      "lifecycle": "delete-after-integration"
    }
  ],
  "transactions": [
    {
      "id": "engineer",
      "kind": "engineer",
      "from": "change",
      "to": "integration",
      "repositoryRelation": "same",
      "method": "squash",
      "obligations": [
        "on-target-tip",
        "no-unincorporated-promoted-history",
        "change-claim",
        "governed-integration"
      ]
    },
    {
      "id": "synchronize",
      "kind": "synchronize",
      "from": "change",
      "to": "integration",
      "incorporates": "release",
      "repositoryRelation": "same",
      "method": "merge",
      "obligations": [
        "on-target-tip",
        "strict-forward-progress",
        "preserve-outstanding-work",
        "explicit-resolutions",
        "governed-integration"
      ]
    },
    {
      "id": "promote",
      "kind": "promote",
      "from": "integration",
      "to": "release",
      "repositoryRelation": "same",
      "method": "squash",
      "obligations": [
        "contains-target-tip",
        "validated-head-tree",
        "promotion-order",
        "governed-integration"
      ]
    }
  ],
  "governance": {
    "pullRequest": true,
    "autoMerge": "required",
    "strictFreshness": true,
    "review": {
      "minimumApprovals": 1,
      "independent": true,
      "dismissStale": true,
      "resolveThreads": true
    },
    "checks": {
      "authority": "effective-host-rules",
      "requireCompleteEnumeration": true,
      "requiredIdentity": {
        "name": "Branching",
        "integrationId": 15368
      }
    },
    "claims": {
      "applicability": "when-provider-admitted",
      "provider": "kaal-change",
      "contract": "checkClaim"
    },
    "bypass": "forbidden",
    "promotionOrder": {
      "mode": "fifo-owner-override",
      "enforcement": "manual-preflight",
      "authority": "repository-admin"
    },
    "holds": {
      "authority": "repository-admin",
      "source": "trusted-revision",
      "path": "engineering/github/holds.json",
      "outcome": "held"
    }
  },
  "evidence": {
    "maxObservationAgeSeconds": 60,
    "recheckBeforeMutation": true,
    "recheckAfterMutation": true,
    "requireCompletePagination": true,
    "requireRevisionBinding": true
  }
};
export function external() {
  const c = structuredClone(embed);
  c.repository = {host:"https://github.com", id:"222222", name:"Other/Consumer"};
  const names = {release:"published", integration:"train", change:"task"};
  for (const r of c.roles) {
    r.id = names[r.id];
    if(r.establishFrom) r.establishFrom = names[r.establishFrom];
    if(r.selector.exact) r.selector.exact = "release";
    if(r.selector.prefix) r.selector.prefix = "train/";
  }
  for(const t of c.transactions) {
    t.from = names[t.from]; t.to = names[t.to];
    if(t.incorporates) t.incorporates = names[t.incorporates];
  }
  c.governance.checks.requiredIdentity = null;
  c.governance.holds.source = "authorized-policy-interface";
  c.governance.holds.path = null;
  return c;
}

