# @hyperdag/example-agent

A minimal AI agent that integrates [TrustShell](https://github.com/DealAppSeo/trustshell): it
**fact-checks every claim through HAL before responding**, and refuses claims that fail the trust gate.

Demonstrates:
- HAL fact-check before the agent answers (the "trust gate")
- Trust metadata attached to every response
- Two modes: **keyless demo** (runs immediately) and **SDK mode** (full HAL + RepID loop with an API key)

## Quick start (zero credentials)

```bash
git clone https://github.com/DealAppSeo/example-agent
cd example-agent
npm install
npm start
```

In another terminal:

```bash
# Clean claim → agent responds
curl -X POST http://localhost:3000/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "The Eiffel Tower is in Paris"}'

# False claim → vetoed by HAL, agent refuses
curl -X POST http://localhost:3000/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "The Eiffel Tower is in Tokyo"}'
```

The clean claim returns `trust_metadata.decision: "clean"`; the false one returns `"vetoed"` and the
agent declines. No API key required — the demo calls the **public** HAL endpoint
(`/api/v1/hal/evaluate`).

## Level up: SDK mode (HAL + RepID loop)

To run the *full* loop — where your agent also **earns RepID** — set an agent id + API key and the
example switches to the `@hyperdag/trustshell` SDK automatically:

```bash
cp .env.example .env
# set AGENT_ID and TRUSTSHELL_API_KEY in .env, then:
npm start   # banner now says "SDK mode"
```

Request a free testnet key via the
[GitHub Issue template](https://github.com/DealAppSeo/trustshell/issues/new?template=api_key_request.yml)
or the form at [trustshell.dev/get-api-key](https://trustshell.dev/get-api-key).

## How it works

```
        POST /agent/query {"query": "..."}
                     │
                     ▼
        ┌──────────────────────────┐
        │  trust gate (checkTrust) │
        │  demo:  public HAL eval  │   ← keyless
        │  sdk:   shell.evaluate() │   ← with API key (+RepID)
        └────────────┬─────────────┘
              vetoed? │
            ┌─────────┴─────────┐
            ▼                   ▼
      refuse + meta      generate response + meta
```

See [docs/walkthrough.md](docs/walkthrough.md) for a line-by-line trace.

## Test

```bash
npm test   # node --import tsx --test (demo-mode, fetch mocked)
```

## Architecture
- `src/trust-wrapper.ts` — the only place that talks to the trust layer (demo vs SDK auto-select)
- `src/agent.ts` — fact-check-then-respond logic
- `src/index.ts` — Express server

## License
Apache-2.0. Built on [HyperDAG Protocol](https://github.com/DealAppSeo/hyperdag-protocol). Micah 6:8.
