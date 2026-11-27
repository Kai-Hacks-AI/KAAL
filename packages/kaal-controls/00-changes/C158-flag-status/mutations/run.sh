#!/bin/sh
# Usage: run.sh <repo root>. Loads each patch alone into a scratch copy of packages/kaal-controls and runs the Cases T1572, T1573, T1511 and T1510.
root=$1; here=$(cd "$(dirname "$0")" && pwd)
cases() { for c in F216-flag-in-the-run/T1572 F217-judge-running/T1573 F204-claims-compared-with-facts/T1511 F203-control-adapter/T1510; do node -e "import('$1/packages/kaal-controls/02-requirements/$c.test.mjs').then(async m=>{try{await m.run();console.log('  '+m.id+' GREEN')}catch(e){console.log('  '+m.id+' RED:',e.message.split('\n')[0].slice(0,90))}})"; done; }
echo "adapter.mjs $(git hash-object "$root/packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs") judge-running.mjs $(git hash-object "$root/packages/kaal-controls/skills/kaal-controls/scripts/judge-running.mjs") on parent $(git -C "$root" rev-parse --short HEAD)"; echo "baseline (no mutation)"; cases "$root"
for p in "$here"/M*.patch; do
  s=$(mktemp -d); mkdir -p "$s/packages"; cp -r "$root/packages/kaal-controls" "$s/packages/"
  (cd "$s" && patch -s -p1 < "$p") || { echo "patch $p did not apply"; continue; }
  echo "$(basename "$p" .patch)"; cases "$s"; rm -rf "$s"
done
