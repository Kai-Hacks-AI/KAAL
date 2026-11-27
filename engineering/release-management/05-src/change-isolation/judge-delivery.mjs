// verify Delivery (release/CTL23, release/C160): a change that touches a delivery location contains only delivery paths.
//   node judge-delivery.mjs --head <sha> --base <sha> --base-ref <name>
// The rule is `deliveryMixed` of engineering/change-isolation/check.mjs over the delivery declaration (release/A67), run through the controls adapter in detective mode:
// it reports and gates nothing. The verdict is PASS, REPORT (a path that is not delivery next to a delivery path) or UNKNOWN (the changed paths or the declaration cannot be read).
import { fileURLToPath } from 'node:url';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { deliveryMixed } from '../../../change-isolation/check.mjs';
import { readLocations } from '../delivery/locations.mjs';
import { cli, report } from './lib/report.mjs';

const ID = 'release/CTL23';

// `declaration` names another declaration file to read; unset, the checker reads the one of the architecture. A declaration that cannot be read throws, and the adapter says UNKNOWN.
const delivery = ({ paths, declaration }) => {
  if (!Array.isArray(paths) || !paths.every((p) => typeof p === 'string')) throw new Error('the changed paths are not a list of paths');
  return deliveryMixed([...new Set(paths)], declaration ? { read: () => readLocations(declaration) } : {});
};

export async function check({ paths, declaration, mode = 'detective', boundary } = {}) {
  return report(await runControl({ id: ID, mode, check: delivery, input: { paths, declaration }, boundary }));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await cli({ check, label: 'verify Delivery' }));
