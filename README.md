# Odage

**A layered memory archive built on GenLayer.**

Odage lets communities inscribe historical, artistic, social, or civic memory records — and add successive interpretive layers on top of them without erasing what came before. Old readings stay visible. New readings are placed above them. GenLayer's non-deterministic validator consensus decides how each new layer relates to the archive beneath it: does it agree, contest, repair, mourn, or reframe?

> History should not be overwritten. It should be layered.

**Live app:** [odage.vercel.app](https://odage.vercel.app)

---

## How it works

1. **Create a record** — someone inscribes a base event, object, or testimony. This becomes the record's first layer, the "original surface."
2. **Submit a layer** — another voice adds an interpretation: a different perspective, a counter-memory, a piece of missing context, a moment of grief.
3. **GenLayer classifies it** — the new layer's text, along with the base record and every layer already visible on it, is sent to GenLayer's validator network. Multiple validators independently judge the relationship (`counter_memory`, `repair_layer`, `mourning_layer`, `contested_claim`, etc.) and reach consensus on a single verdict, which is written on-chain.
4. **The archive updates** — the new layer is placed with a visibility treatment (`side_by_side`, `contested_overlay`, `sensitive_reveal`, ...) that determines how it's shown next to earlier layers. Nothing is deleted or hidden by default.

This is not a fact-checking system and it does not verify sources or author identity — see the About page in the app for exactly what the consensus mechanism does and does not guarantee.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **[genlayer-js](https://github.com/genlayerlabs/genlayer-js)** for reading and writing the on-chain contract
- **GenLayer StudioNet** as the target chain
- An injected browser wallet with GenLayer support for signing transactions

## Project structure

```
contract/odage_contract.py     GenLayer intelligent contract (records, layers, consensus)
src/app/                       Next.js routes (landing, explore, create, record, layer, dashboard, about)
src/components/                UI components (PalimpsestStack, ConsensusBadge, SourceTrail, ...)
src/lib/genlayer/client.ts     genlayer-js read/write client, with a local mock-data fallback
src/lib/mock-data.ts           Demo records/layers used when no contract address is configured
src/lib/useWallet.ts           Injected-wallet connection hook
```

## The contract

[`contract/odage_contract.py`](contract/odage_contract.py) defines `OdageContract`, a GenLayer intelligent contract with:

- **Deterministic writes**: `create_record`, `flag_layer` — plain state changes, no AI involved.
- **Consensus writes**: `submit_layer`, `request_reinterpretation` — these call `gl.eq_principle.prompt_non_comparative` to ask GenLayer's validator set to classify how a new layer relates to the archive beneath it. Validators run independently and only commit a result once they agree it's a reasonable, consistent classification.
- **Reads**: `get_record`, `get_layer`, `get_record_layers`, `get_user_records`, `get_user_layers`, and index/summary helpers.

Consensus verdicts follow a fixed schema (`relationship_category`, `visibility_treatment`, `support_level`, `sensitivity`, `keeps_prior_layers_visible`, `requires_warning`, `short_reason`) so the frontend can render every verdict predictably.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

By default the app runs against local mock data (`src/lib/mock-data.ts`) so every page works without a deployed contract. To point it at a live contract, set:

```bash
# .env.local
NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS=0x88122BB5e9712A630A8c1294687F9400CC11780D
NEXT_PUBLIC_GENLAYER_CHAIN_ID=genlayer-studionet
```

Once set, all reads and writes go through `genlayer-js` against StudioNet, and writes are signed by whatever GenLayer-compatible wallet is injected in the browser.

### Tests

Run the receipt-decoding tests with `npm test`. The live `submit_layer` integration test is skipped unless these variables point to a deployed contract and an existing active record:

```bash
GENLAYER_CONTRACT_ADDRESS=0x... \
GENLAYER_PRIVATE_KEY=0x... \
GENLAYER_TEST_RECORD_ID=REC-... \
npm run test:live
```

Use a funded disposable StudioNet account: the live test submits a real layer and therefore changes contract state.

## Deploying the contract

Deploy `contract/odage_contract.py` to GenLayer StudioNet using your usual GenLayer deployment flow (Studio, CLI, or SDK), then set `NEXT_PUBLIC_ODAGE_CONTRACT_ADDRESS` to the resulting address in your deployment environment.

## Deploying the frontend

The app is a standard Next.js project and deploys to [Vercel](https://vercel.com) with zero configuration — just set the environment variables above in the Vercel project settings.
