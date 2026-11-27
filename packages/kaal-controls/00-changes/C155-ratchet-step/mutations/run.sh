#!/bin/sh
# Usage: run.sh <repo root>. Loads each patch alone into a scratch copy of packages/kaal-controls and runs Case T1554.
root=$1; here=$(cd "$(dirname "$0")" && pwd)
cases() { node -e "import('$1/packages/kaal-controls/02-requirements/F213-ratchet-step/T1554.test.mjs').then(async m=>{try{await m.run();console.log('  '+m.id+' GREEN')}catch(e){console.log('  '+m.id+' RED:',e.message.split('\n')[0])}})"; }
echo "judge-ratchet.mjs $(git hash-object "$root/packages/kaal-controls/skills/kaal-controls/scripts/judge-ratchet.mjs") on parent $(git -C "$root" rev-parse --short HEAD)"; echo "baseline (no mutation)"; cases "$root"
for p in "$here"/M*.patch; do
  s=$(mktemp -d); mkdir -p "$s/packages"; cp -r "$root/packages/kaal-controls" "$s/packages/"
  (cd "$s" && patch -s -p1 < "$p") || { echo "patch $p did not apply"; continue; }
  echo "$(basename "$p" .patch)"; cases "$s"; rm -rf "$s"
done
