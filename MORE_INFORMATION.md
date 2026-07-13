# More Information — Odage GenLayer Validation

This document responds to the request for additional evidence that Odage uses a live GenLayer intelligent contract, fetches cited evidence during consensus, and correctly returns contract results to the frontend.

## Live addresses

| Item | Address |
| --- | --- |
| Production application | https://odage.vercel.app/ |
| GitHub repository | https://github.com/Ifem1/odage |
| Current StudioNet contract | `0x88122BB5e9712A630A8c1294687F9400CC11780D` |
| Contract explorer | https://explorer-studio.genlayer.com/address/0x88122BB5e9712A630A8c1294687F9400CC11780D |
| Contract owner and disposable test account | `0x6043A51958414043Bcffe7fdB056c0F177617b18` |
| Superseded StudioNet contract | `0xaF43180cA08981ccc18B20eA88eE340Fd87D663a` |

The disposable account's private key is intentionally excluded from the repository and this report.

## Deployment and transaction evidence

- Current deployment transaction: `0xe6f82ed9f960c26dad88b4d1941f1ad90870544e1c2286438cf23c267a07361b`
- Initial live record transaction: `0x7b6fbfdc69e37323e4c14388d93c1428f151a9005819a13c53ea88d5e2bb42ae`
- Initial sourced layer transaction: `0x42cb23f9bdf867596bbd49031f7e5d643504245ee61cec1e3518e64060ea07fc`

Six additional sourced layers were submitted sequentially. Each transaction reached `FINALIZED`, returned a decoded verdict, and completed before the next transaction was queued:

| Record | Layer | Finalized transaction | Verdict |
| --- | --- | --- | --- |
| `REC-2` | `LAYER-16` | `0xd8fafe68a142fc17c58cd14c33a4ae74f0eb0ab255bfd0899559837a313bad12` | `contextual_expansion` |
| `REC-3` | `LAYER-18` | `0x047509924ac7e7be4e6154b7acf3cdd12fa80dbf6b8b724b29b50c95fa673edc` | `educational_annotation` |
| `REC-4` | `LAYER-19` | `0xecd8951ed4096fc66d7d7d2038dc0e4d0a5414c0f6ebe7ed8cf22a75445b725b` | `educational_annotation` |
| `REC-5` | `LAYER-21` | `0x7198ec69c37907f746590d4242fb4df0a43cb175ad82cb9afe85da38d9276304` | `contextual_expansion` |
| `REC-6` | `LAYER-23` | `0xa6ce1fe60d755f1b1290fc1f234861047abbd59c200a2e882ba30dcc20b14fc6` | `contextual_expansion` |
| `REC-7` | `LAYER-24` | `0xffd397d4c6281ad02efd9cdb9549622021b34c3e3b91273b125b9e5f0dcda1f8` | `contextual_expansion` |

## Final on-chain state

The verified contract summary after the sequential consensus run was:

```json
{
  "flag_counter": "0",
  "layer_counter": "24",
  "owner": "0x6043A51958414043Bcffe7fdB056c0F177617b18",
  "paused": false,
  "record_counter": "18"
}
```

This corresponds to 26 finalized contract transactions: one deployment, 18 record writes, and seven non-base `submit_layer` writes. The count exceeds the requested 20-transaction activity threshold.

## What was verified

1. The runtime dependency declaration is on the required first line of the Python contract.
2. `submit_layer` invokes GenLayer's non-comparative equivalence principle.
3. Validators attempt to fetch submitted source URLs before assigning `support_level`.
4. Unreachable sources are not treated as strong evidence.
5. The nondeterministic callback captures only plain in-memory values; the previous storage-pickling warning is absent from GenVM stderr.
6. StudioNet's live `leader_receipt` array and `result.payload.readable` return shape are decoded by the frontend.
7. Written records and layers can be read back through the contract and are displayed by the production application.
8. Repository tests cover the observed live StudioNet receipt shape and reject missing or malformed layer results.

## Reproduction commands

```bash
npm test
npm run test:live
node scripts/live-flow.mjs
```

The live commands require ignored local environment variables for the disposable private key, current contract address, and test record ID.
