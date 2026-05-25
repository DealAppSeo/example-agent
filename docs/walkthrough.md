# Walkthrough: what happens on `POST /agent/query`

A line-by-line trace of the trust loop, using the false claim "The Eiffel Tower is in Tokyo".

1. **Request arrives** (`src/index.ts`) — Express parses `{ "query": "The Eiffel Tower is in Tokyo" }`
   and calls `handleAgentRequest(query)`.

2. **Trust gate** (`src/agent.ts` → `src/trust-wrapper.ts`) — `checkTrust(query)` runs first, before any
   answer is generated. This is the whole point: the agent cannot assert something it hasn't checked.
   - **Demo mode (default):** POST to the public `https://repid-engine-production.up.railway.app/api/v1/hal/evaluate`
     with `{ text, certainty }`. No API key.
   - **SDK mode (AGENT_ID + TRUSTSHELL_API_KEY set):** `@hyperdag/trustshell`'s `shell.evaluate(text, certainty)`
     runs the same HAL pipeline *and* records a score-event, returning a `repid_delta` for your agent.

3. **HAL responds** — multiple providers fact-check the claim and return a verdict. For the Tokyo claim:
   ```json
   { "decision": "vetoed", "hal_score": ~0.9, "provider_responses": [ { "verdict": "FALSE", ... } ] }
   ```
   (For "The Eiffel Tower is in Paris" → `decision: "clean", hal_score: 0`, providers agree TRUE.)

4. **Decision** (`handleAgentRequest`):
   - `vetoed` → the agent **refuses**: *"I can't make that claim — it failed the trust layer's fact-check."*
   - `flagged` → responds, but tags the response for review.
   - `clean` → responds normally.
   In every case, `trust_metadata` (decision, hal_score, mode, source, checked_at) is attached so the
   caller can see *why* the agent did what it did.

5. **Response** — JSON back to the client:
   ```json
   {
     "agent_response": "I can't make that claim — it failed the trust layer's fact-check.",
     "trust_metadata": { "decision": "vetoed", "hal_score": 0.9, "source": "demo-public-hal", "checked_at": "..." }
   }
   ```

## Where your real agent plugs in
Replace the placeholder in `agent.ts` step 2 with your LLM call. The trust gate already ran, so you only
generate text for claims that passed. To also catch your *own* model's hallucinations, call `checkTrust`
again on the generated answer before returning it (and, in SDK mode, report caught hallucinations to earn
RepID — see the TrustShell SDK `report()` method).
